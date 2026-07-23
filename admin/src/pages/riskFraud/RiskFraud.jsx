import React, { useEffect, useMemo, useState } from 'react';
import { FaExclamationTriangle, FaSearch, FaShieldAlt, FaSyncAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import ClusterDrawer from './ClusterDrawer';
import {
  dismissBanner,
  dismissCluster,
  fetchClusterDetail,
  fetchFraudClusters,
  fetchFraudSummary,
  rescanClusters,
} from '../../store/fraudSlice';

const RISK_COLOURS = {
  High: 'text-[#c62828]',
  Medium: 'text-[#ef6c00]',
  Low: 'text-[#2e7d32]',
};

const SIGNAL_CHIPS = {
  device: { label: 'Same device', className: 'bg-[#fdecc8] text-[#8a5300]' },
  ip: { label: 'Same IP', className: 'bg-[#fbdcdc] text-[#a02020]' },
};

const truncate = (value, head = 12) =>
  value && value.length > head + 4 ? `${value.slice(0, head)}…` : value || '—';

const initials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const StatCard = ({ label, value, hint, valueClass = 'text-[#243a48]' }) => (
  <div className="flex-1 min-w-[180px] bg-white border border-[#cfcfcf] rounded-sm px-4 py-3">
    <div className="text-[11px] uppercase tracking-wide text-[#6b7a83]">
      {label}
    </div>
    <div className={`text-[26px] font-[700] leading-tight ${valueClass}`}>
      {value}
    </div>
    <div className="text-[11px] text-[#8b98a0]">{hint}</div>
  </div>
);

function RiskFraud() {
  const dispatch = useDispatch();
  const { summary, clusters, loading, bannerDismissed, error } = useSelector(
    (state) => state.fraud
  );
  const role = useSelector((state) => state.auth.role);

  const [search, setSearch] = useState('');
  const [activeCluster, setActiveCluster] = useState(null);
  const [rescanning, setRescanning] = useState(false);

  const isSuperadmin = role === 'superadmin';

  useEffect(() => {
    if (!isSuperadmin) return;
    dispatch(fetchFraudSummary());
    dispatch(fetchFraudClusters({}));
  }, [dispatch, isSuperadmin]);

  const latestAlert = summary?.latestAlert;
  const showBanner = Boolean(latestAlert) && !bannerDismissed;

  const totalDeposits = useMemo(
    () =>
      clusters.reduce((sum, c) => sum + (c.totalApprovedDeposits || 0), 0),
    [clusters]
  );

  if (!isSuperadmin) {
    return (
      <div className='mt-4 p-2 font-["Times_New_Roman"]'>
        <h2 className="text-[#243a48] text-[16px] font-[700]">Risk &amp; Fraud</h2>
        <p className="mt-2 text-[13px] text-[#6b7a83]">
          This section is restricted to the superadmin account.
        </p>
      </div>
    );
  }

  const runSearch = (event) => {
    event?.preventDefault();
    dispatch(fetchFraudClusters({ search }));
  };

  const refresh = () => {
    dispatch(fetchFraudSummary());
    dispatch(fetchFraudClusters({ search }));
  };

  const handleRescan = async () => {
    setRescanning(true);
    const result = await dispatch(rescanClusters());
    setRescanning(false);
    if (rescanClusters.fulfilled.match(result)) {
      toast.success(result.payload.message);
      refresh();
    } else {
      toast.error(result.payload || 'Rescan failed');
    }
  };

  const openCluster = (cluster) => {
    setActiveCluster(cluster);
    dispatch(fetchClusterDetail(cluster._id));
  };

  const reviewLatest = () => {
    const cluster = clusters.find((c) => c._id === latestAlert._id);
    if (cluster) openCluster(cluster);
    else toast('Cluster not in the current list — try refreshing.');
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"] pb-10'>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[#243a48] text-[20px] font-[700]">
            <FaShieldAlt className="text-[#2f6fb4]" />
            Risk &amp; Fraud
          </h2>
          <p className="text-[12px] text-[#6b7a83]">Multi-account detection</p>
        </div>

        <form onSubmit={runSearch} className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7ae] text-[12px]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by IP, phone, email, device, username..."
              className="w-[320px] max-w-full border border-[#cfcfcf] rounded-sm bg-white pl-9 pr-3 py-2 text-[12px] outline-none focus:border-[#2f6fb4]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#2f6fb4] text-white text-[12px] font-[600] px-4 py-2 rounded-sm hover:bg-[#255a94]"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleRescan}
            disabled={rescanning}
            title="Rescan all recorded devices and IPs"
            className="border border-[#cfcfcf] bg-white text-[#243a48] px-3 py-2 rounded-sm hover:bg-[#f2f2f2] disabled:opacity-50"
          >
            <FaSyncAlt className={rescanning ? 'animate-spin' : ''} />
          </button>
        </form>
      </div>

      {showBanner && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-[#e8b4b4] bg-[#fdf0f0] rounded-sm px-4 py-3">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-[#c62828] mt-1" />
            <div>
              <div className="text-[#c62828] text-[14px] font-[700]">
                New multi-account alert · review needed
              </div>
              <div className="text-[12px] text-[#a04141]">
                {latestAlert.memberCount} betting IDs linked
                {latestAlert.deviceId
                  ? ` — shared device ${truncate(latestAlert.deviceId)}`
                  : ''}
                {latestAlert.ip ? ` & IP ${latestAlert.ip}` : ''}.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => dispatch(dismissBanner())}
              className="text-[12px] text-[#6b7a83] hover:underline"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={reviewLatest}
              className="bg-[#c62828] text-white text-[12px] font-[600] px-4 py-2 rounded-sm hover:bg-[#a51f1f]"
            >
              Review cluster →
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4">
        <StatCard
          label="Flagged clusters"
          value={summary?.flaggedClusters ?? '—'}
          hint="groups with 2+ linked accounts"
          valueClass="text-[#c62828]"
        />
        <StatCard
          label="Accounts under review"
          value={summary?.accountsUnderReview ?? '—'}
          hint="unique users in clusters"
        />
        <StatCard
          label="Suspended in clusters"
          value={summary?.suspendedInClusters ?? '—'}
          hint="already blocked / suspended"
          valueClass="text-[#ef6c00]"
        />
        <StatCard
          label="Shared-IP signals"
          value={summary?.sharedIpSignals ?? '—'}
          hint="duplicate IP groups detected"
          valueClass="text-[#2f6fb4]"
        />
      </div>

      <div className="mt-4 bg-white border border-[#cfcfcf] rounded-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]">
          <h3 className="text-[#243a48] text-[15px] font-[700]">Clusters</h3>
          <span className="text-[11px] text-[#8b98a0]">
            {loading ? 'loading…' : `${clusters.length} shown`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
              <tr>
                <th className="px-4 py-2">Cluster</th>
                <th className="px-4 py-2">Shared signals</th>
                <th className="px-4 py-2">Accounts</th>
                <th className="px-4 py-2">Deposits</th>
                <th className="px-4 py-2">Risk</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && clusters.length === 0 && (
                <tr className="bg-white border-y border-y-[#e0e0e0]">
                  <td colSpan="6" className="px-4 py-6 text-center text-[#6b7a83]">
                    {error
                      ? error
                      : 'No linked accounts detected. Use the refresh button to rescan recorded devices.'}
                  </td>
                </tr>
              )}

              {clusters.map((cluster) => (
                <tr
                  key={cluster._id}
                  className={`border-y border-y-[#e0e0e0] ${
                    cluster.acknowledged ? 'bg-white' : 'bg-[#fffaf7]'
                  }`}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="text-[#2f6fb4] font-[700]">
                      {cluster.clusterId}
                    </div>
                    <div className="text-[11px] text-[#6b7a83] font-mono">
                      {truncate(cluster.deviceIds?.[0] || cluster.ips?.[0], 24)}
                      {cluster.memberCount > 1 && (
                        <span className="ml-1 text-[#9aa7ae]">
                          +{cluster.memberCount - 1}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8b98a0]">
                      {cluster.members?.[0]?.userName}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {cluster.signals.map((signal) => {
                        const chip = SIGNAL_CHIPS[signal];
                        if (!chip) return null;
                        return (
                          <span
                            key={signal}
                            className={`text-[10px] font-[600] px-2 py-1 rounded-sm ${chip.className}`}
                          >
                            {chip.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center">
                      {cluster.members.slice(0, 4).map((member, index) => (
                        <span
                          key={member.userId}
                          title={member.userName}
                          className="w-7 h-7 -ml-1 first:ml-0 rounded-full bg-[#243a48] text-white text-[11px] font-[600] flex items-center justify-center border-2 border-white"
                          style={{ zIndex: 10 - index }}
                        >
                          {initials(member.userName)}
                        </span>
                      ))}
                      {cluster.memberCount > 4 && (
                        <span className="w-7 h-7 -ml-1 rounded-full bg-[#2f6fb4] text-white text-[10px] font-[600] flex items-center justify-center border-2 border-white">
                          +{cluster.memberCount - 4}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top font-[600] text-[#243a48]">
                    ৳{(cluster.totalApprovedDeposits || 0).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <span
                      className={`font-[700] ${
                        RISK_COLOURS[cluster.riskLabel] || 'text-[#243a48]'
                      }`}
                    >
                      {cluster.riskScore} {cluster.riskLabel}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-top text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => openCluster(cluster)}
                        className="bg-[#2f6fb4] text-white text-[11px] font-[600] px-4 py-1.5 rounded-sm hover:bg-[#255a94]"
                      >
                        Review
                      </button>
                      {cluster.status !== 'dismissed' && (
                        <button
                          type="button"
                          onClick={() => dispatch(dismissCluster(cluster._id))}
                          className="border border-[#cfcfcf] text-[#6b7a83] text-[11px] px-3 py-1.5 rounded-sm hover:bg-[#f2f2f2]"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clusters.length > 0 && (
          <div className="px-4 py-2 border-t border-[#e0e0e0] text-[11px] text-[#6b7a83]">
            Total approved deposits across shown clusters:{' '}
            <span className="font-[700] text-[#243a48]">
              ৳{totalDeposits.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {activeCluster && (
        <ClusterDrawer
          clusterId={activeCluster._id}
          onClose={() => setActiveCluster(null)}
        />
      )}
    </div>
  );
}

export default RiskFraud;
