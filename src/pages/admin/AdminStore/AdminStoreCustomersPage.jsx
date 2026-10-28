import { useState, useEffect } from 'react';
import {
  SearchIcon,
  UserIcon,
  DownloadIcon,
  RefreshCwIcon,
  EyeIcon,
  XIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  MailIcon,
  ReceiptTextIcon,
} from '@/icons';
import { useApiQuery } from '@/hooks/useApiQuery';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import baseURL from '@/services/apiBaseURL';
import { getAccessToken } from '@/services/tokenService';
import { toast } from '@/utils/toast';
import { StoreCustomerDetailModal } from './StoreCustomerDetailModal';

export const AdminStoreCustomersPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'new'
  const [page, setPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 12;

  // Debounce search by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Query key & endpoint
  const queryKey = QUERY_KEYS.ADMIN?.STORE?.CUSTOMERS?.LIST
    ? QUERY_KEYS.ADMIN.STORE.CUSTOMERS.LIST({ tab, q: debouncedSearch, page, pageSize })
    : ['store', 'customers', { tab, debouncedSearch, page, pageSize }];

  const customersUrl = apiRoutes.admin?.store?.customers?.base || '/admin/store/customers';

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useApiQuery(queryKey, customersUrl, {
    params: {
      tab,
      q: debouncedSearch || undefined,
      page,
      pageSize,
    },
    keepPreviousData: true,
  });

  const customers = response?.data?.customers || [];
  const meta = response?.meta || {
    total: 0,
    page: 1,
    pageSize,
    counts: { all: 0, new: 0 },
  };

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / pageSize));

  // Handle CSV export with bearer token
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const token = getAccessToken();
      const params = new URLSearchParams();
      if (tab) params.append('tab', tab);
      if (debouncedSearch) params.append('q', debouncedSearch);

      const exportEndpoint = apiRoutes.admin?.store?.customers?.export || '/admin/store/customers/export';
      const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
      const exportUrl = `${cleanBase}${exportEndpoint}?${params.toString()}`;

      const res = await fetch(exportUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Export request failed');
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `store_customers_${tab}_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success('Customers exported to CSV successfully!');
    } catch (err) {
      console.error('Failed to export customers CSV:', err);
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Store Customers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store customer records, mobile app buyers, and POS walk-in clients
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh list"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCwIcon size={15} className={isFetching ? 'animate-spin text-orange-500' : ''} />
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors shadow-2xs disabled:opacity-50"
          >
            <DownloadIcon size={14} className={isExporting ? 'animate-bounce text-orange-500' : ''} />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-2">
        {/* Tabs */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setTab('all');
              setPage(1);
            }}
            className={`pb-2 px-3 font-semibold transition-all border-b-2 flex items-center gap-2 ${
              tab === 'all'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All Customers</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === 'all'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {meta.counts?.all ?? meta.total ?? 0}
            </span>
          </button>

          <button
            onClick={() => {
              setTab('new');
              setPage(1);
            }}
            className={`pb-2 px-3 font-semibold transition-all border-b-2 flex items-center gap-2 ${
              tab === 'new'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>New This Month</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === 'new'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {meta.counts?.new ?? 0}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <SearchIcon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-2xs transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <XIcon size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Customers Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4"># ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4">Customer Since</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-400 font-medium text-xs">
                        Loading store customers...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-rose-600">
                        Failed to load store customers
                      </p>
                      <p className="text-xs text-slate-400">
                        Please check your network connection or verify authentication.
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-medium transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon size={20} />
                      </div>
                      <p className="font-semibold text-slate-700 text-xs">No store customers found</p>
                      <p className="text-[11px] text-slate-400">
                        {debouncedSearch
                          ? `No results matching "${debouncedSearch}". Try a different keyword.`
                          : 'New customers will appear here automatically when orders are placed.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer, idx) => {
                  const initials = (customer.name || 'C')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const shortId = `CUST-${(customer.id || String(idx + 1)).slice(0, 6).toUpperCase()}`;

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      {/* Short ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-400 group-hover:text-orange-600 transition-colors">
                        {shortId}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 block truncate group-hover:text-orange-600 transition-colors">
                              {customer.name || 'Walk-in Customer'}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {customer.email || 'No email provided'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {customer.phone || '—'}
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {customer.totalOrders ?? 0}
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        PKR {Number(customer.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Customer Since */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(customer.customerSince)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Active
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomerId(customer.id);
                            }}
                            title="View Details"
                            className="p-1 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                          >
                            <EyeIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500 font-medium">
              Showing page <span className="font-bold text-slate-800">{page}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span> (
              {meta.total || customers.length} total customers)
            </span>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 font-medium transition-colors shadow-2xs"
              >
                <ChevronLeftIcon size={14} />
                <span>Previous</span>
              </button>

              <span className="px-2 font-semibold text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 font-medium transition-colors shadow-2xs"
              >
                <span>Next</span>
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer 360 Detail Modal */}
      <StoreCustomerDetailModal
        customerId={selectedCustomerId}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
};

export default AdminStoreCustomersPage;
