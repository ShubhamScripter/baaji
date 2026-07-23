import Series from '../models/seriesModel.js';

const normalize = (name) => (name || '').toString().trim();

/**
 * Record every series present in a provider match feed so the Sport Setting
 * page can list series that have no current matches.
 *
 * Best-effort: never throws, so a bookkeeping failure can't break a match feed.
 *
 * @param {string} sport  'cricket' | 'tennis' | 'soccer'
 * @param {Array}  matches  raw feed rows carrying cname / stime / gmid
 */
export const recordSeriesFromMatches = async (sport, matches) => {
  try {
    const seen = new Map();

    for (const match of matches || []) {
      const seriesName = normalize(match.cname);
      if (!seriesName) continue;

      const openDate = match.stime ? new Date(match.stime) : null;
      const validDate =
        openDate && !Number.isNaN(openDate.getTime()) ? openDate : null;

      const existing = seen.get(seriesName);
      if (!existing) {
        seen.set(seriesName, {
          openDate: validDate,
          marketId: match.gmid ?? match.beventId ?? null,
        });
      } else if (
        validDate &&
        (!existing.openDate || validDate < existing.openDate)
      ) {
        existing.openDate = validDate;
      }
    }

    if (seen.size === 0) return;

    const ops = [...seen.entries()].map(([seriesName, info]) => ({
      updateOne: {
        filter: { sport, seriesName },
        update: {
          // Keep the earliest start time ever seen for the series.
          ...(info.openDate ? { $min: { openDate: info.openDate } } : {}),
          $setOnInsert: {
            sport,
            seriesName,
            marketId: info.marketId != null ? String(info.marketId) : null,
            isBlocked: false,
          },
        },
        upsert: true,
      },
    }));

    await Series.bulkWrite(ops, { ordered: false });
  } catch (error) {
    console.error(`Failed to record ${sport} series:`, error.message);
  }
};

/**
 * Lowercased names of every blocked series for a sport, as a Set for O(1)
 * lookup while filtering a feed. Returns an empty Set on failure so a lookup
 * error leaves matches visible rather than hiding the whole feed.
 */
export const getBlockedSeriesNames = async (sport) => {
  try {
    const blocked = await Series.find({ sport, isBlocked: true })
      .select('seriesName')
      .lean();

    return new Set(blocked.map((s) => s.seriesName.toLowerCase()));
  } catch (error) {
    console.error(`Failed to load blocked ${sport} series:`, error.message);
    return new Set();
  }
};

export const isSeriesBlocked = (blockedNames, cname) =>
  blockedNames.has(normalize(cname).toLowerCase());
