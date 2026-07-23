import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const SPORTS = ["cricket", "tennis", "soccer"];

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "-";

function SportSetting() {
  const [sport, setSport] = useState("cricket");
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchSeries = useCallback(async (selectedSport) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get("/series-settings", {
        params: { sport: selectedSport },
      });
      if (data.success) {
        setSeries(data.data);
      }
    } catch (err) {
      console.error("Error fetching series:", err);
      setError(err.response?.data?.message || "Failed to fetch series");
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries(sport);
  }, [sport, fetchSeries]);

  const handleToggle = async (row) => {
    setTogglingId(row._id);
    try {
      const { data } = await axiosInstance.patch(
        `/series-settings/${row._id}/toggle-block`
      );
      if (data.success) {
        // Patch the single row rather than refetching the whole list.
        setSeries((prev) =>
          prev.map((s) =>
            s._id === row._id ? { ...s, isBlocked: data.data.isBlocked } : s
          )
        );
        toast.success(data.message);
      }
    } catch (err) {
      console.error("Error toggling series:", err);
      toast.error(err.response?.data?.message || "Failed to update series");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <div className="flex justify-between items-center">
        <h2 className="text-[#243a48] text-[16px] font-[700]">Sport Setting</h2>
        <button
          onClick={() => fetchSeries(sport)}
          disabled={loading}
          className="bg-[#e0e6e6] border border-[#7e97a7] text-[#243a48] px-3 py-1 rounded text-sm hover:bg-[#d0d8d8] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Sport filters */}
      <div className="flex gap-2 mt-4">
        {SPORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-4 py-1.5 text-[13px] capitalize border border-[#7e97a7] rounded ${
              sport === s
                ? "bg-[#243a48] text-white font-[700]"
                : "bg-[#e0e6e6] text-[#243a48] hover:bg-[#d0d8d8]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 mt-3">❌ {error}</p>}

      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">no.</th>
              <th className="px-2 py-2">Game</th>
              <th className="px-2 py-2">Series Name</th>
              <th className="px-2 py-2">Market ID</th>
              <th className="px-2 py-2">Open Date</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {series.length === 0 ? (
              <tr className="bg-white border-y border-y-[#7e97a7]">
                <td colSpan="6" className="px-2 py-2">
                  {loading ? "Loading..." : "No records found"}
                </td>
              </tr>
            ) : (
              series.map((row, index) => (
                <tr
                  key={row._id}
                  className="bg-white border-y border-y-[#7e97a7]"
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2 capitalize">{row.sport}</td>
                  <td className="px-2 py-2">
                    {row.seriesName}
                    {row.isBlocked && (
                      <span className="ml-2 bg-[#dc3545] text-white px-2 py-0.5 rounded text-[10px]">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 font-mono">{row.marketId || "-"}</td>
                  <td className="px-2 py-2">{formatDate(row.openDate)}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => handleToggle(row)}
                      disabled={togglingId === row._id}
                      className={`px-3 py-1 rounded text-[11px] text-white disabled:opacity-50 ${
                        row.isBlocked
                          ? "bg-[#28a745] hover:bg-[#218838]"
                          : "bg-[#dc3545] hover:bg-[#c82333]"
                      }`}
                    >
                      {togglingId === row._id
                        ? "..."
                        : row.isBlocked
                        ? "Unblock"
                        : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-[#7e97a7] mt-3">
        Blocking a series hides all of its matches from users. The list fills in
        as matches are loaded from the provider.
      </p>
    </div>
  );
}

export default SportSetting;
