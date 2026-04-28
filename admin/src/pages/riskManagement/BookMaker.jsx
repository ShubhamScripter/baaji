import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion"; //eslint-disable-line
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { fetchBookmakerSummary } from "../../store/riskSlice";
import {
  masterBookReducer,
  masterBookReducerDownline,
} from "../../store/marketAnalyzeReducer";
import { useNavigate } from "react-router";


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

const OddsDetails = ({ odds }) => (
  <tr>
    <td></td>
    <td colSpan={5} className="pb-2 bg-gray-100">
      <div className="max-w-[80%] mx-auto bg-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left px-1 py-1 w-[40%] font-medium">{odds.length} selections Selections</th>
              <th className="text-left px-1 py-1 w-[20%] font-medium" colSpan={2}>100.8%</th>
              <th className="py-1 bg-[#72bbef] w-[10%]">Back all</th>
              <th className="py-1 bg-[#faa9ba] w-[10%]">Lay all</th>
              <th className="text-left px-1 py-1 w-[20%] font-medium" colSpan={2}>99.5%</th>
            </tr>
          </thead>
          <tbody className="border border-y border-y-[#7e97a7]">
            {odds.map((o, j) => (
              <tr key={j} className="border-y border-y-[#7e97a7]">
                <td className="px-2 py-1 border-r border-r-[#7e97a7] bg-white w-[40%]">
                  <span className="text-xs font-bold">{o.team}</span>
                </td>
                <td className="text-center py-1 border-r border-r-[#7e97a7] bg-[#beddf3] w-[10%]">
                  <div className="font-bold">1.3</div>
                  <div>4000</div>
                </td>
                <td className="text-center py-1 border-r border-r-[#7e97a7] bg-[#a2ceed] w-[10%]">
                  <div className="font-bold">2.6</div>
                  <div>700</div>
                </td>
                <td className="text-center py-1 border-r border-r-[#7e97a7] bg-[#72bbef] w-[10%]">
                  <div className="font-bold">1.9</div>
                  <div>1287</div>
                </td>
                <td className="text-center py-1 border-r border-r-[#7e97a7] bg-[#faa9ba] w-[10%]">
                  <div className="font-bold">2.7</div>
                  <div>42112</div>
                </td>
                <td className="text-center py-1 border-r border-r-[#7e97a7] bg-[#fad1da] w-[10%]">
                  <div className="font-bold">3.5</div>
                  <div>1343</div>
                </td>
                <td className="text-center py-1 border-r border-r-[#7e97a7] bg-[#fae5ea] w-[10%]">
                  <div className="font-bold">4.1</div>
                  <div>5212</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </td>
  </tr>
);

const SportTable = ({
  sport,
  matches,
  activeRows,
  onToggle,
  onViewDetails,
  onViewBook,
  onEventType
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
              onToggle={() => onToggle(match.idx)}
              onViewDetails={onViewDetails}
              onViewBook={onViewBook}
              onEventType={onEventType}
            />
            {isOpen && match.odds.length > 0 && (
              <OddsDetails odds={match.odds} />
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


function BookMaker() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedGametype, setSelectedGametype] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const { bookmaker, bookmakerLoading, bookmakerError } = useSelector(
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

  useEffect(() => {
    dispatch(fetchBookmakerSummary());
  }, [dispatch]);

  const matchData = useMemo(
    () => (bookmaker || []).map(buildMatch),
    [bookmaker]
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

  const toggleRow = (index) => {
    setActiveRows((prev) => (prev === index ? null : index));
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
      <h2 className="text-[#243a48] text-base font-bold">BookMaker</h2>

      {bookmakerLoading && (
        <div className="px-3 py-2 text-xs text-gray-600">Loading...</div>
      )}

      {bookmakerError && !bookmakerLoading && (
        <div className="px-3 py-2 text-xs text-red-600">{bookmakerError}</div>
      )}

      {!bookmakerLoading && !bookmakerError && !hasData && (
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

export default BookMaker;
