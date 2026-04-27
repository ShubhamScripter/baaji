import React, { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const BetCard = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleDetails = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const formatValue = (value, fallback = "-") =>
    value === null || value === undefined || value === "" ? fallback : value;

  const formatNumber = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "-";
    return n.toFixed(2);
  };

  const getProfitLossMeta = (bet) => {
    const statusCode = Number(bet.rawStatus ?? bet.statusCode ?? bet.status ?? 0);
    const expectedProfit = Number(bet.expectedProfit ?? 0);
    const expectedLoss = Number(bet.expectedLoss ?? 0);
    const actualNet = Number(
      bet.actualNet ?? bet.profitLossChange ?? bet.resultAmount ?? bet.profitLoss ?? 0
    );

    if (statusCode === 0) {
      return {
        label: "Expected P/L",
        text: `+${formatNumber(expectedProfit)} / -${formatNumber(Math.abs(expectedLoss))}`,
        colorClass: "text-[#1f7a2e]",
      };
    }

    return {
      label: "Profit/Loss",
      text: formatNumber(actualNet),
      colorClass: actualNet < 0 ? "text-red-600" : "text-green-600",
    };
  };

  return (
    <div className=" flex flex-col gap-4 justify-center p-4">
        {data.length ===0 &&(
          <div className="flex flex-col gap-4 pt-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Bet Details</h2>
            <p className="text-gray-700">No current bets available.</p>
          </div>
          {/* Add more bet cards as needed */}
          </div>
        )}
      {data.map((bet, index) => {
        const plMeta = getProfitLossMeta(bet);
        return (
        <div
          key={bet.id}
          className="shadow-md overflow-hidden w-full max-w-md rounded-2xl bg-white mx-auto"
        >
          <table className="table-auto w-full text-sm bg-white">
            <thead className="bg-[#d4e0e5] text-gray-800">
              <tr>
                <th colSpan={3} className="p-2">
                  <div className="flex gap-1 items-center">
                    <span className="md:text-lg font-normal">Soccer</span>
                    <MdPlayArrow className="text-2xl" />
                    <span className="font-semibold md:text-lg">{bet.match}</span>
                    <MdPlayArrow className="text-2xl" />
                    <span className="font-semibold md:text-lg">{bet.market}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td colSpan={3} className="flex items-center gap-2 px-4 py-2">
                  <span className="bg-[#a1d2f4] text-sm font-semibold px-3 py-1 rounded-xl text-blue-900">
                    {formatValue(bet.type || bet.otype)}
                  </span>
                  <span className="font-semibold md:text-lg">{formatValue(bet.selection)}</span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Odds req.</span>
                  <div className="font-semibold md:text-base">
                    {formatNumber(bet.odd ?? bet.oddsReq)}
                  </div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Stake</span>
                  <div className="font-semibold md:text-base">{formatNumber(bet.stake)}</div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">{plMeta.label}</span>
                  <div className={`font-semibold md:text-base ${plMeta.colorClass}`}>{plMeta.text}</div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-700 md:text-lg">PL ID</td>
                <td colSpan={2} className="p-2 font-medium md:text-base">
                  {formatValue(bet.plId)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-700 md:text-lg">Bet ID</td>
                <td colSpan={2} className="p-2 font-medium md:text-base">
                  {formatValue(bet.betId || bet.id)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-700 md:text-lg">Bet Placed</td>
                <td colSpan={2} className="p-2 font-medium md:text-base">
                  {formatValue(bet.time || bet.placed)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-700 md:text-lg">Market</td>
                <td colSpan={2} className="p-2 font-medium md:text-base">
                  {`${formatValue(bet.gameName)} • ${formatValue(bet.eventName)}`}
                </td>
              </tr>
              {expandedIndex === index && (
                <>
                  <tr className="bg-[#9cb1bd] font-semibold">
                    <td className="p-2 text-black md:text-lg">Selection</td>
                    <td colSpan={2} className="p-2 md:text-base text-black">
                      {formatValue(bet.selection)}
                    </td>
                  </tr>
                  <tr className="border-b">
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Type</span>
                  <div className="font-semibold md:text-base">{formatValue(bet.type || bet.otype)}</div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Odds req.</span>
                  <div className="font-semibold md:text-base">{formatNumber(bet.odd ?? bet.oddsReq)}</div>
                </td>
                <td className="p-2">
                  <span className="text-gray-600 md:text-lg">Stake</span>
                  <div className="font-semibold md:text-base">{formatNumber(bet.stake)}</div>
                </td>
                  </tr>
                  <tr>
                    <td className="p-2 md:text-lg font-semibold text-gray-700">{plMeta.label}:</td>
                    <td colSpan={2} className="p-2 md:text-lg">
                      <span className={`font-semibold ${plMeta.colorClass}`}>{plMeta.text}</span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <div
            className="bg-[#9cb1bd] py-1 flex justify-center items-center cursor-pointer rounded-b-xl"
            onClick={() => toggleDetails(index)}
          >
            {expandedIndex === index ? (
              <IoChevronUp className="text-black" size={24} />
            ) : (
              <IoChevronDown className="text-black" size={24} />
            )}
          </div>
        </div>
      )})}
    </div>
  );
};

export default BetCard;
