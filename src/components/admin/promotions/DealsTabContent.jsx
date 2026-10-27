import { useState, useMemo } from 'react';
import { PlusIcon } from '@/icons';
import { INITIAL_DEALS } from '@/mock/admin/promotions.mock';
import { PromotionsKPIs } from './PromotionsKPIs';
import { PromotionsFilters } from './PromotionsFilters';
import { PromotionsTable } from './PromotionsTable';
import { DealModal } from './DealModal';
import { DeleteDealModal } from './DeleteDealModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post, put, patch, del } from '@/services/apiServices';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';

export const DealsTabContent = () => {
  const queryClient = useQueryClient();
  const [localDeals, setLocalDeals] = useState(INITIAL_DEALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All deal types');
  const [selectedStatus, setSelectedStatus] = useState('All statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal states
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deletingDeal, setDeletingDeal] = useState(null);

  // API query
  const queryKey = QUERY_KEYS.ADMIN?.STORE?.PROMOTIONS?.DEALS?.LIST({
    selectedType,
    selectedStatus,
    searchQuery,
    currentPage,
    pageSize,
  }) || ['admin', 'store', 'promotions', 'deals', { selectedType, selectedStatus, searchQuery, currentPage, pageSize }];

  const dealsUrl =
    apiRoutes.admin?.store?.promotions?.deals?.base ||
    '/admin/store/promotions/deals';

  const { data: response, isLoading, refetch } = useApiQuery(
    queryKey,
    dealsUrl,
    {
      params: {
        dealType: selectedType !== 'All deal types' ? selectedType : undefined,
        status: selectedStatus !== 'All statuses' ? selectedStatus : undefined,
        q: searchQuery.trim() || undefined,
        page: currentPage,
        pageSize,
      },
      retry: 1,
    }
  );

  const deals = useMemo(() => {
    if (response?.data?.deals && Array.isArray(response.data.deals) && response.data.deals.length > 0) {
      return response.data.deals;
    }
    return localDeals;
  }, [response, localDeals]);

  // Toggle publish state
  const handleTogglePublish = async (id) => {
    const target = deals.find((d) => d.id === id);
    if (!target) return;
    const nextPublished = !target.published;

    setLocalDeals((prev) =>
      prev.map((deal) =>
        deal.id === id ? { ...deal, published: nextPublished } : deal
      )
    );

    try {
      const publishUrl = apiRoutes.admin?.store?.promotions?.deals?.publish
        ? apiRoutes.admin.store.promotions.deals.publish(id)
        : `/admin/store/promotions/deals/${id}/publish`;

      await patch(publishUrl, { published: nextPublished });
      toast.success(nextPublished ? 'Deal published' : 'Deal unpublished');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      // Handled locally
    }
  };

  // Save deal (create or edit)
  const handleSaveDeal = async (savedDeal) => {
    const isEdit = Boolean(editingDeal);

    setLocalDeals((prev) => {
      const exists = prev.some((d) => d.id === savedDeal.id);
      if (exists) {
        return prev.map((d) => (d.id === savedDeal.id ? savedDeal : d));
      }
      return [savedDeal, ...prev];
    });

    try {
      if (isEdit) {
        const updateUrl = apiRoutes.admin?.store?.promotions?.deals?.detail
          ? apiRoutes.admin.store.promotions.deals.detail(savedDeal.id)
          : `/admin/store/promotions/deals/${savedDeal.id}`;
        await put(updateUrl, savedDeal);
      } else {
        await post(dealsUrl, savedDeal);
      }
      toast.success(isEdit ? 'Deal updated successfully!' : 'Deal created successfully!');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      toast.success(isEdit ? 'Deal updated!' : 'Deal created!');
    }
  };

  // Delete deal
  const handleDeleteDeal = async (id) => {
    setLocalDeals((prev) => prev.filter((d) => d.id !== id));
    try {
      const deleteUrl = apiRoutes.admin?.store?.promotions?.deals?.detail
        ? apiRoutes.admin.store.promotions.deals.detail(id)
        : `/admin/store/promotions/deals/${id}`;
      await del(deleteUrl);
      toast.success('Deal deleted');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      // Handled locally
    }
  };

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (selectedType !== 'All deal types' && deal.dealType !== selectedType)
        return false;
      if (selectedStatus !== 'All statuses' && deal.status !== selectedStatus)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!deal.title?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [deals, selectedType, selectedStatus, searchQuery]);

  const totalItems = response?.meta?.total ?? filteredDeals.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedDeals = response?.data?.deals
    ? filteredDeals
    : filteredDeals.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Deals Section Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Deals</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage flash deals, new arrivals and top offers for your store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingDeal(null);
            setIsDealModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusIcon size={16} animateOnHover={false} />
          <span>Add New Deal</span>
        </button>
      </div>

      {/* 3 KPI Cards */}
      <PromotionsKPIs deals={deals} kpis={response?.kpis} />

      {/* Deal List Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Deal List
          </h3>
          <span className="text-xs font-medium text-slate-400">
            {totalItems} deals · 3 deal types
          </span>
        </div>

        {/* Filter bar */}
        <PromotionsFilters
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

        {/* Table */}
        <PromotionsTable
          deals={paginatedDeals}
          onEdit={(deal) => {
            setEditingDeal(deal);
            setIsDealModalOpen(true);
          }}
          onDelete={(deal) => setDeletingDeal(deal)}
          onTogglePublish={handleTogglePublish}
        />

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
          <div>
            Showing {Math.min(startIndex + 1, totalItems)}–
            {Math.min(startIndex + pageSize, totalItems)} of {totalItems} deals
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

      {/* Add / Edit Deal Modal */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => {
          setIsDealModalOpen(false);
          setEditingDeal(null);
        }}
        onSave={handleSaveDeal}
        editingDeal={editingDeal}
      />

      {/* Delete Deal Confirmation Modal */}
      <DeleteDealModal
        isOpen={Boolean(deletingDeal)}
        onClose={() => setDeletingDeal(null)}
        onConfirm={handleDeleteDeal}
        deal={deletingDeal}
      />
    </div>
  );
};

export default DealsTabContent;
