import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTopMatchedPlayers,
  fetchTopExposurePlayers,
} from "../../store/riskSlice";

function Top10Table() {
  const dispatch = useDispatch();
  const { matched, exposure, loading, error } = useSelector(
    (state) => state.risk
  );

  const [activeTab, setActiveTab] = useState("matched");

  useEffect(() => {
    dispatch(fetchTopMatchedPlayers());
  }, [dispatch]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "matched") {
      dispatch(fetchTopMatchedPlayers());
    } else {
      dispatch(fetchTopExposurePlayers());
    }
  };

  const activeData = activeTab === "matched" ? matched : exposure;

  const leftData = activeData.slice(0, 10);
  const rightData = activeData.slice(10, 20);

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="bg-white mt-4">
      {/* Tabs */}
      <ul className="flex gap-2">
        <li
          className={`px-3 py-1.5 text-[14px] cursor-pointer rounded-t-md ${
            activeTab === "matched"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => handleTabClick("matched")}
        >
          Top 20 Matched Amount Player
        </li>
        <li
          className={`px-3 py-1.5 text-[14px] cursor-pointer rounded-t-md ${
            activeTab === "exposure"
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => handleTabClick("exposure")}
        >
          Top 20 Exposure Player
        </li>
      </ul>

      

      {/* Two side-by-side tables */}
      <div className="flex">
        {/* Left Table */}
        <div className="min-w-[50%]">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-gray-600 text-white border-y border-y-[#7e97a7]">
              <tr>
                <th className="px-2 py-2">UID</th>
                <th className="px-2 py-2">Exposure</th>
                <th className="px-2 py-2">Matched Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <div className="px-3 py-2 text-xs text-gray-600">Loading...</div>
              )}
              {error && !loading && (
                <div className="px-3 py-2 text-xs text-red-600">{error}</div>
              )}
              {!loading && leftData.length === 0 && (
                <tr className="bg-white border-y border-y-[#7e97a7]">
                  <td
                    colSpan={3}
                    className="px-2 py-2 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
              {leftData.map((player, index) => (
                <tr
                  key={player.userId || player.id || index}
                  className="bg-white border-y border-y-[#7e97a7]"
                >
                  <td className="px-2 py-2">
                    {index + 1}{" "}
                    <span className="ml-2 underline">{player.uid}</span>
                  </td>
                  <td className="px-2 py-2 text-[#dc3545]">
                    <strong>({formatAmount(player.exposure)})</strong>
                  </td>
                  <td className="px-2 py-2">
                    {formatAmount(player.matchedAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Table */}
        <div className="min-w-[50%] border-l border-l-[#7e97a7]">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-gray-600 text-white border-y border-y-[#7e97a7]">
              <tr>
                <th className="px-2 py-2">UID</th>
                <th className="px-2 py-2">Exposure</th>
                <th className="px-2 py-2">Matched Amount</th>
              </tr>
            </thead>
            <tbody>
            {loading && (
                <div className="px-3 py-2 text-xs text-gray-600">Loading...</div>
              )}
              {error && !loading && (
                <div className="px-3 py-2 text-xs text-red-600">{error}</div>
              )}
              {!loading && leftData.length === 0 && (
                <tr className="bg-white border-y border-y-[#7e97a7]">
                  <td
                    colSpan={3}
                    className="px-2 py-2 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
              {rightData.map((player, index) => (
                <tr
                  key={player.userId || player.id || index}
                  className="bg-white border-y border-y-[#7e97a7]"
                >
                  <td className="px-2 py-2">
                    {index + 11}{" "}
                    <span className="ml-2 underline">{player.uid}</span>
                  </td>
                  <td className="px-2 py-2 text-[#dc3545]">
                    <strong>({formatAmount(player.exposure)})</strong>
                  </td>
                  <td className="px-2 py-2">
                    {formatAmount(player.matchedAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Top10Table;
