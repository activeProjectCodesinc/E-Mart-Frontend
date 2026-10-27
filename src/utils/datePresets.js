export const DATE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'last_month', label: 'Last Month' },
];

export const getPresetDates = (presetId) => {
  const now = new Date();
  const format = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  switch (presetId) {
    case 'today': {
      const todayStr = format(now);
      return { from: todayStr, to: todayStr, label: 'Today' };
    }
    case 'last_7_days': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { from: format(d), to: format(now), label: 'Last 7 Days' };
    }
    case 'this_month': {
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      return { from, to: format(now), label: 'This Month' };
    }
    case 'last_30_days': {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { from: format(d), to: format(now), label: 'Last 30 Days' };
    }
    case 'last_month': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: format(first), to: format(last), label: 'Last Month' };
    }
    default:
      return { from: format(now), to: format(now), label: 'Custom' };
  }
};

export const formatDisplayDateRange = (from, to) => {
  if (!from || !to) return '';
  const f = new Date(from).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const t = new Date(to).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${f} - ${t}`;
};
