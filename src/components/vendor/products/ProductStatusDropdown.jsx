import { ChevronDownIcon } from '@/icons';

const STATUS_CONFIGS = {
  Active: {
    badge: 'bg-[#e7f8ee] text-[#16a34a] border-[#bbf7d0] hover:bg-[#dcf3e5]',
    dot: 'bg-[#16a34a]',
  },
  'Out of Stock': {
    badge: 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca] hover:bg-[#fee2e2]',
    dot: 'bg-[#ef4444]',
  },
  'Low Stock': {
    badge: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a] hover:bg-[#fef3c7]',
    dot: 'bg-[#d97706]',
  },
  Inactive: {
    badge: 'bg-[#ecfdf5] text-[#10b981] border-[#a7f3d0] hover:bg-[#d1fae5]',
    dot: 'bg-[#10b981]',
  },
  Draft: {
    badge: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
    dot: 'bg-amber-600',
  },
};

export const ProductStatusDropdown = ({ status, onClick }) => {
  const raw =
    typeof status === 'object' && status !== null
      ? (status.name || status.title || 'Active')
      : (status || 'Active');

  const normalized =
    String(raw).charAt(0).toUpperCase() + String(raw).slice(1).replace(/_/g, ' ');

  const config =
    STATUS_CONFIGS[normalized] ||
    STATUS_CONFIGS[
      Object.keys(STATUS_CONFIGS).find(
        (k) => k.toLowerCase() === normalized.toLowerCase()
      )
    ] ||
    STATUS_CONFIGS.Active;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 ${config.badge}`}
      title="Click to update status"
    >
      <span>{normalized}</span>
      <ChevronDownIcon size={12} className="stroke-[2.5] opacity-75" />
    </button>
  );
};

export default ProductStatusDropdown;
