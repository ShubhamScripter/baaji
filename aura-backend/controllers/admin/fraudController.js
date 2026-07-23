// controllers/admin/fraudController.js
// Read + action endpoints behind the admin panel's "Risk & Fraud" page.
// Every handler is superadmin-only (see requireSuperadmin in the route file):
// these responses expose player identities from across the whole downline.

import FraudCluster from '../../models/fraudClusterModel.js';
import SubAdmin from '../../models/subAdminModel.js';
import UserDevice from '../../models/userDeviceModel.js';
import { evaluateKey, riskLabel } from '../../services/fraudDetection.js';

// Statuses a superadmin may set from the "Manage account" modal.
const ACTIONABLE_STATUSES = ['suspend', 'lock', 'active'];

const serialiseCluster = (cluster) => ({
  _id: cluster._id,
  clusterId: cluster.clusterId,
  keyType: cluster.keyType,
  keyValue: cluster.keyValue,
  signals: cluster.signals,
  deviceIds: cluster.deviceIds,
  ips: cluster.ips,
  members: cluster.members,
  memberCount: cluster.memberCount,
  riskScore: cluster.riskScore,
  riskLabel: riskLabel(cluster.riskScore),
  totalApprovedDeposits: cluster.totalApprovedDeposits,
  status: cluster.status,
  acknowledged: cluster.acknowledged,
  firstDetectedAt: cluster.firstDetectedAt,
  lastDetectedAt: cluster.lastDetectedAt,
});

/**
 * Member status is denormalised onto the cluster at detection time, so it goes
 * stale as soon as someone is suspended. Refresh it on read — the row count here
 * is small (members of the clusters on screen).
 */
const withFreshMemberStatus = async (clusters) => {
  const ids = clusters.flatMap((c) => c.members.map((m) => m.userId));
  if (!ids.length) return clusters;

  const accounts = await SubAdmin.find({ _id: { $in: ids } }).select(
    'status lastLogin'
  );
  const byId = new Map(accounts.map((a) => [a._id.toString(), a]));

  for (const cluster of clusters) {
    for (const member of cluster.members) {
      const fresh = byId.get(member.userId.toString());
      if (fresh) {
        member.status = fresh.status;
        member.lastLogin = fresh.lastLogin || member.lastLogin;
      }
    }
  }
  return clusters;
};

export const getFraudClusters = async (req, res) => {
  try {
    const { search = '', status, limit = 50 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;

    let clusters = await FraudCluster.find(query)
      .sort({ acknowledged: 1, riskScore: -1, lastDetectedAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200))
      .lean();

    const term = search.trim().toLowerCase();
    if (term) {
      // Free-text across every identifier the UI advertises in its search box:
      // IP, phone, email, device, username, cluster id.
      clusters = clusters.filter((c) => {
        const haystack = [
          c.clusterId,
          ...(c.deviceIds || []),
          ...(c.ips || []),
          ...c.members.flatMap((m) => [m.userName, m.email, m.phone, m.lastIp]),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    await withFreshMemberStatus(clusters);

    return res.status(200).json({
      success: true,
      data: clusters.map(serialiseCluster),
      total: clusters.length,
    });
  } catch (error) {
    console.error('[FRAUD] getFraudClusters failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getFraudSummary = async (req, res) => {
  try {
    const clusters = await FraudCluster.find({ status: { $ne: 'dismissed' } })
      .select('members memberCount signals acknowledged riskScore clusterId deviceIds ips lastDetectedAt')
      .lean();

    const memberIds = new Set();
    for (const c of clusters) {
      for (const m of c.members) memberIds.add(m.userId.toString());
    }

    const suspended = memberIds.size
      ? await SubAdmin.countDocuments({
          _id: { $in: [...memberIds] },
          status: { $in: ['suspend', 'lock', 'inactive'] },
        })
      : 0;

    const pending = clusters.filter((c) => !c.acknowledged);
    // Newest unacknowledged cluster drives the red banner at the top of the page.
    const latest = pending.sort(
      (a, b) => new Date(b.lastDetectedAt) - new Date(a.lastDetectedAt)
    )[0];

    return res.status(200).json({
      success: true,
      data: {
        flaggedClusters: clusters.length,
        accountsUnderReview: memberIds.size,
        suspendedInClusters: suspended,
        sharedIpSignals: clusters.filter((c) => c.signals.includes('ip')).length,
        sharedDeviceSignals: clusters.filter((c) => c.signals.includes('device'))
          .length,
        unacknowledged: pending.length,
        latestAlert: latest
          ? {
              _id: latest._id,
              clusterId: latest.clusterId,
              memberCount: latest.memberCount,
              deviceId: latest.deviceIds?.[0] || null,
              ip: latest.ips?.[0] || null,
              detectedAt: latest.lastDetectedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[FRAUD] getFraudSummary failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getClusterById = async (req, res) => {
  try {
    const cluster = await FraudCluster.findById(req.params.clusterId).lean();
    if (!cluster) {
      return res
        .status(404)
        .json({ success: false, message: 'Cluster not found' });
    }

    await withFreshMemberStatus([cluster]);

    // Per-account device/IP detail for the review drawer.
    const links = await UserDevice.find({
      userId: { $in: cluster.members.map((m) => m.userId) },
    })
      .select('userId deviceId deviceSource lastIp lastSeen loginCount')
      .lean();

    const devicesByUser = links.reduce((acc, link) => {
      const key = link.userId.toString();
      (acc[key] = acc[key] || []).push(link);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: { ...serialiseCluster(cluster), devicesByUser },
    });
  } catch (error) {
    console.error('[FRAUD] getClusterById failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

/** Suspend / Lock / Activate one account from inside the review drawer. */
export const updateClusterAccountStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, remark } = req.body;

    if (!ACTIONABLE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${ACTIONABLE_STATUSES.join(', ')}`,
      });
    }

    const account = await SubAdmin.findById(userId);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: 'Account not found' });
    }
    if (account.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'Only player accounts can be actioned from Risk & Fraud',
      });
    }

    account.status = status;
    if (remark) account.remark = remark;
    // Suspending without clearing the session leaves the player logged in until
    // their JWT expires, which defeats the point of the action.
    if (status !== 'active') account.sessionToken = null;
    await account.save();

    return res.status(200).json({
      success: true,
      message: `Account ${account.userName} set to ${status}`,
      data: { userId: account._id, status: account.status },
    });
  } catch (error) {
    console.error('[FRAUD] updateClusterAccountStatus failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

/** Mark the banner as seen; clears the sidebar badge for that cluster. */
export const acknowledgeCluster = async (req, res) => {
  try {
    const cluster = await FraudCluster.findByIdAndUpdate(
      req.params.clusterId,
      {
        $set: {
          acknowledged: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: req.admin || req.id,
          status: 'reviewed',
        },
      },
      { new: true }
    );

    if (!cluster) {
      return res
        .status(404)
        .json({ success: false, message: 'Cluster not found' });
    }

    return res
      .status(200)
      .json({ success: true, data: serialiseCluster(cluster) });
  } catch (error) {
    console.error('[FRAUD] acknowledgeCluster failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

/** Dismiss a cluster as a false positive. It re-opens if a new account joins. */
export const dismissCluster = async (req, res) => {
  try {
    const cluster = await FraudCluster.findByIdAndUpdate(
      req.params.clusterId,
      {
        $set: {
          status: 'dismissed',
          acknowledged: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: req.admin || req.id,
        },
      },
      { new: true }
    );

    if (!cluster) {
      return res
        .status(404)
        .json({ success: false, message: 'Cluster not found' });
    }

    return res
      .status(200)
      .json({ success: true, data: serialiseCluster(cluster) });
  } catch (error) {
    console.error('[FRAUD] dismissCluster failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Rebuild clusters from the device index on demand.
 * Detection normally runs at login; this backfills history that predates the
 * feature and lets a superadmin force a refresh after bulk status changes.
 */
export const rescanClusters = async (req, res) => {
  try {
    const [devices, ips] = await Promise.all([
      UserDevice.distinct('deviceId'),
      UserDevice.distinct('lastIp'),
    ]);

    let evaluated = 0;
    for (const deviceId of devices) {
      if (await evaluateKey('device', deviceId)) evaluated += 1;
    }
    for (const ip of ips) {
      if (await evaluateKey('ip', ip)) evaluated += 1;
    }

    return res.status(200).json({
      success: true,
      message: `Rescan complete — ${evaluated} cluster(s) found`,
      data: { clustersFound: evaluated, keysScanned: devices.length + ips.length },
    });
  } catch (error) {
    console.error('[FRAUD] rescanClusters failed:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};
