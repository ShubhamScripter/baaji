import betModel from '../../models/betModel.js';
import SubAdmin from '../../models/subAdminModel.js';

const parseLimit = (raw, fallback = 20, max = 100) => {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) return fallback;
  return Math.min(n, max);
};


const FANCY_GAME_TYPES = ['Normal', 'meter', 'line', 'ball', 'khado'];


const MATCH_LEVEL_GAME_TYPES = ['Match Odds', 'Bookmaker', 'Toss', 'Tied Match'];

const buildSportFilter = (sportRaw) => {
  if (!sportRaw) return null;
  const sport = String(sportRaw).trim();
  if (!sport) return null;
  return new RegExp(`^${sport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
};


export const getTopMatchedAmountPlayers = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);

    const data = await betModel.aggregate([
      { $match: { status: 0 } },
      {
        $group: {
          _id: '$userId',
          matchedAmount: { $sum: '$betAmount' },
          openBetCount: { $sum: 1 },
        },
      },
      { $match: { matchedAmount: { $gt: 0 } } },
      { $sort: { matchedAmount: -1 } },
      { $limit: limit },
      {
        $addFields: {
          userObjectId: {
            $convert: {
              input: '$_id',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'subadmins',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $match: { 'user.role': 'user' } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          uid: '$user.userName',
          name: '$user.name',
          exposure: '$user.exposure',
          matchedAmount: 1,
          openBetCount: 1,
          parentInvite: '$user.invite',
          createdAt: '$user.createdAt',
        },
      },
    ]);

    const ranked = data.map((row, i) => ({ id: i + 1, ...row }));

    return res.status(200).json({ success: true, data: ranked });
  } catch (err) {
    console.error('[RISK] getTopMatchedAmountPlayers error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getTopExposurePlayers = async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);

    const data = await SubAdmin.aggregate([
      { $match: { role: 'user', exposure: { $gt: 0 } } },
      { $sort: { exposure: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'bets',
          let: { uid: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$uid'] }, status: 0 } },
            {
              $group: {
                _id: null,
                matchedAmount: { $sum: '$betAmount' },
                openBetCount: { $sum: 1 },
              },
            },
          ],
          as: 'liveBets',
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          uid: '$userName',
          name: 1,
          exposure: 1,
          matchedAmount: {
            $ifNull: [{ $arrayElemAt: ['$liveBets.matchedAmount', 0] }, 0],
          },
          openBetCount: {
            $ifNull: [{ $arrayElemAt: ['$liveBets.openBetCount', 0] }, 0],
          },
          parentInvite: '$invite',
          createdAt: 1,
        },
      },
    ]);

    const ranked = data.map((row, i) => ({ id: i + 1, ...row }));

    return res.status(200).json({ success: true, data: ranked });
  } catch (err) {
    console.error('[RISK] getTopExposurePlayers error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};


export const getMatchOddsSummary = async (req, res) => {
  try {
    const { gameId, gameType } = req.query;
    const sportFilter = buildSportFilter(req.query.sport);
    const limit = parseLimit(req.query.limit, 200, 500);

    let gameTypeFilter = { $in: MATCH_LEVEL_GAME_TYPES };
    if (gameType) {
      const requested = String(gameType).trim();
      if (MATCH_LEVEL_GAME_TYPES.includes(requested)) {
        gameTypeFilter = requested;
      }
    }

    const match = { status: 0, gameType: gameTypeFilter };
    if (gameId) match.gameId = String(gameId);
    if (sportFilter) match.gameName = sportFilter;

    const data = await betModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            gameId: '$gameId',
            eventName: '$eventName',
            gameType: '$gameType',
            teamName: '$teamName',
          },
          sport: { $first: '$gameName' },
          marketName: { $first: '$marketName' },
          totalBetAmount: { $sum: '$betAmount' },
          openBetCount: { $sum: 1 },
          firstBetDate: { $min: '$date' },
        },
      },
      {
        $group: {
          _id: {
            gameId: '$_id.gameId',
            eventName: '$_id.eventName',
            gameType: '$_id.gameType',
          },
          sport: { $first: '$sport' },
          marketName: { $first: '$marketName' },
          date: { $min: '$firstBetDate' },
          totalMatched: { $sum: '$totalBetAmount' },
          openBetCount: { $sum: '$openBetCount' },
          outcomes: {
            $push: {
              teamName: '$_id.teamName',
              totalBetAmount: '$totalBetAmount',
              openBetCount: '$openBetCount',
            },
          },
        },
      },
      { $sort: { date: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          gameId: '$_id.gameId',
          eventName: '$_id.eventName',
          gameType: '$_id.gameType',
          marketName: 1,
          sport: 1,
          date: 1,
          totalMatched: 1,
          openBetCount: 1,
          outcomes: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[RISK] getMatchOddsSummary error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};


export const getFancySummary = async (req, res) => {
  try {
    const { gameId } = req.query;
    const sportFilter = buildSportFilter(req.query.sport);
    const limit = parseLimit(req.query.limit, 500, 1000);

    const match = { status: 0, gameType: { $in: FANCY_GAME_TYPES } };
    if (gameId) match.gameId = String(gameId);
    if (sportFilter) match.gameName = sportFilter;

    const data = await betModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            gameId: '$gameId',
            eventName: '$eventName',
            marketName: '$marketName',
          },
          sport: { $first: '$gameName' },
          gameType: { $first: '$gameType' },
          date: { $min: '$date' },
          minBetAmount: { $min: '$betAmount' },
          maxBetAmount: { $max: '$betAmount' },
          totalMatched: { $sum: '$betAmount' },
          openBetCount: { $sum: 1 },
        },
      },
      { $sort: { date: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          gameId: '$_id.gameId',
          eventName: '$_id.eventName',
          marketName: '$_id.marketName',
          sport: 1,
          gameType: 1,
          date: 1,
          minBetAmount: 1,
          maxBetAmount: 1,
          totalMatched: 1,
          openBetCount: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[RISK] getFancySummary error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};
