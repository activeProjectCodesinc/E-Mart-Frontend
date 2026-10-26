import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { RECENT_ORDERS } from '@/mock/admin/adminDashboard.mock';
import { slideUp } from '@/animation/animations';

export const AdminRecentOrders = ({ orders }) => {
  const displayOrders = useMemo(() => {
    if (orders && Array.isArray(orders)) {
      return orders.map((o) => ({
        id: o.orderNumber || o.id,
        customer: typeof o.customer === 'object' ? o.customer.fullName : (o.customer || 'Customer'),
        vendor: 'Official Store',
        amount: String(o.total).startsWith('PKR') ? o.total : `PKR ${o.total}`,
        status: o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1).replace('_', ' ') : 'Pending',
        badgeClass:
          o.status === 'delivered' || o.status === 'completed'
            ? 'bg-emerald-50 text-emerald-600'
            : o.status === 'cancelled'
            ? 'bg-rose-50 text-rose-600'
            : 'bg-amber-50 text-amber-600',
      }));
    }
    return RECENT_ORDERS;
  }, [orders]);

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
          Recent Orders
        </h3>
        <Link
          to="/admin/orders"
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Vendor</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  No recent orders found
                </td>
              </tr>
            ) : (
              displayOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">{order.id}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{order.customer}</td>
                  <td className="py-3 px-3 text-slate-500 font-medium">{order.vendor}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{order.amount}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-block ${order.badgeClass}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminRecentOrders;
