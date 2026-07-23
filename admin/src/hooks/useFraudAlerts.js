import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import { fetchFraudSummary, fraudAlertReceived } from '../store/fraudSlice';
import { adminSocket } from '../utils/adminSocket';

/**
 * Keeps the superadmin's multi-account alert state live.
 *
 * Mounted in the layout rather than the Risk & Fraud page so the sidebar badge
 * and the toast still fire while the superadmin is on any other screen.
 */
const useFraudAlerts = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const isSuperadmin = role === 'superadmin';

  useEffect(() => {
    if (!isSuperadmin) return undefined;

    // Seed the badge from the server; the socket only carries changes from here on.
    dispatch(fetchFraudSummary());

    return adminSocket.subscribe((msg) => {
      if (msg?.type !== 'fraudAlert' || !msg.data) return;

      dispatch(fraudAlertReceived(msg.data));

      const { memberCount, clusterId, signals = [] } = msg.data;
      const via = signals.includes('device') ? 'same device' : 'same IP';
      toast.error(
        `${clusterId}: ${memberCount} betting IDs linked — ${via}`,
        { duration: 8000, icon: '⚠️' }
      );
    });
  }, [dispatch, isSuperadmin]);
};

export default useFraudAlerts;
