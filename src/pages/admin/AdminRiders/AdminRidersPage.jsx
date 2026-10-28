import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import { useDebounce } from '@/hooks';
import {
  getRiders,
  getRiderStats,
} from '@/mock/admin/riders.mock';
import RiderStatCards from '@/components/admin/riders/RiderStatCards';
import RiderFilterBar from '@/components/admin/riders/RiderFilterBar';
import RiderTable from '@/components/admin/riders/RiderTable';

export const AdminRidersPage = () => {
  const [riders] = useState(() => getRiders());
  const [stats] = useState(() => getRiderStats());
  const [filters, setFilters] = useState({
    search: '',
    status: 'All Status',
    zone: 'All Zones',
    vehicle: 'All Vehicles',
  });
  const debouncedSearch = useDebounce(filters.search, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSearchChange = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(query);
        const matchesFullName = r.fullName?.toLowerCase().includes(query);
        const matchesPhone = r.phone?.toLowerCase().includes(query);
        const matchesEmail = r.email?.toLowerCase().includes(query);
        const matchesCode = r.code?.toLowerCase().includes(query);
        const matchesRiderId = r.riderId?.toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesFullName &&
          !matchesPhone &&
          !matchesEmail &&
          !matchesCode &&
          !matchesRiderId
        ) {
          return false;
        }
      }

      if (filters.status && filters.status !== 'All Status') {
        if (r.status !== filters.status) return false;
      }

      if (filters.zone && filters.zone !== 'All Zones') {
        if (r.zone !== filters.zone) return false;
      }

      if (filters.vehicle && filters.vehicle !== 'All Vehicles') {
        if (r.vehicle !== filters.vehicle) return false;
      }

      return true;
    });
  }, [riders, filters.status, filters.zone, filters.vehicle, debouncedSearch]);

  // Paginated slice for current page
  const paginatedRiders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRiders.slice(startIndex, startIndex + pageSize);
  }, [filteredRiders, currentPage, pageSize]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Riders Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage delivery riders, approve new applications and monitor their activity.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <RiderStatCards stats={stats} />

      {/* Filters Bar */}
      <RiderFilterBar
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {/* Riders Table */}
      <RiderTable
        riders={paginatedRiders}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={filteredRiders.length}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
};

export default AdminRidersPage;
