import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import {
  getVendorSummaryById,
  getOrdersByVendorId,
} from '@/mock/admin/orders.mock';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import OrderActionButton from '@/components/admin/orders/OrderActionButton';
import VendorProfileCard from './components/VendorProfileCard';
import VendorOrdersFilterBar from './components/VendorOrdersFilterBar';
import VendorOrderDetailRow from './components/VendorOrderDetailRow';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/icons';
import { useDebounce } from '@/hooks';

export const AdminVendorOrdersPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const vendor = useMemo(() => getVendorSummaryById(vendorId), [vendorId]);
  const allOrders = useMemo(() => getOrdersByVendorId(vendorId), [vendorId]);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }
      if (paymentFilter !== 'All' && order.paymentStatus !== paymentFilter) {
        return false;
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q) || order.orderId?.toLowerCase().includes(q);
        const matchesCustomer = order.customer?.name.toLowerCase().includes(q);
        const matchesRider = order.rider?.name.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesRider) {
          return false;
        }
      }
      return true;
    });
  }, [allOrders, statusFilter, paymentFilter, debouncedSearch]);

  const totalOrdersCount = filteredOrders.length;
  const totalPages = Math.ceil(totalOrdersCount / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <OrderActionButton
            icon={ArrowLeftIcon}
            title="Back to Orders"
            onClick={() => navigate('/admin/orders')}
            iconSize={16}
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-orange-600 hover:border-orange-200 shadow-2xs"
          />
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Link
              to="/admin/orders"
              className="hover:text-orange-600 transition-colors"
            >
              Orders
            </Link>
            <span>/</span>
            <span className="text-slate-400">Vendor Orders</span>
            <span>/</span>
            <span className="font-bold text-slate-800">{vendor.vendorName}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/orders')}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          View All Vendors
        </button>
      </div>

      {/* Vendor Profile & Stats Card */}
      <VendorProfileCard vendor={vendor} />

      {/* Filter and Search Bar for Vendor Orders */}
      <VendorOrdersFilterBar
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={(v) => {
          setPaymentFilter(v);
          setCurrentPage(1);
        }}
      />

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-5 pr-3 font-semibold">Order ID</th>
                <th className="py-3.5 px-3 font-semibold">Customer Name</th>
                <th className="py-3.5 px-3 font-semibold">Rider</th>
                <th className="py-3.5 px-3 font-semibold">Delivery Status</th>
                <th className="py-3.5 px-3 font-semibold">Payment Status</th>
                <th className="py-3.5 px-3 font-semibold">Amount</th>
                <th className="py-3.5 px-3 font-semibold">Date</th>
                <th className="py-3.5 px-3 pr-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders found for this vendor.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <VendorOrderDetailRow
                    key={order.id}
                    order={order}
                    onViewOrder={setSelectedOrder}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalOrdersCount)}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalOrdersCount}</span> vendor orders
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/90 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeftIcon animateOnHover={false} size={14} />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  type="button"
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg font-medium transition-colors cursor-pointer ${
                    currentPage === idx + 1
                      ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/90 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRightIcon animateOnHover={false} size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </motion.div>
  );
};

export default AdminVendorOrdersPage;
