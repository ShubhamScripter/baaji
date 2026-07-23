import React, { useCallback, useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";

const REFRESH_INTERVAL_MS = 30000;

const StatCard = ({ label, value, accent }) => (
  <div className="flex-1 min-w-[160px] bg-white border border-[#7e97a7] rounded">
    <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] px-3 py-2">
      <span className="text-[#243a48] text-[13px] font-[700]">{label}</span>
    </div>
    <div className={`px-3 py-4 text-[28px] font-[700] ${accent}`}>{value}</div>
  </div>
);

const formatTime = (value) =>
  value ? new Date(value).toLocaleString() : "-";

function ActiveUsers() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get("/active-user-stats");
      if (data.success) {
        setStats(data.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching active user stats:", err);
      setError(err.response?.data?.message || "Failed to fetch user stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchStats]);

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <div className="flex justify-between items-center">
        <h2 className="text-[#243a48] text-[16px] font-[700]">Active Users</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="bg-[#e0e6e6] border border-[#7e97a7] text-[#243a48] px-3 py-1 rounded text-sm hover:bg-[#d0d8d8] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-3">❌ {error}</p>}

      <div className="flex flex-wrap gap-3 mt-4">
        <StatCard
          label="Total Users"
          value={stats ? stats.totalUsers : "-"}
          accent="text-[#243a48]"
        />
        <StatCard
          label="Total Agents"
          value={stats ? stats.totalAgents : "-"}
          accent="text-[#243a48]"
        />
        <StatCard
          label="Total Online Users"
          value={stats ? stats.onlineUsers : "-"}
          accent="text-[#28a745]"
        />
      </div>

      {stats && (
        <p className="text-[12px] text-[#7e97a7] mt-2">
          Counts cover your downline. A user is counted as online after activity
          in the last {stats.presenceWindowMinutes} minutes. Auto-refreshes every
          30 seconds.
        </p>
      )}

      <div className="mt-4">
        <h3 className="text-[#243a48] text-[14px] font-[700] mb-2">
          Currently Online Users
        </h3>
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Account</th>
              <th className="px-2 py-2">Last Active</th>
              <th className="px-2 py-2">Last Login</th>
              <th className="px-2 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {!stats || stats.onlineUserList.length === 0 ? (
              <tr className="bg-white border-y border-y-[#7e97a7]">
                <td colSpan="5" className="px-2 py-2">
                  {loading ? "Loading..." : "No records found"}
                </td>
              </tr>
            ) : (
              stats.onlineUserList.map((user, index) => (
                <tr
                  key={user._id}
                  className="bg-white border-y border-y-[#7e97a7]"
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2 font-[700]">{user.userName}</td>
                  <td className="px-2 py-2">{formatTime(user.lastActive)}</td>
                  <td className="px-2 py-2">{formatTime(user.lastLogin)}</td>
                  <td className="px-2 py-2 font-mono">{user.lastIP || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActiveUsers;
