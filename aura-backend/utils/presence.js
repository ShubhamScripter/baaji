import SubAdmin from '../models/subAdminModel.js';

// A user counts as "online" if they hit an authenticated endpoint within this
// window. authMiddleware refreshes lastActive at most once per half-window, so
// this must stay comfortably larger than that refresh interval.
export const PRESENCE_WINDOW_MS = 5 * 60 * 1000;

export const getPresenceCutoff = () =>
  new Date(Date.now() - PRESENCE_WINDOW_MS);

/**
 * Collect the `code` of every account beneath `rootCode` in the invite tree.
 * Hierarchy is expressed as child.invite === parent.code.
 *
 * The returned set includes rootCode itself, so it can be used directly as an
 * `invite: { $in: [...] }` filter to match every descendant account.
 */
export const getDownlineCodes = async (rootCode) => {
  const collected = new Set([rootCode]);
  let frontier = [rootCode];

  // Breadth-first by level: one query per depth rather than one per account.
  while (frontier.length > 0) {
    const children = await SubAdmin.find({ invite: { $in: frontier } })
      .select('code')
      .lean();

    const next = [];
    for (const child of children) {
      // Guard against a malformed invite cycle looping forever.
      if (!child.code || collected.has(child.code)) continue;
      collected.add(child.code);
      next.push(child.code);
    }

    frontier = next;
  }

  return [...collected];
};
