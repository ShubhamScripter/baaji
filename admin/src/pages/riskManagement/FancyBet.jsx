import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { fetchFancySummary } from "../../store/riskSlice";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

const buildFancy = (item, idx) => ({
  idx,
  sport: item.sport || "Others",
  date: formatDate(item.date),
  eventName: item.eventName || "",
  marketName: item.marketName || "",
  gameId: item.gameId,
  minBetAmount: item.minBetAmount ?? 0,
  maxBetAmount: item.maxBetAmount ?? 0,
  totalMatched: item.totalMatched ?? 0,
  openBetCount: item.openBetCount ?? 0,
});

const groupBySport = (items) => {
  const groups = {};
  items.forEach((item) => {
    const key = item.sport;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

const amountClass = (value) =>
  Number(value) < 0 ? "text-red-600" : "text-green-600";

const SportHeader = () => (
  <thead>
    <tr className="bg-gray-600 text-white w-full text-[13px]">
      <th colSpan={2} className="w-[70%] text-left px-2 py-1.5 capitalize">Sports</th>
      <th className="w-[10%] px-2 py-1.5 text-left">Min</th>
      <th className="w-[10%] px-2 py-1.5 text-left">Max</th>
      <th className="w-[10%] px-2 py-1.5 border-l border border-gray-200">Downline P/L</th>
    </tr>
  </thead>
);

const FancyRow = ({ match, isOpen, onToggle }) => (
  <tr className="w-full text-[13px] border border-gray-300">
    <td className="w-[10%] px-2 py-1.5 text-center">{match.date}</td>
    <td className="w-[60%] text-left px-2 py-1.5 border-l border-gray-300">
      <div className="flex gap-2 items-center">
        <button type="button" onClick={onToggle} className="flex items-center">
          {isOpen ? (
            <FaCircleMinus className="text-blue-500 size-4" />
          ) : (
            <FaCirclePlus className="text-blue-500 size-4" />
          )}
        </button>
        <span className="text-blue-700 underline">{match.eventName}</span>
        <FaArrowAltCircleRight className="text-gray-500 size-3" />
        <span className="text-blue-700 underline">{match.marketName}</span>
      </div>
    </td>
    <td className={`w-[10%] px-2 py-1.5 ${amountClass(match.minBetAmount)}`}>
      {match.minBetAmount}
    </td>
    <td className={`w-[10%] px-2 py-1.5 ${amountClass(match.maxBetAmount)}`}>
      {match.maxBetAmount}
    </td>
    <td className="w-[10%] px-2 py-3 border-l border-gray-300 text-center">
      <span className="bg-yellow-100/50 border border-yellow-400 py-2 px-5">
        Book
      </span>
    </td>
  </tr>
);

const FancyDetails = ({ match }) => (
  <tr>
    <td></td>
    <td colSpan={5} className="pb-2 bg-gray-100">
      <div className="max-w-[80%] mx-auto bg-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left px-2 py-1 w-[55%]" colSpan={2}></th>
              <th className="text-center px-2 py-1 w-[15%]">Yes</th>
              <th className="text-center px-2 py-1 w-[15%]">No</th>
              <th className="text-center px-2 py-1 w-[15%]"></th>
            </tr>
          </thead>
          <tbody className="border border-y border-y-[#7e97a7]">
            <tr className="bg-white border-y border-y-[#7e97a7]">
              <td className="px-2 py-1 border-r border-r-[#7e97a7] w-[40%]">
                <span className="text-xs font-bold">{match.marketName}</span>
              </td>
              <td className="text-center px-2 py-1 w-[15%]"></td>
              <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#72bbef] w-[15%]">
                <div>--</div>
                <div>--</div>
              </td>
              <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#faa9ba] w-[15%]">
                <div>--</div>
                <div>--</div>
              </td>
              <td className="text-center px-2 py-1 w-[15%]"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </td>
  </tr>
);

const SportTable = ({ sport, matches, activeRows, onToggle }) => (
  <table className="w-full mt-3">
    <SportHeader sport={sport} />
    <tbody>
      {matches.map((match) => {
        const isOpen = activeRows === match.idx;
        return (
          <React.Fragment key={match.gameId ? `${match.gameId}-${match.idx}` : match.idx}>
            <FancyRow
              match={match}
              isOpen={isOpen}
              onToggle={() => onToggle(match.idx)}
            />
            {isOpen && <FancyDetails match={match} />}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>
);

function FancyBet() {
  const dispatch = useDispatch();
  const { fancy, fancyLoading, fancyError } = useSelector(
    (state) => state.risk
  );
  const [activeRows, setActiveRows] = useState(null);

  useEffect(() => {
    dispatch(fetchFancySummary());
  }, [dispatch]);

  const fancyData = useMemo(
    () => (Array.isArray(fancy) ? fancy : []).map(buildFancy),
    [fancy]
  );

  const groupedBySport = useMemo(() => groupBySport(fancyData), [fancyData]);

  const toggleRow = (index) => {
    setActiveRows((prev) => (prev === index ? null : index));
  };

  const hasData = fancyData.length > 0;

  return (
    <div className="mt-10 rounded-[5px]">
      <h2 className="text-[#243a48] text-base font-bold">Fancy Bet</h2>

      {fancyLoading && (
        <div className="px-3 py-2 text-xs text-gray-600">Loading...</div>
      )}

      {fancyError && !fancyLoading && (
        <div className="px-3 py-2 text-xs text-red-600">{fancyError}</div>
      )}

      {!fancyLoading && !fancyError && !hasData && (
        <div className="px-3 py-2 text-xs text-gray-500">No data available</div>
      )}

      {Object.entries(groupedBySport).map(([sport, matches]) => (
        <SportTable
          key={sport}
          sport={sport}
          matches={matches}
          activeRows={activeRows}
          onToggle={toggleRow}
        />
      ))}
    </div>
  );
}

export default FancyBet;
