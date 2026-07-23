// Preset ranges for the date filter used on My Bets. `range()` returns
// [from, to] as Date objects; `custom` has no range and opens the picker.

export const formatDate = (date) => date.toISOString().split('T')[0];

export const DATE_PRESETS = [
  { key: 'today', label: 'Today', range: () => [new Date(), new Date()] },
  {
    key: '7days',
    label: 'Last 7 Days',
    range: () => {
      const from = new Date();
      from.setDate(from.getDate() - 6);
      return [from, new Date()];
    },
  },
  {
    key: '1month',
    label: 'Last 1 Month',
    range: () => {
      const from = new Date();
      from.setMonth(from.getMonth() - 1);
      return [from, new Date()];
    },
  },
  {
    key: '3months',
    label: 'Last 3 Months',
    range: () => {
      const from = new Date();
      from.setMonth(from.getMonth() - 3);
      return [from, new Date()];
    },
  },
  {
    key: '1year',
    label: 'Last 1 Year',
    range: () => {
      const from = new Date();
      from.setFullYear(from.getFullYear() - 1);
      return [from, new Date()];
    },
  },
  { key: 'custom', label: 'Custom Range', range: null },
];

// Resolves a preset key to { startDate, endDate } as YYYY-MM-DD strings.
export const getPresetRange = (key) => {
  const preset = DATE_PRESETS.find((item) => item.key === key);
  const [from, to] = preset?.range ? preset.range() : [new Date(), new Date()];
  return { startDate: formatDate(from), endDate: formatDate(to) };
};
