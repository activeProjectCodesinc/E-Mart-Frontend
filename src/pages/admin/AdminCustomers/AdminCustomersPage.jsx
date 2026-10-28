import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import { useDebounce } from '@/hooks';
import {
  getCustomers,
  getCustomerStats,
} from '@/mock/admin/customers.mock';
import CustomerStatCards from '@/components/admin/customers/CustomerStatCards';
import CustomerFilterBar from '@/components/admin/customers/CustomerFilterBar';
import CustomerTable from '@/components/admin/customers/CustomerTable';

export const AdminCustomersPage = () => {
  const [customers] = useState(() => getCustomers());
  const [stats] = useState(() => getCustomerStats());
  const [filters, setFilters] = useState({
    search: '',
    status: 'All Status',
    city: 'All Cities',
    joinDate: 'All Join Dates',
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

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesFullName = c.fullName?.toLowerCase().includes(query);
        const matchesPhone = c.phone?.toLowerCase().includes(query);
        const matchesEmail = c.email?.toLowerCase().includes(query);
        const matchesCode = c.code?.toLowerCase().includes(query);
        const matchesCustomerId = c.customerId?.toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesFullName &&
          !matchesPhone &&
          !matchesEmail &&
          !matchesCode &&
          !matchesCustomerId
        ) {
          return false;
        }
      }

      if (filters.status && filters.status !== 'All Status') {
        if (c.status !== filters.status) return false;
      }

      if (filters.city && filters.city !== 'All Cities') {
        if (!c.location?.includes(filters.city) && !c.fullLocation?.includes(filters.city)) {
          return false;
        }
      }

      return true;
    });
  }, [customers, filters.status, filters.city, debouncedSearch]);

  // Paginated slice for current page
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

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
          Customers Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          View and manage all customers. Check their orders, activity and account status.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <CustomerStatCards stats={stats} />

      {/* Filters Bar */}
      <CustomerFilterBar
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {/* Customers Table */}
      <CustomerTable
        customers={paginatedCustomers}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={filteredCustomers.length}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
};

export default AdminCustomersPage;
