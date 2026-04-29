import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion"; //eslint-disable-line
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { fetchMatchOddsSummary } from "../../store/riskSlice";
import {
  masterBookReducer,
  masterBookReducerDownline,
} from "../../store/marketAnalyzeReducer";
import { useNavigate } from "react-router";
import api from "../../utils/axiosInstance";

// "India v Pakistan" -> ["India", "Pakistan"]
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

const renderPL = (value) => {
  if (value === "" || value == null) return "-";
  return `(${value})`;
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
    gameId: item.gameId,
    gameType: item.gameType || "Match Odds",
    outcomes,
    odds,
    playerPL: {
      one: findPL(team1),
      two: findPL(team2),
    },
  };
};

const pratnerShip = (role, amount, part) => {
  const roundedAmount = Math.round(amount * 100) / 100;
  if (role === "user") {
    return roundedAmount;
  }
  return Math.round(roundedAmount * ((100 - part) / 100) * 100) / 100;
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

const PLCell = ({ value }) => {
  const isNegative = Number(value) < 0;
  const color = isNegative ? "text-red-600" : "text-green-600";
  return <td className={`w-[8%] px-2 py-1.5 ${color}`}>{renderPL(value)}</td>;
};

const SportHeader = ({ sport }) => (
  <thead>
    <tr className="bg-gray-600 text-white w-full text-[13px]">
      <th colSpan={2} className="w-[66%] text-left px-2 py-1.5 capitalize">
        {sport}
      </th>
      <th className="w-[8%] px-2 py-1.5 text-left">1</th>
      <th className="w-[8%] px-2 py-1.5 text-left">X</th>
      <th className="w-[8%] px-2 py-1.5 text-left">2</th>
      <th className="w-[10%] px-2 py-1.5 border-l border border-gray-200">
        Downline P/L
      </th>
    </tr>
  </thead>
);

const MatchRow = ({ match, isOpen, onToggle, onViewDetails, onViewBook , onEventType }) => (
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
        <span
          className="bg-yellow-300 border border-yellow-500 text-black text-[12px] font-bold rounded-[3px] p-1 leading-none cursor-pointer"
          onClick={() => onViewDetails(match)}
        >
          View Details
        </span>
        <span className="text-blue-700 underline" onClick={() => onEventType(match)}>{match.event}</span>
        <FaArrowAltCircleRight className="text-gray-500 size-3" />
        <span className="text-blue-700 underline">{match.gameType}</span>
      </div>
    </td>
    <PLCell value={match.playerPL.one} />
    <td className="w-[8%] px-2 py-1.5">-</td>
    <PLCell value={match.playerPL.two} />
    <td className="w-[10%] px-2 py-3 border-l border-gray-300 text-center">
      <span
        className="bg-yellow-100/50 border border-yellow-400 py-2 px-5 cursor-pointer hover:bg-yellow-200"
        onClick={() => onViewBook(match)}
      >
        View
      </span>
    </td>
  </tr>
);

// Map sport to the live betting-data endpoint (mirrors marketAnalyzeReducer).
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

const extractMatchOddsMarket = (bettingData) => {
  if (!Array.isArray(bettingData)) return null;
  const market = bettingData.find(
    (item) =>
      item?.mname === "MATCH_ODDS" || item?.mname === "TOURNAMENT_WINNER"
  );
  if (!market || !Array.isArray(market.section)) return null;

  const rows = market.section.map((sec) => ({
    team: sec.nat,
    sid: sec.sid,
    odds: Array.isArray(sec.odds) ? sec.odds : [],
    status: sec.gstatus,
  }));

  return {
    rows,
    status: market.status,
    min: market.min,
    maxb: market.maxb,
  };
};

const ODDS_COL_COLORS = [
  "bg-[#beddf3]",
  "bg-[#a2ceed]",
  "bg-[#72bbef]",
  "bg-[#faa9ba]",
  "bg-[#fad1da]",
  "bg-[#fae5ea]",
];

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

const OddsDetails = ({ bettingData, isLoading, fallbackOdds }) => {
  if (isLoading) return <OddsDetailsMessage>Loading odds...</OddsDetailsMessage>;

  const market = extractMatchOddsMarket(bettingData);
  console.log("[OddsDetails] render", { bettingData, market });

  const rows = market?.rows && market.rows.length > 0
      ? market.rows
      : (fallbackOdds || []).map((o) => ({
          team: o.team,
          sid: o.team,
          odds: [],
          status: "",
        }));

  if (!rows.length) {
    return <OddsDetailsMessage>No odds available</OddsDetailsMessage>;
  }

  return (
    <tr>
      <td></td>
      <td colSpan={5} className="pb-2 bg-gray-100">
        <div className="max-w-[80%] mx-auto bg-gray-200 relative">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left px-1 py-1 w-[40%] font-medium">
                  {rows.length} Selections
                </th>
                <th
                  className="text-left px-1 py-1 w-[20%] font-medium"
                  colSpan={2}
                ></th>
                <th className="py-1 bg-[#72bbef] w-[10%]">Back</th>
                <th className="py-1 bg-[#faa9ba] w-[10%]">Lay</th>
                <th
                  className="text-left px-1 py-1 w-[20%] font-medium"
                  colSpan={2}
                ></th>
              </tr>
            </thead>
            <tbody className="border border-y border-y-[#7e97a7]">
              {rows.map((row, j) => {
                const rowSuspended = row.status === "SUSPENDED";
                return (
                  <tr
                    key={row.sid ?? j}
                    className="border-y border-y-[#7e97a7]"
                  >
                    <td className="px-2 py-1 border-r border-r-[#7e97a7] bg-white w-[40%]">
                      <span className="text-xs font-bold">{row.team}</span>
                    </td>
                    {rowSuspended ? (
                      <td colSpan={6} className="relative p-0 w-[60%]">
                        <div className="grid grid-cols-6 opacity-40">
                          {ODDS_COL_COLORS.map((color, i) => {
                            const odd = row.odds?.[i];
                            return (
                              <div
                                key={i}
                                className={`text-center py-1 border-r border-r-[#7e97a7] ${color}`}
                              >
                                <div className="font-bold">
                                  {odd?.odds ?? "-"}
                                </div>
                                <div>{formatSize(odd?.size)}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-red-600 text-sm font-bold tracking-widest">
                            SUSPENDED
                          </span>
                        </div>
                      </td>
                    ) : (
                      ODDS_COL_COLORS.map((color, i) => {
                        const odd = row.odds?.[i];
                        return (
                          <td
                            key={i}
                            className={`text-center py-1 border-r border-r-[#7e97a7] ${color} w-[10%]`}
                          >
                            <div className="font-bold">
                              {odd?.odds ?? "-"}
                            </div>
                            <div>{formatSize(odd?.size)}</div>
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
  onViewBook,
  onEventType,
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
              onViewBook={onViewBook}
              onEventType={onEventType}
            />
            {isOpen && (
              <OddsDetails
                bettingData={bettingDataMap?.[match.gameId]}
                isLoading={!!bettingDataLoadingMap?.[match.gameId]}
                fallbackOdds={match.odds}
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


function MatchOdds() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedGametype, setSelectedGametype] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const { matchOdds, matchOddsLoading, matchOddsError } = useSelector(
    (state) => state.risk
  );
  const { masterData, masterDataDownline, loader } = useSelector(
    (state) => state.market
  );

  const [activeRows, setActiveRows] = useState({});
  const [showMasterDownline, setShowMasterDownline] = useState(false);
  const [riskBetfair, setRiskBetfair] = useState(false);
  const [masterDownline, setMasterDownline] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [masterContext, setMasterContext] = useState(null);
  const [bettingDataMap, setBettingDataMap] = useState({});
  const [bettingDataLoadingMap, setBettingDataLoadingMap] = useState({});

  useEffect(() => {
    dispatch(fetchMatchOddsSummary());
  }, [dispatch]);

  const matchData = useMemo(
    () => (matchOdds || []).map(buildMatch),
    [matchOdds]
  );

  const groupedBySport = useMemo(() => groupBySport(matchData), [matchData]);

  useEffect(() => {
    if (Array.isArray(masterData) && masterData.length > 0) {
      setMasterDownline(masterData);
    }
  }, [masterData]);

  useEffect(() => {
    if (Array.isArray(masterDataDownline) && masterDataDownline.length > 0) {
      setMasterDownline(masterDataDownline);
    }
  }, [masterDataDownline]);

  useEffect(() => {
    document.body.style.overflow = showMasterDownline ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMasterDownline]);

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

  const handleViewBook = async (match) => {
    if (!match?.gameId) return;
    setSelectedEvent(match.event);
    setSelectedGametype(match.gameType);
    const eventTeams = (match.odds || [])
      .map((o) => o.team)
      .filter(Boolean);
    const outcomeTeams = (match.outcomes || [])
      .map((o) => o.teamName)
      .filter(Boolean);

    const finalHeaders = [...eventTeams];
    outcomeTeams.forEach((t) => {
      if (!finalHeaders.some((existing) => isSameTeam(existing, t))) {
        finalHeaders.push(t);
      }
    });
    if (!finalHeaders.length) finalHeaders.push(...outcomeTeams);

    setMasterDownline([]);
    setTeamHeaders(finalHeaders);
    setMasterContext({
      gameId: match.gameId,
      gameType: match.gameType || "Match Odds",
      teamHeaders: finalHeaders,
    });
    setShowMasterDownline(true);

    try {
      await dispatch(
        masterBookReducer({
          userId: "",
          gameid: match.gameId,
          gameType: match.gameType || "Match Odds",
        })
      );
    } catch (err) {
      console.error("Failed to load master book", err);
    }
  };

  const handleEventBook = (match) => {
    if (!match) return;
    setSelectedEvent(match.event);
    setSelectedGametype(match.gameType);
    setSelectedSport(match.sport);
    setRiskBetfair(true);
  };

  const handleDownlineDrill = async (userId) => {
    if (!masterContext) return;
    try {
      setMasterDownline([]);
      await dispatch(
        masterBookReducerDownline({
          userId,
          gameid: masterContext.gameId,
          gameType: masterContext.gameType,
        })
      );
    } catch (err) {
      console.error("Failed to load master book downline", err);
    }
  };

  const closeMasterBook = () => {
    setMasterDownline([]);
    setShowMasterDownline(false);
    setMasterContext(null);
    setTeamHeaders([]);
  };

  const hasData = matchData.length > 0;

  return (
    <div className="mt-6 rounded-[5px]">
      <h2 className="text-[#243a48] text-base font-bold">Match Odds</h2>

      {matchOddsLoading && (
        <div className="px-3 py-2 text-xs text-gray-600">Loading...</div>
      )}

      {matchOddsError && !matchOddsLoading && (
        <div className="px-3 py-2 text-xs text-red-600">{matchOddsError}</div>
      )}

      {!matchOddsLoading && !matchOddsError && !hasData && (
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
          onViewBook={handleViewBook}
          onEventType={handleEventBook}
          bettingDataMap={bettingDataMap}
          bettingDataLoadingMap={bettingDataLoadingMap}
        />
      ))}

      {showMasterDownline && (
        <div className="modal-overlay1 fixed top-0 left-0 w-full h-full z-9999 bg-black/40 flex items-start justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="modal-content h-full w-full rounded-lg bg-[#fbf9ed] shadow-lg"
          >
            <div className="modal-header flex justify-between p-3 bg-yellow-400">
            <span className="font-semibold text-2xl">
              {selectedEvent} {" "} ( {selectedGametype} )
            </span>
              <span
                className="cursor-pointer leading-none text-[20px] flex items-center"
                onClick={closeMasterBook}
              >
                <span className="text-[30px]">×</span> Close</span>
            </div>
            <div className="modal-body mt-2 mb-5">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-center text-sm">
                      <th className="w-[60%] text-left py-1.5 px-2">Downline</th>
                      {teamHeaders.map((team) => (
                        <th key={team.id} className="w-[20%] bg-yellow-100 py-1.5 px-2">
                          {team}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loader && (
                      <tr>
                        <td
                          colSpan={teamHeaders.length + 2}
                          className="p-4 text-center"
                        >
                          Loading...
                        </td>
                      </tr>
                    )}

                    {!loader && masterDownline?.length > 0 ? (
                      masterDownline.map((item, index) => (
                        <tr
                          key={index}
                          className="text-center text-sm bg-white border-t border-b border-gray-200"
                        >
                          <td
                            className="cursor-pointer w-[60%] text-left py-1.5 px-2 underline"
                            onClick={() => handleDownlineDrill(item.id)}
                          >
                            {item.userName}
                          </td>
                          
                          {teamHeaders.map((team, i) => {
                            const isSelected = isSameTeam(item.teamName, team);
                            let displayValue;
                            if (item.otype === "back") {
                              displayValue = isSelected
                                ? item.totalBetAmount
                                : -item.totalPrice;
                            } else {
                              displayValue = isSelected
                                ? -item.totalPrice
                                : item.totalBetAmount;
                            }

                            const roundedValue = pratnerShip(
                              item.userRole,
                              displayValue,
                              item.partnership
                            );
                            const numericValue = parseFloat(roundedValue) || 0;
                            const colorClass =
                              numericValue >= 0
                                ? "text-green-600"
                                : "text-red-500";

                            return (
                              <td key={i} className="w-[20%] py-1.5 px-2">
                                <span className={colorClass}>
                                  {roundedValue}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      !loader && (
                        <tr>
                          <td
                            colSpan={teamHeaders.length + 2}
                            className="py-4 text-center"
                          >
                            No data available
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {riskBetfair && (
        <div className="modal-overlay1 fixed top-0 left-0 w-full h-full z-9999 bg-black/40 flex items-start justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="modal-content h-full w-full rounded-lg bg-[#fbf9ed] shadow-lg"
          >
            <div className="modal-header flex justify-between p-3 bg-yellow-400">
            <span className="font-semibold text-2xl">
              {selectedSport}
            </span>
              <span
                className="cursor-pointer leading-none text-[20px] flex items-center"
                onClick={() => setRiskBetfair(false)}
              >
                <span className="text-[30px]">×</span> Close</span>
            </div>
            <div className="modal-body mt-2 mb-5 p-2">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-gray-700 text-white">
                      <th colSpan={6} className="text-left px-2 py-1.5">2026-01-01</th>
                    </tr>
                    <tr>
                      <th rowSpan={2} className="border-b border-r border-gray-500 bg-gray-200 text-left px-2">Event Name</th>
                      <th rowSpan={2} className="border-b border-r border-gray-500 bg-gray-200 text-left px-2">Selection Name</th>
                      <th colSpan={2} className="border-b border-r border-gray-500 bg-[#72bbef]">Back</th>
                      <th colSpan={2} className="border-b border-gray-500 bg-[#faa9ba]">Lay</th>
                    </tr>
                    <tr>
                      <th className="border-b border-r border-gray-500 bg-[#72bbef] text-left px-2">Avg.odds</th>
                      <th className="border-b border-gray-500 bg-[#72bbef] text-left px-2">stake</th>
                      <th className="border-b border-r border-gray-500 bg-[#faa9ba] text-left px-2">Avg.odds</th>
                      <th className="border-b border-gray-500 bg-[#faa9ba] text-left px-2">stake</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default MatchOdds;
