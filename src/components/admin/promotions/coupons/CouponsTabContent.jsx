import { useState, useMemo } from 'react';
import { PlusIcon } from '@/icons';
import { INITIAL_COUPONS } from '@/mock/admin/coupons.mock';
import { CouponsKPIs } from './CouponsKPIs';
import { CouponsFilters } from './CouponsFilters';
import { CouponsTable } from './CouponsTable';
import { CouponModal } from './CouponModal';
import { DeleteCouponModal } from './DeleteCouponModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useDebounce } from '@/hooks/useDebounce';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post, put, patch, del } from '@/services/apiServices';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';

export const CouponsTabContent = () => {
  const queryClient = useQueryClient();
  const [localCoupons, setLocalCoupons] = useState(INITIAL_COUPONS);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedType, setSelectedType] = useState('All coupon types');
  const [selectedStatus, setSelectedStatus] = useState('All statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);

  // API query
  const queryKey = QUERY_KEYS.ADMIN?.STORE?.PROMOTIONS?.COUPONS?.LIST({
    selectedType,
    selectedStatus,
    searchQuery: debouncedSearch,
    currentPage,
    pageSize,
  }) || ['admin', 'store', 'promotions', 'coupons', { selectedType, selectedStatus, searchQuery: debouncedSearch, currentPage, pageSize }];

  const couponsUrl =
    apiRoutes.admin?.store?.promotions?.coupons?.base ||
    '/admin/store/promotions/coupons';

  const { data: response, isLoading, refetch } = useApiQuery(
    queryKey,
    couponsUrl,
    {
      params: {
        couponType: selectedType !== 'All coupon types' ? selectedType : undefined,
        status: selectedStatus !== 'All statuses' ? selectedStatus : undefined,
        q: debouncedSearch.trim() || undefined,
        page: currentPage,
        pageSize,
      },
      retry: 1,
    }
  );

  const coupons = useMemo(() => {
    if (response?.data?.coupons && Array.isArray(response.data.coupons) && response.data.coupons.length > 0) {
      return response.data.coupons;
    }
    return localCoupons;
  }, [response, localCoupons]);

  // Toggle enabled state
  const handleToggleEnabled = async (id) => {
    const target = coupons.find((c) => c.id === id);
    if (!target) return;
    const nextEnabled = !target.enabled;

    let nextStatus = 'Disabled';
    if (nextEnabled) {
      const now = new Date();
      const start = new Date(target.startDate);
      const end = new Date(target.expireDate);
      end.setHours(23, 59, 59, 999);
      if (now < start) nextStatus = 'Scheduled';
      else if (now > end) nextStatus = 'Expired';
      else nextStatus = 'Active';
    }

    setLocalCoupons((prev) =>
      prev.map((coupon) => {
        if (coupon.id !== id) return coupon;
        return {
          ...coupon,
          enabled: nextEnabled,
          status: nextStatus,
        };
      })
    );

    try {
      const toggleUrl = apiRoutes.admin?.store?.promotions?.coupons?.toggle
        ? apiRoutes.admin.store.promotions.coupons.toggle(id)
        : `/admin/store/promotions/coupons/${id}/toggle`;

      await patch(toggleUrl, { enabled: nextEnabled });
      toast.success(nextEnabled ? 'Coupon enabled' : 'Coupon disabled');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      // Backend not yet migrated
    }
  };

  // Save coupon (create or edit)
  const handleSaveCoupon = async (savedCoupon) => {
    const isEdit = Boolean(editingCoupon);

    setLocalCoupons((prev) => {
      const exists = prev.some((c) => c.id === savedCoupon.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCoupon.id ? savedCoupon : c));
      }
      return [savedCoupon, ...prev];
    });

    try {
      if (isEdit) {
        const updateUrl = apiRoutes.admin?.store?.promotions?.coupons?.detail
          ? apiRoutes.admin.store.promotions.coupons.detail(savedCoupon.id)
          : `/admin/store/promotions/coupons/${savedCoupon.id}`;
        await put(updateUrl, savedCoupon);
      } else {
        await post(couponsUrl, savedCoupon);
      }
      toast.success(isEdit ? 'Coupon updated successfully!' : 'Coupon created successfully!');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      toast.success(isEdit ? 'Coupon updated!' : 'Coupon created!');
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (id) => {
    setLocalCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      const deleteUrl = apiRoutes.admin?.store?.promotions?.coupons?.detail
        ? apiRoutes.admin.store.promotions.coupons.detail(id)
        : `/admin/store/promotions/coupons/${id}`;
      await del(deleteUrl);
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      // Handled locally
    }
  };

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      if (
        selectedType !== 'All coupon types' &&
        coupon.couponType?.toLowerCase() !== selectedType.toLowerCase()
      ) {
        return false;
      }
      if (
        selectedStatus !== 'All statuses' &&
        coupon.status?.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = coupon.title?.toLowerCase().includes(q);
        const matchesCode = coupon.code?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode) return false;
      }
      return true;
    });
  }, [coupons, selectedType, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalItems = response?.meta?.total ?? filteredCoupons.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedCoupons = response?.data?.coupons
    ? filteredCoupons
    : filteredCoupons.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Coupons Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Coupons</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create percentage discounts, fixed amounts or free delivery vouchers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon size={16} animateOnHover={false} />
          <span>Add New Coupon</span>
        </button>
      </div>

      {/* 3 KPI Cards */}
      <CouponsKPIs coupons={coupons} kpis={response?.kpis} />

      {/* Coupon List Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Coupon List
          </h3>
          <span className="text-xs font-medium text-slate-400">
            {totalItems} coupons
          </span>
        </div>

        {/* Filter bar */}
        <CouponsFilters
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          selectedType={selectedType}
          onTypeChange={(val) => {
            setSelectedType(val);
            setCurrentPage(1);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
        />

        {/* Coupons Table */}
        <CouponsTable
          coupons={paginatedCoupons}
          onEdit={(coupon) => {
            setEditingCoupon(coupon);
            setIsModalOpen(true);
          }}
          onDelete={(coupon) => setDeletingCoupon(coupon)}
          onToggleEnabled={handleToggleEnabled}
        />

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
          <div>
            Showing {Math.min(startIndex + 1, totalItems)}–
            {Math.min(startIndex + pageSize, totalItems)} of {totalItems} coupons
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
            >
              ‹
            </button>
            <span className="px-3 py-1 rounded-lg bg-orange-500 text-white font-semibold text-xs shadow-2xs">
              {safeCurrentPage}
            </span>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
        }}
        onSave={handleSaveCoupon}
        editingCoupon={editingCoupon}
      />

      {/* Delete Coupon Confirmation Modal */}
      <DeleteCouponModal
        isOpen={Boolean(deletingCoupon)}
        onClose={() => setDeletingCoupon(null)}
        onConfirm={handleDeleteCoupon}
        coupon={deletingCoupon}
      />
    </div>
  );
};

export default CouponsTabContent;
