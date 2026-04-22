import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const toNumber = (value) => parseFloat(value.toString().replace(/,/g, "") || 0);
const getAmountClass = (value) =>
  toNumber(value) >= 0 ? "text-green-600" : "text-red-600";

const ProfitLossTable = ({matchesData}) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate totals
  const total = matchesData.reduce(
    (acc, match) => {
      acc.stake += toNumber(match.stake);
      acc.downline += toNumber(match.downline);
      acc.player += toNumber(match.player);
      acc.comm += toNumber(match.comm);
      acc.upline += toNumber(match.upline);
      return acc;
    },
    { stake: 0, downline: 0, player: 0, comm: 0, upline: 0 }
  );

  return (
    <div className="overflow-x-auto font-['Times_New_Roman']">
      <table className="min-w-full border border-gray-300 text-xs">
        <thead>
          <tr className="bg-[#e4e4e4] border-y border-y-[#7e97a7] text-[#243a48] text-xs font-[400] text-left">
            <th className="p-2">UID</th>
            <th className="p-2">Stake</th>
            <th className="p-2">Downline P/L</th>
            <th className="p-2">Player P/L</th>
            <th className="p-2">Comm.</th>
            <th className="p-2">Upline P/L</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {matchesData.map((match) => (
            <React.Fragment key={match.id}>
              <tr
                onClick={() => toggleRow(match.id)}
                className="cursor-pointer bg-[#0000000d] border-y"
              >
                <td className="p-2 font-medium">
                  <span
                    className={`mr-2 ${
                      expandedRows[match.id] ? "bg-black" : "bg-[#3db39e]"
                    } text-[#e4e0d6] px-1`}
                  >
                    {expandedRows[match.id] ? "−" : "+"}
                  </span>
                  Odds ▸ {match.title}
                </td>
                <td className="p-2">{match.stake}</td>
                <td className={`p-2 ${getAmountClass(match.downline)}`}>{match.downline}</td>
                <td className={`p-2 ${getAmountClass(match.player)}`}>{match.player}</td>
                <td className="p-2">{match.comm}</td>
                <td className={`p-2 ${getAmountClass(match.upline)}`}>{match.upline}</td>
                <td className="p-2"></td>
              </tr>

              {expandedRows[match.id] &&
                match.children.map((child, i) => {
                  const hasBets = Array.isArray(child.bets) && child.bets.length > 0;

                  return (
                    <React.Fragment key={`${match.id}-${i}`}>
                      <tr className="bg-[#f2f2f2] text-gray-700 border-t">
                        <td className="p-2 pl-10">{child.label}</td>
                        <td className="p-2">{child.stake}</td>
                        <td className={`p-2 ${getAmountClass(child.downline)}`}>{child.downline}</td>
                        <td className={`p-2 ${getAmountClass(child.player)}`}>{child.player}</td>
                        <td className="p-2">{child.comm}</td>
                        <td className={`p-2 ${getAmountClass(child.upline)}`}>{child.upline}</td>
                        <td className="p-2">
                          <button
                            className={`px-2 py-1 rounded font-[700] text-xs ${
                              hasBets
                                ? "bg-[#ffcc2f] border border-[#cb8009] text-[#333] hover:bg-[#f3bb00]"
                                : "bg-gray-400 border border-gray-500 cursor-not-allowed text-gray-600"
                            }`}
                            disabled={!hasBets}
                            onClick={() =>
                              hasBets &&
                              navigate("/match-market-bets", {
                                state: {
                                  bets: child.bets,
                                  sectionLabel: child.label,
                                  eventName: match.title,
                                },
                              })
                            }
                            type="button"
                            title={hasBets ? "Show section bets" : "No bets available"}
                          >
                            Show Bets
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
            </React.Fragment>
          ))}

          {/* TOTAL ROW */}
          {matchesData.length === 0 ? (
            <tr>
                <td
                  colSpan="10"
                  className="text-center py-4 text-[#3b5160] bg-[#0000000d] border-y border-[#7e97a7]"
                >
                  You have no bets in this time period.
                </td>
              </tr>
          ):(
            <tr className="bg-[#e4e4e4] font-bold text-[#333] border-y border-y-[#7e97a7]">
            <td className="p-2">Total</td>
            <td className="p-2">{total.stake.toFixed(2)}</td>
            <td className={`p-2 ${getAmountClass(total.downline.toFixed(2))}`}>{total.downline.toFixed(2)}</td>
            <td className={`p-2 ${getAmountClass(total.player.toFixed(2))}`}>{total.player.toFixed(2)}</td>
            <td className="p-2">{total.comm.toFixed(2)}</td>
            <td className={`p-2 ${getAmountClass(total.upline.toFixed(2))}`}>{total.upline.toFixed(2)}</td>
            <td className="p-2"></td>
          </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProfitLossTable;
