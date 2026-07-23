// Shared money formatting for the report tables.
//
// Keeps three things consistent: values that cannot be parsed fall back to 0
// instead of throwing, "-0.00" is never rendered, and zero is neutral rather
// than being coloured as a profit.

export const toAmount = (value) => {
  if (value === null || value === undefined) return 0;

  const parsed = parseFloat(String(value).replace(/,/g, ''));
  if (!Number.isFinite(parsed)) return 0;

  // Rounds to 2dp first so -0.004 does not render as "-0.00".
  const rounded = Math.round(parsed * 100) / 100;
  return rounded === 0 ? 0 : rounded;
};

export const formatAmount = (value) => toAmount(value).toFixed(2);

export const getAmountClass = (value) => {
  const amount = toAmount(value);
  if (amount > 0) return 'text-green-600';
  if (amount < 0) return 'text-red-600';
  return 'text-[#243a48]';
};
