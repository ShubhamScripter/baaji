import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeaderLogin from '../../components/Header/HeaderLogin';
import { MdArrowBackIos } from "react-icons/md";
import BetCard from '../../components/Bethistory/BetCard';
import BetTypeFilter from '../../components/Bethistory/BetTypeFilter';
import DateRangeFilter from '../../components/Bethistory/DateRangeFilter';
import { getPresetRange } from '../../utils/dateRangePresets';
import { getBetHistory } from '../../features/sports/betReducer';
import {
  MARKET_OPTIONS,
  buildSportOptions,
  getBetMarket,
  getBetSport,
} from '../../utils/betCategories';

function BetHistory() {
  const dispatch = useDispatch();
  const { betHistory, loading, errorMessage } = useSelector((state) => state.bet);

  const [dateRange, setDateRange] = useState(() => getPresetRange('1month'));
  // { sports: [...keys], markets: [...keys] } — empty array means "no restriction"
  const [betTypeFilter, setBetTypeFilter] = useState({ sports: [], markets: [] });
  const [page, setPage] = useState(1);
  const [selectedVoid, setSelectedVoid] = useState('settel');
  const limit = 100;

  // Helper function to determine status based on void and settled fields
  const getStatusFromVoid = (voidStatus, settled) => {
    if (voidStatus === 'void') return 'Voided';
    if (settled === 'settled') return 'Completed';
    return 'Cancelled';
  };

  useEffect(() => {
    dispatch(
      getBetHistory({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page,
        selectedGame: '',
        selectedVoid,
        limit,
      })
    );
  }, [dispatch, dateRange, page, selectedVoid, limit]);

  // Map the API response to the shape BetCard expects, keeping the sport and
  // market keys used by the Bet Type filter.
  const mappedBetData = useMemo(() => {
    if (!Array.isArray(betHistory)) return [];

    return betHistory.map((bet, idx) => {
      const stake = Number(bet.betAmount ?? bet.price ?? 0);
      const odds = Number(bet.xValue ?? 0);
      const expectedProfit = Number(bet.betAmount ?? 0);
      const expectedLoss = Number(bet.price ?? 0);
      const actualNet = Number(bet.profitLossChange ?? bet.resultAmount ?? 0);
      const sport = getBetSport(bet);

      return {
        id: bet._id || bet.id || `bet-${idx}`,
        sportKey: sport.key,
        sportLabel: sport.label,
        marketKey: getBetMarket(bet),
        plId: bet.userName || "user",
        betId: bet.betId || bet._id || `bet-${idx}`,
        ipAddress: bet.ip || "-",
        match: bet.eventName || 'Unknown Match',
        market: bet.marketName || 'Unknown Market',
        gameName: bet.gameName || '—',
        eventName: bet.eventName || '—',
        type: bet.otype === 'back' ? 'Back' : 'Lay',
        selection: bet.teamName || 'Unknown Selection',
        odd: odds,
        oddsReq: bet.xValue || 0,
        avgOdds: bet.xValue || 0,
        matched: bet.price || 0,
        stake,
        profitLoss: actualNet,
        rawStatus: Number(bet.status ?? 0),
        expectedProfit,
        expectedLoss,
        actualNet,
        actualProfit: Math.max(actualNet, 0),
        actualLoss: Math.max(-actualNet, 0),
        placed: new Date(bet.createdAt).toLocaleString(),
        taken: new Date(bet.createdAt).toLocaleString(),
        profit: bet.resultAmount || 0,
        status: getStatusFromVoid(bet.void, bet.settled),
        date: new Date(bet.date || bet.createdAt).toISOString().split('T')[0],
      };
    });
  }, [betHistory]);

  // Filter rows (sports + casino, and market types) with a live count of how
  // many of the fetched bets fall into each one.
  const filterGroups = useMemo(() => {
    const countBy = (key, value) =>
      mappedBetData.filter((bet) => bet[key] === value).length;

    return [
      {
        id: 'sports',
        label: 'Sports & Casino',
        options: buildSportOptions(betHistory).map((option) => ({
          ...option,
          count: countBy('sportKey', option.key),
        })),
      },
      {
        id: 'markets',
        label: 'Markets',
        options: MARKET_OPTIONS.map((option) => ({
          ...option,
          count: countBy('marketKey', option.key),
        })),
      },
    ];
  }, [mappedBetData, betHistory]);

  // A bet must match the selected sports AND the selected markets; an empty
  // selection for a group means that group is not filtering anything.
  const filteredBets = useMemo(() => {
    const { sports = [], markets = [] } = betTypeFilter;
    if (sports.length === 0 && markets.length === 0) return mappedBetData;

    return mappedBetData.filter((bet) => {
      const sportOk = sports.length === 0 || sports.includes(bet.sportKey);
      const marketOk = markets.length === 0 || markets.includes(bet.marketKey);
      return sportOk && marketOk;
    });
  }, [mappedBetData, betTypeFilter]);

  return (
    <div>
      <HeaderLogin />
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div
        onClick={() => window.history.back()}
        >
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">My Bets</span>
      </div>

      <BetTypeFilter
        groups={filterGroups}
        selected={betTypeFilter}
        onApply={setBetTypeFilter}
        totalCount={mappedBetData.length}
      />

      <div className='bg-[#262c32] px-4 pt-4'>
        {/* Bet Status Dropdown */}
        <div className='flex items-center justify-between relative'>
          <select
            name="Bet Status"
            className='bg-[#1b1f23] text-white pl-20 py-2 rounded-lg w-full'
            value={selectedVoid}
            onChange={(e) => {
              setPage(1);
              setSelectedVoid(e.target.value);
            }}
          >
            <option value="unsettle">Unsettled</option>
            <option value="settel">Settled</option>
            <option value="void">Void</option>
          </select>
          <span className='absolute left-0 text-white pl-2'>Bet Status</span>
        </div>
      </div>

      {/* Date range */}
      <DateRangeFilter
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={(range) => {
          setPage(1);
          setDateRange(range);
        }}
      />

      {/* Bets List */}
      <div className='bg-[#f1f7ff] min-h-[70vh]'>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-semibold text-gray-600">Loading bet history...</div>
          </div>
        ) : errorMessage ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg font-semibold text-red-600">Error: {errorMessage}</div>
          </div>
        ) : (
          <BetCard data={filteredBets} />
        )}
      </div>
    </div>
  )
}

export default BetHistory
