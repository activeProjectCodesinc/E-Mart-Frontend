import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalBase } from '@/utils/usePortalBase';
import OrderActionButtons from './OrderActionButtons';

const STATUS_BADGES = {
  'New Order': 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-600 border-blue-200/70',
  'Ready for Pickup': 'bg-sky-50 text-sky-600 border-sky-200/70',
  'Out for Delivery': 'bg-orange-50 text-orange-600 border-orange-200/70',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-200/70',
};

export const OrdersTable = ({
  orders = [],
  currentPage = 1,
  totalPages = 1,
  totalOrders = orders.length,
  pageSize = 20,
  onPageChange,
  onAccept,
  onReject,
}) => {
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected = orders.length > 0 && selectedIds.length === orders.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : orders.map((o) => o.id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 font-semibold">#Order ID</th>
              <th className="py-3 px-3 font-semibold">Customer</th>
              <th className="py-3 px-3 text-center font-semibold">Items</th>
              <th className="py-3 px-3 font-semibold">Total</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Date</th>
              <th className="py-3 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length > 0 ? (
              orders.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                const isNew = order.status === 'New Order';
                const badgeClass = STATUS_BADGES[order.status] || STATUS_BADGES['Processing'];
                const targetDetailId = order.cleanId || order.id?.replace('#', '');

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(order.id)}
                        className="rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                      />
                    </td>
                    <td
                      onClick={() => navigate(getRoute(`/orders/${targetDetailId}`))}
                      className="py-3.5 px-3 font-bold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      {order.id}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      <span className="font-semibold text-slate-900 block truncate">
                        {order.customer}
                      </span>
                      {order.phone && (
                        <span className="text-[11px] text-slate-400 block font-normal">
                          {order.phone}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500 font-semibold">
                      {order.itemsCount || order.items?.length || 1}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {order.total}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium whitespace-nowrap">
                      {order.date || order.placedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <OrderActionButtons
                        isNew={isNew}
                        onAccept={() => onAccept(order)}
                        onReject={() => onReject(order)}
                        onView={() => navigate(getRoute(`/orders/${targetDetailId}`))}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 bg-white text-xs">
        <span className="text-slate-400 font-medium">
          Showing {orders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} orders
        </span>

        {totalPages > 1 && onPageChange ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              &gt;
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-500 text-white font-bold cursor-default"
            >
              1
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTable;
