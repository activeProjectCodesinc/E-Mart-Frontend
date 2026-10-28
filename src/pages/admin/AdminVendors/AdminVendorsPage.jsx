import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { PlusIcon } from '@/icons';
import { fadeIn } from '@/animation/animations';
import { useDebounce } from '@/hooks';
import VendorStatCards from '@/components/admin/vendors/VendorStatCards';
import VendorFilterBar from '@/components/admin/vendors/VendorFilterBar';
import VendorTable from '@/components/admin/vendors/VendorTable';

export const AdminVendorsPage = () => {
  const vendors = useSelector((state) => state.adminVendors.vendors);
  const filters = useSelector((state) => state.adminVendors.filters);
  const debouncedSearch = useDebounce(filters.search, 300);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = v.storeName?.toLowerCase().includes(query);
        const matchesOwner = v.ownerName?.toLowerCase().includes(query);
        const matchesEmail = v.email?.toLowerCase().includes(query);
        const matchesCode = v.code?.toLowerCase().includes(query);
        if (!matchesName && !matchesOwner && !matchesEmail && !matchesCode) {
          return false;
        }
      }

      if (filters.status && filters.status !== 'All Status') {
        if (v.status !== filters.status) return false;
      }

      if (filters.category && filters.category !== 'All Categories') {
        if (v.category !== filters.category) return false;
      }

      if (filters.location && filters.location !== 'All Locations') {
        if (v.location !== filters.location) return false;
      }

      return true;
    });
  }, [vendors, filters.status, filters.category, filters.location, debouncedSearch]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Vendors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage all marketplace vendors, approve new requests and monitor their stores.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Add Vendor modal/flow')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <PlusIcon size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <VendorStatCards />

      {/* Filters Bar */}
      <VendorFilterBar />

      {/* Vendors Table */}
      <VendorTable vendors={filteredVendors} />
    </motion.div>
  );
};

export default AdminVendorsPage;
