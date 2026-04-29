import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion"; //eslint-disable-line
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { fetchFancySummary } from "../../store/riskSlice";
import { useNavigate } from "react-router";
import FancyMasterBookPopup from "../marketAnalysis/CircketComponent/FancyMasterBookPopup";
import { getFancyMasterBook } from "../../store/marketAnalyzeReducer";
import api from "../../utils/axiosInstance";

const getTeams = (eventName = "") => {
  const parts = eventName.split(/\s+v\s+/i).map((p) => p.trim());
  return [parts[0] || "", parts[1] || ""];
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[.,'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const significantTokens = (value) =>
  normalize(value)
    .split(" ")
    .filter((w) => w.length >= 3);

const isSameTeam = (teamName, outcomeName) => {
  const a = normalize(teamName);
  const b = normalize(outcomeName);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const aTokens = significantTokens(teamName);
  const bTokens = significantTokens(outcomeName);
  if (!aTokens.length || !bTokens.length) return false;

  return aTokens.some((t) => bTokens.includes(t));
};


const buildMatch = (item) => {
  const [team1, team2] = getTeams(item.eventName);
  const outcomes = Array.isArray(item.outcomes) ? item.outcomes : [];
  const findPL = (teamName) => {
    const found = outcomes.find((o) => isSameTeam(teamName, o.teamName));
    return found ? found.totalBetAmount : "";
  };

  const odds = [team1, team2]
    .filter(Boolean)
    .map((team) => ({ team, back: "--", lay: "--", size: "" }));

  return {
    sport: item.sport || "Others",
    date: formatDate(item.date),
    event: item.eventName || "",
    market: item.marketName,
    gameId: item.gameId,
    gameType: item.gameType || "Normal",
    min: item.minBetAmount,
    max: item.maxBetAmount,
    odds,
    playerPL: {
      one: findPL(team1),
      two: findPL(team2),
    },
  };
};

const groupBySport = (matches) => {
  const groups = {};
  matches.forEach((match, idx) => {
    const key = match.sport;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ ...match, idx });
  });
  return groups;
};


const SportHeader = () => (
  <thead>
    <tr className="bg-gray-600 text-white w-full text-[13px]">
      <th colSpan={2} className="w-[70%] text-left px-2 py-1.5 capitalize">Sports</th>
      <th className="w-[10%] px-2 py-1.5 text-center">Min</th>
      <th className="w-[10%] px-2 py-1.5 text-center">Max</th>
      <th className="w-[10%] px-2 py-1.5 border-l border border-gray-200">Downline P/L</th>
    </tr>
  </thead>
);

const MatchRow = ({ match, isOpen, onToggle, onViewDetails, onBookMaster }) => (
  <tr className="w-full text-[13px] border border-gray-300">
    <td className="w-[10%] px-2 py-1.5 text-center">{match.date}</td>
    <td className="w-[56%] text-left px-2 py-1.5 border-l border-gray-300">
      <div className="flex gap-2 items-center">
        <button type="button" onClick={onToggle} className="flex items-center">
          {isOpen ? (
            <FaCircleMinus className="text-blue-500 size-4" />
          ) : (
            <FaCirclePlus className="text-blue-500 size-4" />
          )}
        </button>
        <span className="text-blue-700 underline" onClick={() => onViewDetails(match)}>{match.event}</span>
        <FaArrowAltCircleRight className="text-gray-500 size-3" />
        <span className="text-blue-700 underline">{match.market}</span>
      </div>
    </td>
    <td className="text-center">{match.min}</td>
    <td className="text-center">{match.max}</td>
    <td className="w-[10%] px-2 py-3 border-l border-gray-300 text-center">
      <span
        className="bg-yellow-100/50 border border-yellow-400 py-2 px-5 cursor-pointer hover:bg-yellow-200"
        onClick={() => onBookMaster(match)}
      >
        Book
      </span>
    </td>
  </tr>
);

// Map sport to the live betting-data endpoint (fancy is cricket-only, but
// keep the helper for parity with MatchOdds/BookMaker).
const getBettingEndpoint = (sport = "") => {
  const s = String(sport).toLowerCase().trim();
  if (s.includes("cricket")) return "/cricket/betting";
  if (s.includes("tennis")) return "/tannis/betting";
  if (s.includes("soccer") || s.includes("football")) return "/soccer/betting";
  return null;
};

const unwrapMarketsArray = (payload, maxDepth = 5) => {
  let cur = payload;
  for (let i = 0; i < maxDepth; i += 1) {
    if (Array.isArray(cur)) return cur;
    if (cur && typeof cur === "object" && "data" in cur) {
      cur = cur.data;
    } else {
      return null;
    }
  }
  return Array.isArray(cur) ? cur : null;
};

const formatSize = (num) => {
  if (num == null || num === "") return "";
  const n = Number(num);
  if (Number.isNaN(n)) return num;
  if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
  return n;
};

const isFancyMarket = (market) => {
  const m = String(market?.mname ?? "").toLowerCase();
  if (!m) return false;
  // Cover the common fancy market mnames seen in the betting feed
  // (fancy1, Normal/over-runs, plus any *_RUNS / SESSION / FANCY variants).
  return (
    m === "fancy1" ||
    m === "normal" ||
    m.includes("fancy") ||
    m.includes("session") ||
    m.includes("runs") ||
    m.includes("over")
  );
};

// Find the section across fancy markets whose selection name matches.
const findFancySection = (bettingData, marketName) => {
  if (!Array.isArray(bettingData) || !marketName) return null;
  const target = String(marketName).toLowerCase().trim();
  for (const market of bettingData) {
    if (!isFancyMarket(market)) continue;
    const sections = Array.isArray(market.section) ? market.section : [];
    const found = sections.find(
      (sec) => String(sec?.nat ?? "").toLowerCase().trim() === target
    );
    if (found) {
      return {
        section: found,
        marketStatus: market.status,
      };
    }
  }
  return null;
};

const OddsDetailsMessage = ({ children }) => (
  <tr>
    <td></td>
    <td colSpan={5} className="pb-2 bg-gray-100">
      <div className="max-w-[80%] mx-auto bg-gray-200 py-3 text-center text-xs text-gray-600">
        {children}
      </div>
    </td>
  </tr>
);

const OddsDetails = ({ match, bettingData, isLoading }) => {
  if (isLoading) return <OddsDetailsMessage>Loading odds...</OddsDetailsMessage>;

  const found = findFancySection(bettingData, match.market);
  const odds = Array.isArray(found?.section?.odds) ? found.section.odds : [];
  const yesOdd = odds[0];
  const noOdd = odds[1];
  const sectionStatus = found?.section?.gstatus || found?.marketStatus;
  const isSuspended = sectionStatus === "SUSPENDED";

  return (
    <tr>
      <td></td>
      <td colSpan={5} className="pb-2 bg-gray-100">
        <div className="max-w-[80%] mx-auto bg-gray-200 relative">
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
              <tr
                className={`bg-white border-y border-y-[#7e97a7] ${
                  isSuspended ? "opacity-40" : ""
                }`}
              >
                <td className="px-2 py-1 border-r border-r-[#7e97a7] w-[40%]">
                  <span className="text-xs font-bold">{match.market}</span>
                </td>
                <td className="text-center px-2 py-1 w-[15%]"></td>
                <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#72bbef] w-[15%]">
                  <div className="font-bold">{yesOdd?.odds ?? "--"}</div>
                  <div>{yesOdd?.size != null ? formatSize(yesOdd.size) : "--"}</div>
                </td>
                <td className="text-center px-2 py-1 border-r border-r-[#7e97a7] bg-[#faa9ba] w-[15%]">
                  <div className="font-bold">{noOdd?.odds ?? "--"}</div>
                  <div>{noOdd?.size != null ? formatSize(noOdd.size) : "--"}</div>
                </td>
                <td className="text-center px-2 py-1 w-[15%]"></td>
              </tr>
            </tbody>
          </table>
          {isSuspended && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-red-600 text-xl font-bold tracking-widest">
                SUSPENDED
              </span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const SportTable = ({
  sport,
  matches,
  activeRows,
  onToggle,
  onViewDetails,
  onBookMaster,
  bettingDataMap,
  bettingDataLoadingMap,
}) => (
  <table className="w-full mt-3">
    <SportHeader sport={sport} />
    <tbody>
      {matches.map((match) => {
        const isOpen = activeRows === match.idx;
        return (
          <React.Fragment key={match.gameId || match.idx}>
            <MatchRow
              match={match}
              isOpen={isOpen}
              onToggle={() => onToggle(match)}
              onViewDetails={onViewDetails}
              onBookMaster={onBookMaster}
            />
            {isOpen && (
              <OddsDetails
                match={match}
                bettingData={bettingDataMap?.[match.gameId]}
                isLoading={!!bettingDataLoadingMap?.[match.gameId]}
              />
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>
);

const getSportSlug = (sport = "") => {
  const s = String(sport).toLowerCase().trim();
  if (s.includes("cricket")) return "cricket-bet";
  if (s.includes("tennis")) return "tennis-bet";
  if (s.includes("soccer") || s.includes("football")) return "soccerbet";
  return "";
};


function FancyBet() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { fancy, fancyLoading, fancyError } = useSelector(
    (state) => state.risk
  );
  const [masterBookPopup, setMasterBookPopup] = useState({
    show: false,
    teamName: '',
  });

  const [activeRows, setActiveRows] = useState({});
  const [bettingDataMap, setBettingDataMap] = useState({});
  const [bettingDataLoadingMap, setBettingDataLoadingMap] = useState({});


  const handleOpenMasterBook = (match) => {
    if (!match?.gameId) return;
    const teamName = match.market;
    setMasterBookPopup({ show: true, teamName });
    dispatch(
      getFancyMasterBook({
        gameId: match.gameId,
        teamName,
        gameType: match.gameType,
      })
    );
  };
  useEffect(() => {
    dispatch(fetchFancySummary());
  }, [dispatch]);

  const matchData = useMemo(
    () => (fancy || []).map(buildMatch),
    [fancy]
  );

  const groupedBySport = useMemo(() => groupBySport(matchData), [matchData]);

  const fetchBettingDataFor = useCallback(
    async (match) => {
      const endpoint = getBettingEndpoint(match?.sport);
      if (!endpoint || !match?.gameId) return;
      if (bettingDataMap[match.gameId] || bettingDataLoadingMap[match.gameId])
        return;

      setBettingDataLoadingMap((prev) => ({ ...prev, [match.gameId]: true }));
      try {
        const res = await api.get(`${endpoint}?gameid=${match.gameId}`);
        const markets = unwrapMarketsArray(res?.data);
        setBettingDataMap((prev) => ({ ...prev, [match.gameId]: markets }));
      } catch (err) {
        console.error("Failed to load betting data", err);
        setBettingDataMap((prev) => ({ ...prev, [match.gameId]: null }));
      } finally {
        setBettingDataLoadingMap((prev) => ({
          ...prev,
          [match.gameId]: false,
        }));
      }
    },
    [bettingDataMap, bettingDataLoadingMap]
  );

  const toggleRow = (match) => {
    const idx = typeof match === "object" ? match.idx : match;
    setActiveRows((prev) => (prev === idx ? null : idx));
    if (typeof match === "object" && activeRows !== idx) {
      fetchBettingDataFor(match);
    }
  };

  const handleViewDetails = (match) => {
    const slug = getSportSlug(match.sport);
    if (!slug || !match.gameId) return;
    navigate(`/${slug}/${match.gameId}`);
  };


  const hasData = matchData.length > 0;

  return (
    <div className="mt-6 rounded-[5px]">
      <h2 className="text-[#243a48] text-base font-bold">Fancy</h2>

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
          onViewDetails={handleViewDetails}
          onBookMaster={handleOpenMasterBook}
          bettingDataMap={bettingDataMap}
          bettingDataLoadingMap={bettingDataLoadingMap}
        />
      ))}

      {masterBookPopup.show && (
        <FancyMasterBookPopup
          teamName={masterBookPopup.teamName}
          onClose={() => setMasterBookPopup({ show: false, teamName: '' })}
        />
      )}
    </div>
  );
}

export default FancyBet;
