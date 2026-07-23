// Helpers for classifying a bet into a sport (Cricket / Soccer / Tennis / Casino)
// and a market (Match Odds / Bookmaker / Fancy / Sportsbook), used by the
// "Bet Type" filter on Current Bets / My Bets.

const FANCY_GAME_TYPES = [
  'normal',
  'ball',
  'khado',
  'meter',
  'line',
  'oddeven',
  'fancy',
  'fancy1',
];

// Sports we always want to show in the filter, even when there is no bet on
// them yet (the row just shows a count of 0).
export const BASE_SPORTS = [
  { key: 'cricket', label: 'Cricket' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'tennis', label: 'Tennis' },
  { key: 'casino', label: 'Casino' },
];

export const MARKET_OPTIONS = [
  { key: 'matchodds', label: 'Match Odds' },
  { key: 'bookmaker', label: 'Bookmaker' },
  { key: 'fancy', label: 'Fancy' },
  { key: 'sportsbook', label: 'Sportsbook' },
  { key: 'other', label: 'Other Markets' },
];

const isCasinoBet = (bet) => {
  const gameName = String(bet?.gameName || '').toLowerCase();
  const gameType = String(bet?.gameType || '').toLowerCase();
  const betType = String(bet?.betType || '').toLowerCase();
  return (
    gameName.includes('casino') ||
    gameType.includes('casino') ||
    betType.includes('casino')
  );
};

// "Cricket Game" -> { key: "cricket", label: "Cricket" }
export const getBetSport = (bet) => {
  if (isCasinoBet(bet)) return { key: 'casino', label: 'Casino' };

  const label =
    String(bet?.gameName || '')
      .replace(/\s*game\s*$/i, '')
      .trim() || 'Other';

  return { key: label.toLowerCase(), label };
};

export const getBetMarket = (bet) => {
  if (isCasinoBet(bet)) return 'casino';

  const gameType = String(bet?.gameType || '').toLowerCase();
  const marketName = String(bet?.marketName || '').toLowerCase();
  const betType = String(bet?.betType || '').toLowerCase();

  // Sportsbook markets come through as MATCH_ODDS_SB, so this has to be
  // checked before the plain "match odds" test below.
  if (/_sb$/.test(gameType) || betType.includes('sportsbook')) {
    return 'sportsbook';
  }
  if (gameType.includes('bookmaker') || marketName.includes('bookmaker')) {
    return 'bookmaker';
  }
  if (
    FANCY_GAME_TYPES.includes(gameType) ||
    betType.includes('fancy') ||
    marketName.includes('fancy')
  ) {
    return 'fancy';
  }
  if (gameType.includes('match odds') || marketName.includes('match odds')) {
    return 'matchodds';
  }
  return 'other';
};

// Builds the sport rows for the filter: the always-visible sports first, then
// anything else that actually shows up in the fetched bets.
export const buildSportOptions = (bets = []) => {
  const options = [...BASE_SPORTS];

  bets.forEach((bet) => {
    const sport = getBetSport(bet);
    if (!sport.key) return;
    if (!options.some((option) => option.key === sport.key)) {
      options.push(sport);
    }
  });

  return options;
};
