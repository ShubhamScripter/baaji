import React, { useState } from 'react';
import { FaBan, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import { updateAccountStatus } from '../../store/fraudSlice';

// Values must match ACTIONABLE_STATUSES in the backend fraud controller.
const ACTIONS = [
  { value: 'suspend', label: 'Suspend' },
  { value: 'lock', label: 'Lock' },
  { value: 'active', label: 'Activate' },
];

function ManageAccountModal({ member, onClose }) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('suspend');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    const result = await dispatch(
      updateAccountStatus({ userId: member.userId, status, remark })
    );
    setSaving(false);

    if (updateAccountStatus.fulfilled.match(result)) {
      toast.success(`${member.userName} set to ${status}`);
      onClose();
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className='w-full max-w-[560px] bg-white rounded-md overflow-hidden font-["Times_New_Roman"]'>
        <header className="bg-[#243a48] text-white px-5 py-4 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-[17px] font-[700]">
            <FaBan />
            Manage account — {member.userName}
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white text-[18px]"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-5">
          <label
            htmlFor="fraud-action"
            className="block text-[12px] text-[#6b7a83] mb-1"
          >
            Action
          </label>
          <select
            id="fraud-action"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-[#cfcfcf] rounded-sm px-3 py-2 text-[14px] outline-none focus:border-[#2f6fb4]"
          >
            {ACTIONS.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>

          <label
            htmlFor="fraud-remark"
            className="block text-[12px] text-[#6b7a83] mt-4 mb-1"
          >
            Remark (optional)
          </label>
          <input
            id="fraud-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. multi-account — shared device"
            className="w-full border border-[#cfcfcf] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#2f6fb4]"
          />

          {status !== 'active' && (
            <p className="mt-3 text-[12px] text-[#a04141]">
              This signs the player out immediately and blocks further login.
            </p>
          )}

          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className="mt-5 w-full bg-[#c62828] text-white text-[14px] font-[700] py-2.5 rounded-sm hover:bg-[#a51f1f] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageAccountModal;
