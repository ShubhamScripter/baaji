import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatAmount, getAmountClass } from "../../../utils/formatAmount";

const getStatusText = (status, type) => {
  if (status === 1) return "Win";
  if (status === 2) return "Loss";
  if (type) return type.toUpperCase();
  return "-";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString();
};

function MatchMarketBets() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bets = [], sectionLabel = "Bets", eventName = "" } = location.state || {};

  return (
    <div className="bg-[#f0ece1] min-h-[100vh] p-4 font-['Times_New_Roman']">
      <div className="flex justify-between">
        <div className="text-[#243a48] text-base font-[700]">
          Show Bets - {sectionLabel}{eventName ? ` (${eventName})` : ""}
        </div>
        <button className="bg-[#ffcc2f] border border-[#cb8009] px-2 py-1 rounded hover:bg-yellow-500 text-[#333] font-[700] text-xs"
        onClick={() => navigate(-1)}
        >
          Close
        </button>
      </div>

      <div className="mt-4">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-[#e4e4e4] border-y border-y-[#7e97a7]">
            <tr>
              <th className="px-2 py-2">Sports</th>
              <th className="px-2 py-2">Match Name</th>
              <th className="px-2 py-2">Client</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Selection</th>
              <th className="px-2 py-2">Odds</th>
              <th className="px-2 py-2">Stake</th>
              <th className="px-2 py-2">Place Time</th>
              <th className="px-2 py-2">IP</th>
              <th className="px-2 py-2">PnL</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bets.length > 0 ? (
              bets.map((bet, index) => (
                <tr key={bet.id || `${bet.userName}-${index}`} className="border-b border-[#d2d2d2]">
                  <td className="px-2 py-2">{bet.gameName || "-"}</td>
                  <td className="px-2 py-2">{bet.eventName || eventName || "-"}</td>
                  <td className="px-2 py-2">{bet.userName || "-"}</td>
                  <td className="px-2 py-2">{bet.type || "-"}</td>
                  <td className="px-2 py-2">{bet.selection || "-"}</td>
                  <td className="px-2 py-2">{Number(bet.odds || 0).toFixed(2)}</td>
                  <td className="px-2 py-2">{Number(bet.stake || 0).toFixed(2)}</td>
                  <td className="px-2 py-2">{formatDateTime(bet.date)}</td>
                  <td className="px-2 py-2">{bet.ip || "-"}</td>
                  <td className={`px-2 py-2 ${getAmountClass(bet.profitLoss)}`}>
                    {formatAmount(bet.profitLoss)}
                  </td>
                  <td className="px-2 py-2">{getStatusText(bet.status, bet.type)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-8 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                >
                  You have no bets in this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MatchMarketBets;
