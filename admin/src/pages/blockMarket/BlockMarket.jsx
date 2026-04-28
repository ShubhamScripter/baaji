import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from 'react-redux';
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import ConfirmBox from "./ConfirmBox";

function BlockMarket() {
  const user = useSelector(state => state.auth.user);
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [confirmBoxText, setConfirmBoxText] = useState("");
  const [selectedSport, setSelectedSport] = useState("cricket");
  const [selectedMarket, setSelectedMarket] = useState(null); // sport key for confirm modal
  const [sportLoading, setSportLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [marketLocks, setMarketLocks] = useState({});
  const [seriesRows, setSeriesRows] = useState([]);
  const [expandedSeries, setExpandedSeries] = useState({});
  const [savingMatchIds, setSavingMatchIds] = useState([]);

  const sportRows = [
    { id: 1, key: "soccer", betfairId: 1, name: "Soccer", apiGameName: "soccer" },
    { id: 2, key: "tennis", betfairId: 2, name: "Tennis", apiGameName: "tennis" },
    { id: 3, key: "cricket", betfairId: 4, name: "Cricket", apiGameName: "cricket" },
    { id: 4, key: "casino", betfairId: 6, name: "Casino", apiGameName: "Casino" },
  ];

  const normaliseKey = (name = "") => name.toLowerCase().replace(/\s+/g, "");

  const activeSportApiRow = useMemo(
    () => sportRows.find((row) => row.key === selectedSport),
    [selectedSport]
  );

  const openModal = () => setShowConfirmBox(true);
  const closeModal = () => setShowConfirmBox(false);

  const fetchSportLocks = async () => {
    if (!user?.id) return;
    try {
      setSportLoading(true);
      const { data } = await axiosInstance.post("/sub-admin/profile-data", { userId: user.id });
      const apiGamelock = data?.data?.settings?.gamelock || [];

      const lockMap = {};
      apiGamelock.forEach((entry) => {
        lockMap[normaliseKey(entry.game)] = Boolean(entry.lock);
      });

      const nextState = {};
      sportRows.forEach((sport) => {
        if (!sport.apiGameName) {
          nextState[sport.key] = true;
          return;
        }
        const apiKey = normaliseKey(sport.apiGameName);
        nextState[sport.key] = lockMap[apiKey] ?? true;
      });
      setMarketLocks(nextState);
    } catch (error) {
      console.error("Failed to fetch game locks:", error);
      toast.error("Unable to load sport lock status");
    } finally {
      setSportLoading(false);
    }
  };

  const toggleMarket = (marketKey) => {
    const isCurrentlyOn = marketLocks[marketKey];
    const targetRow = sportRows.find((s) => s.key === marketKey);

    if (!targetRow) return;
    setConfirmBoxText(
      `Do you want to ${isCurrentlyOn ? "Inactive" : "Active"} ${targetRow.name}?`
    );
    setSelectedMarket(marketKey);
    openModal();
  };

  const fetchSeriesForSport = async (sportKey) => {
    const sport = sportRows.find((row) => row.key === sportKey);
    if (!sport) return;

    if (!["cricket", "soccer", "tennis"].includes(sport.key)) {
      setSeriesRows([]);
      return;
    }

    setSeriesLoading(true);
    try {
      let endpoint = "";
      if (sport.key === "cricket") endpoint = "/cricket/matches";
      if (sport.key === "soccer") endpoint = "/soccer";
      if (sport.key === "tennis") endpoint = "/tennis";

      const [{ data }, { data: deactivatedData }] = await Promise.all([
        axiosInstance.get(endpoint),
        axiosInstance.get("/match-settings/deactivated?limit=5000"),
      ]);
      const list = Array.isArray(data?.matches)
        ? data.matches
        : Array.isArray(data?.data)
          ? data.data
          : [];
      const deactivatedRows = deactivatedData?.data?.matches || [];

      const marketLocksByMatchId = {};
      deactivatedRows.forEach((entry) => {
        const entrySport = String(entry?.sport || "").toLowerCase();
        if (entrySport !== sport.key) return;

        const matchId = String(entry?.matchId || "").trim();
        if (!matchId) return;
        marketLocksByMatchId[matchId] = {
          matchOdds: entry?.marketLocks?.matchOdds ?? true,
          bookmaker: entry?.marketLocks?.bookmaker ?? true,
          fancy: entry?.marketLocks?.fancy ?? true,
        };
      });

      const groupedSeries = new Map();

      list.forEach((row, index) => {
        const seriesName =
          row?.cname ||
          row?.seriesName ||
          row?.series ||
          row?.competition ||
          "Others";
        const seriesDate = row?.date || row?.openDate || row?.createdAt || "-";
        const seriesKey = `${sport.key}-${seriesName}`;

        if (!groupedSeries.has(seriesKey)) {
          groupedSeries.set(seriesKey, {
            id: seriesKey,
            srNo: groupedSeries.size + 1,
            seriesName,
            date: seriesDate,
            matchOdds: true,
            bookmaker: true,
            fancy: true,
            matches: [],
          });
        }

        const seriesEntry = groupedSeries.get(seriesKey);
        const matchId = String(
          row?.id || row?.marketId || `${seriesKey}-match-${index + 1}`
        );
        const savedLocks = marketLocksByMatchId[matchId] || {
          matchOdds: true,
          bookmaker: true,
          fancy: true,
        };

        seriesEntry.matches.push({
          id: matchId,
          srNo: seriesEntry.matches.length + 1,
          matchName: row?.match || row?.eventName || "Unknown Match",
          market:
            row?.market ||
            row?.marketName ||
            row?.mtype ||
            "Match Odds",
          date: row?.date || row?.openDate || row?.createdAt || "-",
          matchOdds: savedLocks.matchOdds,
          bookmaker: savedLocks.bookmaker,
          fancy: savedLocks.fancy,
        });
      });

      const preparedSeries = Array.from(groupedSeries.values())
        .map((series) => ({
          ...series,
          matchOdds: series.matches.every((m) => m.matchOdds),
          bookmaker: series.matches.every((m) => m.bookmaker),
          fancy: series.matches.every((m) => m.fancy),
        }))
        .slice(0, 20);

      setSeriesRows(preparedSeries);
      setExpandedSeries({});
    } catch (error) {
      console.error("Failed to fetch series list:", error);
      setSeriesRows([]);
      toast.error("Unable to load games listing");
    } finally {
      setSeriesLoading(false);
    }
  };

  useEffect(() => {
    fetchSportLocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    fetchSeriesForSport(selectedSport);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSport]);

  const getApiSport = (sportKey) => {
    if (sportKey === "cricket") return "cricket";
    if (sportKey === "soccer") return "soccer";
    if (sportKey === "tennis") return "tennis";
    return null;
  };

  const updateMatchActivation = async (match, marketType, isEnabled) => {
    const matchId = String(match?.id || "");
    const apiSport = getApiSport(selectedSport);
    if (!matchId || !apiSport) return;

    setSavingMatchIds((prev) =>
      prev.includes(matchId) ? prev : [...prev, matchId]
    );
    try {
      await axiosInstance.patch(`/block-market/match-visibility`, {
        matchId,
        sport: apiSport,
        matchName: match?.matchName || "Unknown Match",
        marketType,
        isEnabled,
      });
    } finally {
      setSavingMatchIds((prev) => prev.filter((id) => id !== matchId));
    }
  };

  const syncSeriesActivation = async (seriesId, nextRows, marketType) => {
    const series = nextRows.find((row) => row.id === seriesId);
    if (!series || !Array.isArray(series.matches)) return;

    const tasks = series.matches.map((match) =>
      updateMatchActivation(match, marketType, Boolean(match[marketType]))
    );

    try {
      await Promise.all(tasks);
      toast.success(`Updated ${series.seriesName} status`);
    } catch (error) {
      console.error("Failed to sync series activation:", error);
      toast.error("Unable to update league status");
      fetchSeriesForSport(selectedSport);
    }
  };

  const syncMatchActivation = async (seriesId, matchId, nextRows, marketType) => {
    const series = nextRows.find((row) => row.id === seriesId);
    const match = series?.matches?.find((m) => m.id === matchId);
    if (!match) return;

    try {
      await updateMatchActivation(match, marketType, Boolean(match[marketType]));
      toast.success(`Updated ${match.matchName} status`);
    } catch (error) {
      console.error("Failed to sync match activation:", error);
      toast.error("Unable to update match status");
      fetchSeriesForSport(selectedSport);
    }
  };

  const toggleSeriesFlag = (rowId, key) => {
    const updatedRows = seriesRows.map((row) => {
      if (row.id !== rowId) return row;
      const toggledValue = !row[key];
      return {
        ...row,
        [key]: toggledValue,
        matches: row.matches.map((match) => ({ ...match, [key]: toggledValue })),
      };
    });

    setSeriesRows(updatedRows);
    syncSeriesActivation(rowId, updatedRows, key);
  };

  const toggleMatchFlag = (seriesId, matchId, key) => {
    const updatedRows = seriesRows.map((series) =>
      series.id !== seriesId
        ? series
        : {
            ...series,
            matches: series.matches.map((match) =>
              match.id === matchId ? { ...match, [key]: !match[key] } : match
            ),
          }
    );

    setSeriesRows(updatedRows);
    syncMatchActivation(seriesId, matchId, updatedRows, key);
  };

  const isMatchSaving = (matchId) => savingMatchIds.includes(String(matchId));
  const isSeriesSaving = (series) =>
    (series?.matches || []).some((match) => isMatchSaving(match.id));

  const toggleSeriesExpand = (seriesId) => {
    setExpandedSeries((prev) => ({ ...prev, [seriesId]: !prev[seriesId] }));
  };

  const handleConfirmResponse = async (confirmed) => {
    if (!confirmed || !selectedMarket || !user?.id) {
      closeModal();
      setSelectedMarket(null);
      return;
    }
    try {
      const targetRow = sportRows.find((s) => s.key === selectedMarket);
      if (!targetRow) return;

      const currentStatus = marketLocks[selectedMarket];

      // Sports without API mapping are UI-only for now.
      if (!targetRow.apiGameName) {
        setMarketLocks((prev) => ({ ...prev, [selectedMarket]: !prev[selectedMarket] }));
        toast.success(`${targetRow.name} status updated`);
        return;
      }

      const response = await axiosInstance.patch(`/gamelock/${user.id}`, {
        game: targetRow.apiGameName,
        lock: !currentStatus
      });

      if (response.status === 200 || response.status === 201) {
        setMarketLocks((prev) => ({
          ...prev,
          [selectedMarket]: !prev[selectedMarket],
        }));
        const newStatus = currentStatus ? "deactivated" : "activated";
        toast.success(`${targetRow.name} has been ${newStatus} successfully`);
      }
    } catch (err) {
      console.error("Error updating game lock status:", err);
      const errorMessage = err.response?.data?.message || "Failed to update game lock status";
      toast.error(errorMessage);
    } finally {
      closeModal();
      setSelectedMarket(null);
    }
  };

  return (
    <div className='mt-4 p-2 font-["Times_New_Roman"]'>
      <h2 className="text-[#243a48] text-[32px] leading-none font-[700]">Sport Listing</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="table w-full table-fixed">
          <thead className="bg-[#4d5768] border-y border-y-[#7e97a7] text-white text-sm">
            <tr>
              <th className="px-4 py-2 text-left w-[8%]">S.No.</th>
              <th className="px-4 py-2 text-left w-[15%]">Betfair ID</th>
              <th className="px-4 py-2 text-left w-[30%]">Name</th>
              <th className="px-4 py-2 text-left w-[27%]">Status</th>
              <th className="px-4 py-2 text-left w-[20%]">Action</th>
            </tr>
          </thead>
          <tbody className="border-y border-y-[#c9c9c9] bg-white text-xs">
            {sportRows.map((item) => (
              <tr key={item.id} className="border-y border-y-[#7e97a7]">
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3">{item.betfairId}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  {item.name} is {marketLocks[item.key] ? "ON" : "OFF"}
                </td>
                <td className="px-4 py-3">
                  <div
                      className={`rounded-4xl w-12 h-6 flex items-center relative transition-all ${
                        sportLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      } ${
                        marketLocks[item.key]
                          ? "bg-[#2196f3] border border-[#2196f3]"
                          : "border border-[#464541]"
                      }`}
                      onClick={() => !sportLoading && toggleMarket(item.key)}
                    >
                      <span
                        className={`w-4 h-4 block rounded-full transition-all ${
                          marketLocks[item.key] ? "bg-[#f0ece1] right-1" : "bg-[#6d6b64] left-1"
                        } absolute`}
                      ></span>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <h2 className="text-[#243a48] text-[32px] leading-none font-[700]">Games Listing</h2>
        <div className="border border-[#ccc] bg-white shadow-[inset_0_2px_0_0_#0000001a]">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="outline-none text-sm px-3 py-2 min-w-[220px]"
          >
            {sportRows.map((row) => (
              <option key={row.key} value={row.key}>
                {row.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="table w-full table-fixed">
          <thead className="bg-[#4d5768] border-y border-y-[#7e97a7] text-white text-sm">
            <tr>
              <th className="px-2 py-2 text-left w-[7%]">S.No.</th>
              <th className="px-2 py-2 text-left w-[33%]">Series Name</th>
              <th className="px-2 py-2 text-left w-[18%]">Date</th>
              <th className="px-2 py-2 text-left w-[12%]">Match Odds ON/OFF</th>
              <th className="px-2 py-2 text-left w-[12%]">Book Maker ON/OFF</th>
              <th className="px-2 py-2 text-left w-[10%]">Fancy ON/OFF</th>
            </tr>
          </thead>
          <tbody className="border-y border-y-[#c9c9c9] bg-white text-xs">
            {seriesLoading ? (
              <tr>
                <td colSpan="6" className="px-2 py-4 text-center">Loading...</td>
              </tr>
            ) : seriesRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-2 py-4 text-center">
                  No series available for {activeSportApiRow?.name || "selected sport"}.
                </td>
              </tr>
            ) : (
              seriesRows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className="border-y border-y-[#7e97a7]">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSeriesExpand(row.id)}
                          className="w-4 h-4 rounded-full bg-[#19b8dc] text-white leading-none text-[10px]"
                        >
                          {expandedSeries[row.id] ? "-" : "+"}
                        </button>
                        <span>{row.srNo}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2">{row.seriesName}</td>
                    <td className="px-2 py-2">{row.date}</td>
                    <td className="px-2 py-2">
                      <Switch on={row.matchOdds} onToggle={() => toggleSeriesFlag(row.id, "matchOdds")} disabled={isSeriesSaving(row)} />
                    </td>
                    <td className="px-2 py-2">
                      <Switch on={row.bookmaker} onToggle={() => toggleSeriesFlag(row.id, "bookmaker")} disabled={isSeriesSaving(row)} />
                    </td>
                    <td className="px-2 py-2">
                      <Switch on={row.fancy} onToggle={() => toggleSeriesFlag(row.id, "fancy")} disabled={isSeriesSaving(row)} />
                    </td>
                  </tr>
                  {expandedSeries[row.id] && row.matches?.length > 0 && (
                    <tr className="border-y border-y-[#7e97a7] bg-[#f7f7f7]">
                      <td colSpan="6" className="p-0">
                        <table className="w-full table-fixed text-xs">
                          <thead className="bg-[#4d5768] text-white">
                            <tr>
                              <th className="px-2 py-2 text-left w-[7%]">S.No.</th>
                              <th className="px-2 py-2 text-left w-[23%]">Match Name</th>
                              <th className="px-2 py-2 text-left w-[17%]">Market</th>
                              <th className="px-2 py-2 text-left w-[15%]">Date</th>
                              <th className="px-2 py-2 text-left w-[12%]">Match Odds ON/OFF</th>
                              <th className="px-2 py-2 text-left w-[12%]">Book Maker ON/OFF</th>
                              <th className="px-2 py-2 text-left w-[8%]">Fancy ON/OFF</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.matches.map((match) => (
                              <tr key={match.id} className="border-y border-y-[#d4d4d4] bg-white">
                                <td className="px-2 py-2">{match.srNo}</td>
                                <td className="px-2 py-2">{match.matchName}</td>
                                <td className="px-2 py-2">{match.market}</td>
                                <td className="px-2 py-2">{match.date}</td>
                                <td className="px-2 py-2">
                                  <Switch on={match.matchOdds} onToggle={() => toggleMatchFlag(row.id, match.id, "matchOdds")} disabled={isMatchSaving(match.id)} />
                                </td>
                                <td className="px-2 py-2">
                                  <Switch on={match.bookmaker} onToggle={() => toggleMatchFlag(row.id, match.id, "bookmaker")} disabled={isMatchSaving(match.id)} />
                                </td>
                                <td className="px-2 py-2">
                                  <Switch on={match.fancy} onToggle={() => toggleMatchFlag(row.id, match.id, "fancy")} disabled={isMatchSaving(match.id)} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Box */}
      {showConfirmBox && (
        <ConfirmBox
          onClose={closeModal}
          setConfirmResponse={handleConfirmResponse}
          confirmBoxtext={confirmBoxText}
        />
      )}
    </div>
  );
}

function Switch({ on, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`rounded-4xl w-12 h-6 flex items-center relative transition-all ${
        on ? "bg-[#2196f3] border border-[#2196f3]" : "border border-[#464541]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`w-4 h-4 block rounded-full transition-all ${
          on ? "bg-[#f0ece1] right-1" : "bg-[#6d6b64] left-1"
        } absolute`}
      />
    </button>
  );
}

export default BlockMarket;
