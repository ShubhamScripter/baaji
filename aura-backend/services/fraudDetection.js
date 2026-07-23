// services/fraudDetection.js
// Multi-account detection: flags when two or more *player* accounts sign in from
// the same physical device (or the same IP) anywhere in the superadmin's
// downline, regardless of which admin/agent they sit under.

import crypto from 'crypto';

import FraudCluster from '../models/fraudClusterModel.js';
import ManualDepositRequest from '../models/manualDepositRequestModel.js';
import SubAdmin from '../models/subAdminModel.js';
import UserDevice from '../models/userDeviceModel.js';
import { sendFraudAlert } from '../socket/bettingSocket.js';
import { resolveDevice } from '../utils/deviceFingerprint.js';

// A cluster needs at least this many distinct player accounts to be worth an alert.
const MIN_CLUSTER_SIZE = 2;

const shortId = (value) =>
  `CLS-${crypto
    .createHash('sha1')
    .update(value)
    .digest('hex')
    .slice(0, 4)
    .toUpperCase()}`;

export const riskLabel = (score) =>
  score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';

/**
 * Deterministic 0-100 score. Device links score higher than IP links because a
 * shared IP is routinely innocent (household, cafe, mobile carrier NAT) while a
 * shared browser profile is not.
 */
const scoreCluster = ({ keyType, memberCount, deposits, hasClientDevice }) => {
  let score = keyType === 'device' ? 45 : 25;
  score += Math.min((memberCount - MIN_CLUSTER_SIZE) * 15, 30);
  if (deposits > 0) score += 15;
  if (hasClientDevice) score += 10;
  return Math.min(score, 100);
};

/**
 * Record the device/IP this account just logged in from.
 * Best-effort: never throws into the login path.
 */
export const recordLoginDevice = async (user, req) => {
  const { deviceId, deviceSource, userAgent, ip } = resolveDevice(req);

  await UserDevice.updateOne(
    { userId: user._id, deviceId },
    {
      $set: {
        userName: user.userName,
        role: user.role,
        deviceSource,
        userAgent,
        lastIp: ip,
        lastSeen: new Date(),
      },
      $addToSet: { ips: ip },
      $inc: { loginCount: 1 },
      $setOnInsert: { firstSeen: new Date() },
    },
    { upsert: true }
  );

  return { deviceId, deviceSource, userAgent, ip };
};

/**
 * Re-evaluate one linkage key and upsert its cluster.
 *
 * @returns {{ cluster: object, isNew: boolean, newMembers: string[] }|null}
 *   null when fewer than MIN_CLUSTER_SIZE player accounts share the key.
 */
const evaluateKey = async (keyType, keyValue) => {
  if (!keyValue || keyValue === 'IP not found') return null;

  const match = keyType === 'device' ? { deviceId: keyValue } : { lastIp: keyValue };
  const links = await UserDevice.find(match).select(
    'userId userName deviceId deviceSource lastIp lastSeen'
  );

  // Only end-user accounts count. Two agents sharing an office PC is not fraud,
  // and an agent logging into their own player account is a separate concern.
  const byUser = new Map();
  for (const link of links) {
    const key = link.userId.toString();
    if (!byUser.has(key)) byUser.set(key, link);
  }

  const accounts = await SubAdmin.find({
    _id: { $in: [...byUser.keys()] },
    role: 'user',
    status: { $ne: 'delete' },
  }).select('userName email phone lastLogin lastIP status');

  if (accounts.length < MIN_CLUSTER_SIZE) return null;

  const accountIds = accounts.map((a) => a._id.toString());

  // Deposits are the reason a multi-account ring is expensive: bonus abuse.
  const depositAgg = await ManualDepositRequest.aggregate([
    {
      $match: {
        userId: { $in: accounts.map((a) => a._id) },
        requestType: 'deposit',
        status: 'approved',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const deposits = depositAgg[0]?.total || 0;

  // Everything these accounts have in common, so the drawer can show both chips.
  const allLinks = await UserDevice.find({
    userId: { $in: accounts.map((a) => a._id) },
  }).select('userId deviceId lastIp deviceSource ips');

  const sharedDevices = new Set();
  const sharedIps = new Set();
  const deviceOwners = new Map();
  const ipOwners = new Map();

  for (const link of allLinks) {
    const owner = link.userId?.toString();
    if (link.deviceId) {
      if (!deviceOwners.has(link.deviceId)) deviceOwners.set(link.deviceId, new Set());
      deviceOwners.get(link.deviceId).add(owner);
    }
    for (const ip of [link.lastIp, ...(link.ips || [])].filter(Boolean)) {
      if (!ipOwners.has(ip)) ipOwners.set(ip, new Set());
      ipOwners.get(ip).add(owner);
    }
  }
  for (const [device, owners] of deviceOwners) {
    if (owners.size >= MIN_CLUSTER_SIZE) sharedDevices.add(device);
  }
  for (const [ip, owners] of ipOwners) {
    if (owners.size >= MIN_CLUSTER_SIZE) sharedIps.add(ip);
  }

  const signals = [];
  if (sharedDevices.size) signals.push('device');
  if (sharedIps.size) signals.push('ip');
  if (!signals.length) signals.push(keyType);

  const hasClientDevice = [...byUser.values()].some(
    (l) => l.deviceSource === 'client'
  );

  const members = accounts.map((a) => {
    const link = byUser.get(a._id.toString());
    return {
      userId: a._id,
      userName: a.userName,
      email: a.email,
      phone: a.phone ? String(a.phone) : null,
      lastLogin: a.lastLogin || link?.lastSeen || null,
      lastIp: link?.lastIp || a.lastIP || null,
      status: a.status,
      addedAt: new Date(),
    };
  });

  const riskScore = scoreCluster({
    keyType,
    memberCount: members.length,
    deposits,
    hasClientDevice,
  });

  const existing = await FraudCluster.findOne({ keyType, keyValue });
  const knownIds = new Set(
    (existing?.members || []).map((m) => m.userId.toString())
  );
  const newMembers = accountIds.filter((id) => !knownIds.has(id));

  // Preserve original addedAt for members we already knew about.
  const priorAddedAt = new Map(
    (existing?.members || []).map((m) => [m.userId.toString(), m.addedAt])
  );
  for (const m of members) {
    const prior = priorAddedAt.get(m.userId.toString());
    if (prior) m.addedAt = prior;
  }

  const cluster = await FraudCluster.findOneAndUpdate(
    { keyType, keyValue },
    {
      $set: {
        signals,
        deviceIds: [...sharedDevices],
        ips: [...sharedIps],
        members,
        memberCount: members.length,
        riskScore,
        totalApprovedDeposits: deposits,
        lastDetectedAt: new Date(),
      },
      $setOnInsert: {
        clusterId: shortId(`${keyType}:${keyValue}`),
        firstDetectedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // A cluster that a human already reviewed re-opens when a *new* account joins.
  if (newMembers.length && existing && existing.status !== 'open') {
    cluster.status = 'open';
    cluster.acknowledged = false;
    await cluster.save();
  }

  return { cluster, isNew: !existing, newMembers };
};

/**
 * Full login-time hook: records the device, then re-checks the device and IP
 * linkages it participates in. Returns the alerts that should be pushed.
 *
 * Best-effort by design — a detection failure must never block a login.
 */
export const processLoginSignals = async (user, req) => {
  try {
    if (user.role !== 'user') {
      // Still record the device for audit, but staff logins do not form clusters.
      await recordLoginDevice(user, req);
      return [];
    }

    const { deviceId, ip } = await recordLoginDevice(user, req);

    const results = await Promise.all([
      evaluateKey('device', deviceId),
      evaluateKey('ip', ip),
    ]);

    // Only alert on a genuinely new linkage: a brand-new cluster, or an existing
    // one that just gained an account. Repeat logins from a known device are silent.
    const alerts = results.filter((r) => r && (r.isNew || r.newMembers.length > 0));

    for (const { cluster } of alerts) {
      sendFraudAlert(buildAlertPayload(cluster, user));
      cluster.notifiedAt = new Date();
      await cluster.save();
    }

    return alerts;
  } catch (error) {
    console.error('[FRAUD] Login signal processing failed:', error.message);
    return [];
  }
};

/** Shape consumed by the admin panel's banner + toast. */
export const buildAlertPayload = (cluster, triggeredBy = null) => ({
  clusterId: cluster.clusterId,
  _id: cluster._id,
  signals: cluster.signals,
  memberCount: cluster.memberCount,
  riskScore: cluster.riskScore,
  riskLabel: riskLabel(cluster.riskScore),
  deviceId: cluster.deviceIds?.[0] || null,
  ip: cluster.ips?.[0] || null,
  totalApprovedDeposits: cluster.totalApprovedDeposits,
  triggeredBy: triggeredBy
    ? { userId: triggeredBy._id, userName: triggeredBy.userName }
    : null,
  detectedAt: cluster.lastDetectedAt,
});

export { evaluateKey, MIN_CLUSTER_SIZE };
