import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";

const formatNumber = (num) =>
  Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

function CasinoDownlineBets() {
  const navigate = useNavigate();
  const location = useLocation();
  const { targetUserId, targetUserName, startDate, endDate } = location.state || {};

  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBets = async () => {
      if (!targetUserId) return;

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          id: targetUserId,
          page: 1,
          limit: 200,
        });

        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        const response = await axiosInstance.get(
          `/casino/all-bet-history?${queryParams.toString()}`
        );

        if (response.data?.success) {
          setBets(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching downline casino bets:", error);
        setBets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [targetUserId, startDate, endDate]);

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <div className="flex justify-between items-center">
        <h2 className='text-[#243a48] text-[16px] font-[700] font-["Times_New_Roman"]'>
          Casino Bets - {targetUserName || "Downline"}
        </h2>
        <button
          className="bg-[#ffcc2f] border border-[#cb8009] px-2 py-1 rounded hover:bg-yellow-500 text-[#333] font-[700] text-xs"
          onClick={() => navigate(-1)}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 text-[#3b5160]">Loading...</div>
        ) : (
          <table className="min-w-full text-xs text-left">
            <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
              <tr>
                <th className="px-2 py-2">User</th>
                <th className="px-2 py-2">Game Name</th>
                <th className="px-2 py-2">Game UID</th>
                <th className="px-2 py-2">Round</th>
                <th className="px-2 py-2">Bet Amount</th>
                <th className="px-2 py-2">Win Amount</th>
                <th className="px-2 py-2">P/L</th>
                <th className="px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {bets.length > 0 ? (
                bets.map((bet, index) => (
                  <tr
                    key={bet._id || `${bet.userName}-${bet.game_round}-${index}`}
                    className="bg-white border-y border-y-[#7e97a7]"
                  >
                    <td className="px-2 py-2">{bet.userName || "-"}</td>
                    <td className="px-2 py-2">
                      {bet?.providerRaw?.game_name || bet.game_uid || "-"}
                    </td>
                    <td className="px-2 py-2">{bet.game_uid || "-"}</td>
                    <td className="px-2 py-2">{bet.game_round || "-"}</td>
                    <td className="px-2 py-2">{formatNumber(bet.bet_amount)}</td>
                    <td className="px-2 py-2">{formatNumber(bet.win_amount)}</td>
                    <td
                      className={`px-2 py-2 ${
                        Number(bet.change || 0) < 0 ? "text-[#dc3545]" : "text-[#198754]"
                      }`}
                    >
                      {formatNumber(bet.change)}
                    </td>
                    <td className="px-2 py-2">{formatDateTime(bet.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                  >
                    No casino bets found for this downline.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CasinoDownlineBets;
