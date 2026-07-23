import CasinoBetHistory from '../models/casinoBetHistory.model.js';
import { getDateRangeUTC } from './dateUtils.js';

// Profit/loss helpers for third-party casino rounds (CasinoBetHistory).
//
// Net P/L of a round is always win_amount - bet_amount.
//
// `change` holds the delta of the LAST provider callback for that round:
// -bet_amount when the bet is placed, then overwritten with +win_amount when
// the round is won. Summing it therefore over-reports every winning round by
// its stake, so it must never be used as profit/loss.

export const getCasinoRoundNet = (round = {}) =>
  Number(round.win_amount || 0) - Number(round.bet_amount || 0);

// Aggregation-pipeline equivalent of getCasinoRoundNet().
export const CASINO_NET_PL_EXPR = {
  $subtract: [
    { $ifNull: ['$win_amount', 0] },
    { $ifNull: ['$bet_amount', 0] },
  ],
};

// Casino rounds live in their own collection, so every report that reads
// betHistoryModel has to map them into the same shape before merging.
export const mapCasinoRoundToBet = (round = {}) => {
  const betAmount = Number(round.bet_amount || 0);
  const winAmount = Number(round.win_amount || 0);
  const gameLabel =
    round.game_name || round.providerRaw?.game_name || round.game_uid || 'Casino';

  return {
    _id: round._id,
    betId: round.game_round,
    userId: round.userId,
    userName: round.userName,
    gameId: round.game_uid,
    roundId: round.game_round,
    market_id: round.game_round,
    gameName: 'Casino',
    gameType: 'casino',
    betType: 'casino',
    eventName: gameLabel,
    marketName: 'Casino',
    teamName: gameLabel,
    otype: 'back',
    price: betAmount,
    betAmount,
    // Payout multiplier for the round — the closest equivalent to odds.
    xValue: betAmount > 0 ? Number((winAmount / betAmount).toFixed(2)) : 0,
    resultAmount: winAmount,
    profitLossChange: getCasinoRoundNet(round),
    // Casino rounds are settled by the provider the moment they are recorded.
    status: 1,
    settled: 'settled',
    betResult: winAmount > 0 ? 'WIN' : 'LOSS',
    ip: round.providerRaw?.ip || '',
    date: round.createdAt,
    createdAt: round.createdAt,
    updatedAt: round.updatedAt,
  };
};

// Fetches casino rounds for the given users, mapped to betHistory shape and
// honouring the same filters the sports reports use. Returns [] when the
// report is filtered to a non-casino game.
export const fetchCasinoRoundsAsBets = async ({
  userIds = [],
  startDate,
  endDate,
  gameName,
  eventName,
  marketName,
  userName,
} = {}) => {
  if (!userIds.length) return [];
  if (gameName && !/casino/i.test(gameName)) return [];

  const query = { userId: { $in: userIds.map((value) => String(value)) } };

  if (startDate && endDate) {
    query.createdAt = getDateRangeUTC(startDate, endDate);
  }
  if (userName) {
    query.userName = String(userName).trim();
  }
  if (marketName) {
    // Reports pass back the round identifier shown in the market column.
    query.game_round = { $regex: `${String(marketName).trim()}$`, $options: 'i' };
  }

  const rounds = await CasinoBetHistory.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const mapped = rounds.map(mapCasinoRoundToBet);

  if (eventName) {
    const trimmedEventName = String(eventName).trim();
    return mapped.filter((bet) => bet.eventName === trimmedEventName);
  }

  return mapped;
};
