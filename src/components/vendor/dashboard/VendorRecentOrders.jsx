import { Link, useNavigate } from 'react-router-dom';
import { usePortalBase } from '@/utils/usePortalBase';

const STATUS_STYLES = {
  warning: 'bg-orange-50 text-orange-600 border border-orange-200/60',
  success: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  danger: 'bg-rose-50 text-rose-500 border border-rose-200/60',
};

export const VendorRecentOrders = ({ orders = [] }) => {
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();

  return (
    <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
          Recent Orders
        </h3>
        <Link
          to={getRoute('/orders')}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <table className="w-full text-left border-collapse text-xs min-w-[440px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold">
              <th className="pb-2.5 font-semibold">#Order ID</th>
              <th className="pb-2.5 font-semibold">Customer</th>
              <th className="pb-2.5 text-center font-semibold">Items</th>
              <th className="pb-2.5 font-semibold">Total</th>
              <th className="pb-2.5 font-semibold">Status</th>
              <th className="pb-2.5 text-right font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No recent orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
              const badgeStyle = STATUS_STYLES[order.statusType] || STATUS_STYLES.warning;
              const cleanId = order.id.replace('#', '');

              return (
                <tr
                  key={order.id}
                  onClick={() => navigate(getRoute(`/orders/${cleanId}`))}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <td className="py-2.5 font-semibold text-slate-800 group-hover:text-orange-600 transition-colors whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="py-2.5 text-slate-600 font-medium whitespace-nowrap">
                    {order.customer}
                  </td>
                  <td className="py-2.5 text-center text-slate-500">{order.items}</td>
                  <td className="py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                    {order.total}
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badgeStyle}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-400 font-medium whitespace-nowrap">
                    {order.date}
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorRecentOrders;
