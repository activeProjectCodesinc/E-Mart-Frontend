import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import {
  getPayouts,
  getPayoutStats,
  approvePayoutMock,
  rejectPayoutMock,
} from '@/mock/admin/payouts.mock';
import PayoutStatCards from '@/components/admin/payouts/PayoutStatCards';
import PayoutStatusFilterTabs from '@/components/admin/payouts/PayoutStatusFilterTabs';
import PayoutTable from '@/components/admin/payouts/PayoutTable';
import ApprovePayoutModal from '@/components/admin/payouts/ApprovePayoutModal';
import RejectPayoutModal from '@/components/admin/payouts/RejectPayoutModal';
import { HistoryIcon, ShieldAlertIcon } from '@/icons';
import { toast } from '@/utils/toast';
import { useDebounce } from '@/hooks';

export const AdminPayoutsPage = () => {
  const navigate = useNavigate();
  const [payoutsList, setPayoutsList] = useState(() => getPayouts());
  const [statusTab, setStatusTab] = useState('All');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [vendorFilter, setVendorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [payoutToApprove, setPayoutToApprove] = useState(null);
  const [payoutToReject, setPayoutToReject] = useState(null);

  const stats = useMemo(() => getPayoutStats(), [payoutsList]);

  const vendors = useMemo(() => {
    return Array.from(new Set(payoutsList.map((p) => p.vendor)));
  }, [payoutsList]);

  const filteredPayouts = useMemo(() => {
    return payoutsList.filter((p) => {
      if (statusTab !== 'All' && p.status !== statusTab) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (vendorFilter !== 'All' && p.vendor !== vendorFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        return p.vendor.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [payoutsList, statusTab, statusFilter, vendorFilter, debouncedSearch]);

  const handleConfirmApprove = (id) => {
    const updated = approvePayoutMock(id);
    setPayoutsList((prev) => prev.map((p) => (p.id === id ? { ...updated } : p)));
    setPayoutToApprove(null);
    toast.success(`Payout ${id} approved and sent for processing.`);
  };

  const handleConfirmReject = (id, reasonData) => {
    const updated = rejectPayoutMock(id, reasonData);
    setPayoutsList((prev) => prev.map((p) => (p.id === id ? { ...updated } : p)));
    setPayoutToReject(null);
    toast.error(`Payout ${id} rejected.`);
  };

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Commission & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review vendor payout requests, monitor earnings and track completed transfers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStatusTab('Completed')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <HistoryIcon animateOnHover={false} size={15} className="text-slate-500" />
          <span>Payout History</span>
        </button>
      </div>

      {/* 5 KPI Stat Cards */}
      <PayoutStatCards stats={stats} />

      {/* Status Filter Pill Tabs */}
      <PayoutStatusFilterTabs
        activeTab={statusTab}
        onTabChange={setStatusTab}
        stats={stats}
      />

      {/* Table Container */}
      <PayoutTable
        payouts={filteredPayouts}
        onApprove={setPayoutToApprove}
        onReject={setPayoutToReject}
        onViewDetails={(p) => navigate(`/admin/payouts/${p.id}`)}
        search={search}
        onSearchChange={setSearch}
        vendorFilter={vendorFilter}
        onVendorChange={setVendorFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        vendors={vendors}
        pendingCount={stats.pendingCount}
        pendingAmount={stats.pendingAmount}
      />

      {/* Bottom Info Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlertIcon animateOnHover={false} size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900">Approve first, pay after bank confirmation</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Approval starts a transfer; it does not mark earnings as paid. The three recent completed payouts total PKR 65,200. Commission and fees above cover all six vendors for September.
          </p>
        </div>
      </div>

      {/* Modals */}
      <ApprovePayoutModal
        isOpen={Boolean(payoutToApprove)}
        onClose={() => setPayoutToApprove(null)}
        onConfirm={handleConfirmApprove}
        payout={payoutToApprove}
      />

      <RejectPayoutModal
        isOpen={Boolean(payoutToReject)}
        onClose={() => setPayoutToReject(null)}
        onConfirm={handleConfirmReject}
        payout={payoutToReject}
      />
    </motion.div>
  );
};

export default AdminPayoutsPage;
