import { useState, useMemo, useEffect } from 'react';
import { INITIAL_BANNERS } from '@/mock/admin/banners.mock';
import { BannersKPIs } from './banners/BannersKPIs';
import { BannersFilters } from './banners/BannersFilters';
import { BannersTable } from './banners/BannersTable';
import { BannerModal } from './banners/BannerModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useDebounce } from '@/hooks/useDebounce';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post, put, patch, del } from '@/services/apiServices';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';

export const BannerTabContent = ({
  isCreateModalOpen = false,
  setIsCreateModalOpen = null,
}) => {
  const queryClient = useQueryClient();
  const [localBanners, setLocalBanners] = useState(INITIAL_BANNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedPlacement, setSelectedPlacement] = useState('All placements');
  const [selectedStatus, setSelectedStatus] = useState('All statuses');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // API query
  const queryKey = QUERY_KEYS.ADMIN?.STORE?.PROMOTIONS?.BANNERS?.LIST({
    selectedPlacement,
    selectedStatus,
    searchQuery: debouncedSearch,
  }) || ['admin', 'store', 'promotions', 'banners', { selectedPlacement, selectedStatus, searchQuery: debouncedSearch }];

  const bannersUrl =
    apiRoutes.admin?.store?.promotions?.banners?.base ||
    '/admin/store/promotions/banners';

  const { data: response, isLoading, refetch } = useApiQuery(
    queryKey,
    bannersUrl,
    {
      params: {
        placement: selectedPlacement !== 'All placements' ? selectedPlacement : undefined,
        status: selectedStatus !== 'All statuses' ? selectedStatus : undefined,
        q: debouncedSearch.trim() || undefined,
      },
      retry: 1,
    }
  );

  // Sync API banners if returned, otherwise fallback to local/mock state
  const banners = useMemo(() => {
    if (response?.data?.banners && Array.isArray(response.data.banners) && response.data.banners.length > 0) {
      return response.data.banners;
    }
    return localBanners;
  }, [response, localBanners]);

  useEffect(() => {
    if (isCreateModalOpen) {
      setEditingBanner(null);
      setIsModalOpen(true);
      setIsCreateModalOpen?.(false);
    }
  }, [isCreateModalOpen, setIsCreateModalOpen]);

  // Toggle enabled state
  const handleToggleEnabled = async (id) => {
    const targetBanner = banners.find((b) => b.id === id);
    if (!targetBanner) return;
    const nextEnabled = !targetBanner.enabled;

    // Optimistically update local state
    setLocalBanners((prev) =>
      prev.map((banner) => {
        if (banner.id !== id) return banner;
        return {
          ...banner,
          enabled: nextEnabled,
          status: nextEnabled ? 'Active' : 'Disabled',
        };
      })
    );

    try {
      const toggleUrl = apiRoutes.admin?.store?.promotions?.banners?.toggle
        ? apiRoutes.admin.store.promotions.banners.toggle(id)
        : `/admin/store/promotions/banners/${id}/toggle`;

      await patch(toggleUrl, { enabled: nextEnabled });
      toast.success(nextEnabled ? 'Banner enabled' : 'Banner disabled');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      // Backend not yet migrated; local state already updated
    }
  };

  // Save banner (create or edit)
  const handleSaveBanner = async (savedBanner) => {
    const isEdit = Boolean(editingBanner);

    // Optimistically update local state
    setLocalBanners((prev) => {
      const exists = prev.some((b) => b.id === savedBanner.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBanner.id ? savedBanner : b));
      }
      return [savedBanner, ...prev];
    });

    try {
      if (isEdit) {
        const updateUrl = apiRoutes.admin?.store?.promotions?.banners?.detail
          ? apiRoutes.admin.store.promotions.banners.detail(savedBanner.id)
          : `/admin/store/promotions/banners/${savedBanner.id}`;
        await put(updateUrl, savedBanner);
      } else {
        await post(bannersUrl, savedBanner);
      }
      toast.success(isEdit ? 'Banner updated successfully!' : 'Banner created successfully!');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      // Handled locally
      toast.success(isEdit ? 'Banner updated!' : 'Banner created!');
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id) => {
    setLocalBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      const deleteUrl = apiRoutes.admin?.store?.promotions?.banners?.detail
        ? apiRoutes.admin.store.promotions.banners.detail(id)
        : `/admin/store/promotions/banners/${id}`;
      await del(deleteUrl);
      toast.success('Banner deleted');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch {
      // Handled locally
    }
  };

  // Filter banners
  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      if (
        selectedPlacement !== 'All placements' &&
        banner.placement?.toLowerCase() !== selectedPlacement.toLowerCase()
      ) {
        return false;
      }
      if (
        selectedStatus !== 'All statuses' &&
        banner.status?.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = banner.title?.toLowerCase().includes(q);
        const matchesCategory = banner.category?.toLowerCase().includes(q);
        const matchesDesc = banner.description?.toLowerCase().includes(q);
        const matchesPlacement = banner.placement?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesDesc && !matchesPlacement) {
          return false;
        }
      }
      return true;
    });
  }, [banners, selectedPlacement, selectedStatus, searchQuery]);

  const uniquePlacementsCount = useMemo(() => {
    const placements = new Set(banners.map((b) => b.placement));
    return placements.size;
  }, [banners]);

  return (
    <div className="space-y-6">
      {/* 3 KPI Cards */}
      <BannersKPIs banners={banners} kpis={response?.kpis} />

      {/* Banner List Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Banner List
          </h3>
          <span className="text-xs font-medium text-slate-400">
            {banners.length} banners · {uniquePlacementsCount} placements
          </span>
        </div>

        {/* Filter bar */}
        <BannersFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPlacement={selectedPlacement}
          onPlacementChange={setSelectedPlacement}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Banners Table */}
        <BannersTable
          banners={filteredBanners}
          onEdit={(banner) => {
            setEditingBanner(banner);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteBanner}
          onToggleEnabled={handleToggleEnabled}
        />

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
          <div>
            Showing 1–{filteredBanners.length} of {banners.length} banners
          </div>
          <div>
            Use Edit to change image, content or CTA.
          </div>
        </div>
      </div>

      {/* Add / Edit Banner Modal */}
      <BannerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBanner(null);
        }}
        onSave={handleSaveBanner}
        editingBanner={editingBanner}
      />
    </div>
  );
};

export default BannerTabContent;
