import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import ManageAccountModal from './ManageAccountModal';
import { acknowledgeCluster, clearDetail } from '../../store/fraudSlice';

const SIGNAL_CHIPS = {
  device: { label: 'Same device', className: 'bg-[#fdecc8] text-[#8a5300]' },
  ip: { label: 'Same IP', className: 'bg-[#fbdcdc] text-[#a02020]' },
};

const STATUS_STYLES = {
  active: 'bg-[#e8f5e9] text-[#2e7d32]',
  suspend: 'bg-[#fdecea] text-[#c62828]',
  lock: 'bg-[#fff3e0] text-[#ef6c00]',
  inactive: 'bg-[#eceff1] text-[#546e7a]',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
};

function ClusterDrawer({ clusterId, onClose }) {
  const dispatch = useDispatch();
  const { detail, detailLoading } = useSelector((state) => state.fraud);
  const [managing, setManaging] = useState(null);

  const isCurrent = detail?._id === clusterId;

  // Opening the drawer counts as reviewing it: clears the banner and the badge.
  useEffect(() => {
    if (isCurrent && !detail.acknowledged) {
      dispatch(acknowledgeCluster(clusterId));
    }
  }, [dispatch, clusterId, isCurrent, detail?.acknowledged]);

  const close = () => {
    dispatch(clearDetail());
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={close}
        role="presentation"
      />

      <aside className='fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-50 shadow-2xl flex flex-col font-["Times_New_Roman"]'>
        <header className="bg-[#243a48] text-white px-5 py-4 flex items-start justify-between">
          <div>
            <div className="text-[11px] text-[#a9c0cd]">
              {detail?.clusterId || '…'}
            </div>
            <h3 className="text-[17px] font-[700]">Cluster review</h3>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cluster review"
            className="text-white/80 hover:text-white text-[18px]"
          >
            <FaTimes />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {(detailLoading || !isCurrent) && (
            <p className="px-5 py-6 text-[13px] text-[#6b7a83]">Loading cluster…</p>
          )}

          {isCurrent && !detailLoading && (
            <>
              <div className="px-5 py-4 border-b border-[#e0e0e0]">
                <div className="flex flex-wrap gap-2">
                  {detail.signals.map((signal) => {
                    const chip = SIGNAL_CHIPS[signal];
                    if (!chip) return null;
                    return (
                      <span
                        key={signal}
                        className={`text-[11px] font-[600] px-3 py-1 rounded-sm ${chip.className}`}
                      >
                        {chip.label}
                      </span>
                    );
                  })}
                </div>

                {detail.ips?.length > 0 && (
                  <p className="mt-3 text-[13px] text-[#243a48]">
                    <span className="font-[700]">IP:</span>{' '}
                    <span className="font-mono">{detail.ips.join(', ')}</span>
                  </p>
                )}
                {detail.deviceIds?.length > 0 && (
                  <p className="mt-1 text-[13px] text-[#243a48] break-all">
                    <span className="font-[700]">Device:</span>{' '}
                    <span className="font-mono">
                      {detail.deviceIds.join(', ')}
                    </span>
                  </p>
                )}
                <p className="mt-1 text-[13px] text-[#243a48]">
                  <span className="font-[700]">Total approved deposits:</span> ৳
                  {(detail.totalApprovedDeposits || 0).toLocaleString()}
                </p>
                <p className="mt-1 text-[12px] text-[#6b7a83]">
                  First detected {formatDate(detail.firstDetectedAt)}
                </p>
              </div>

              <ul className="p-4 space-y-3">
                {detail.members.map((member) => {
                  const devices = detail.devicesByUser?.[member.userId] || [];
                  return (
                    <li
                      key={member.userId}
                      className="bg-[#f7f7f5] border border-[#e0e0e0] rounded-sm px-4 py-3 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wide text-[#8b98a0]">
                          User ID
                        </div>
                        <div className="text-[13px] font-[700] text-[#243a48] font-mono break-all">
                          {member.userId}
                        </div>
                        <div className="text-[12px] text-[#243a48] mt-1">
                          {member.userName}
                        </div>
                        <div className="text-[12px] text-[#6b7a83]">
                          {member.email || '—'}
                        </div>
                        {member.phone && (
                          <div className="text-[12px] text-[#6b7a83]">
                            {member.phone}
                          </div>
                        )}
                        <div className="text-[12px] text-[#6b7a83]">
                          Last login: {formatDate(member.lastLogin)}
                        </div>
                        <div className="text-[12px] text-[#9aa7ae] font-mono">
                          {member.lastIp || '—'}
                        </div>
                        {devices.length > 0 && (
                          <div className="text-[11px] text-[#9aa7ae] mt-1">
                            {devices.length} device
                            {devices.length > 1 ? 's' : ''} ·{' '}
                            {devices.reduce((n, d) => n + (d.loginCount || 0), 0)}{' '}
                            logins
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-[600] px-2 py-1 rounded-sm ${
                            STATUS_STYLES[member.status] || STATUS_STYLES.inactive
                          }`}
                        >
                          {member.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => setManaging(member)}
                          className="bg-[#c62828] text-white text-[11px] font-[600] px-4 py-1.5 rounded-sm hover:bg-[#a51f1f]"
                        >
                          Manage
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </aside>

      {managing && (
        <ManageAccountModal
          member={managing}
          onClose={() => setManaging(null)}
        />
      )}
    </>
  );
}

export default ClusterDrawer;
