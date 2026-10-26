import { useState, useMemo } from 'react';
import { ChevronDownIcon } from '@/icons';
import VendorHeroBanner from '@/components/vendor/dashboard/VendorHeroBanner';
import VendorStatCards from '@/components/vendor/dashboard/VendorStatCards';
import VendorSalesChart from '@/components/vendor/dashboard/VendorSalesChart';
import VendorRecentOrders from '@/components/vendor/dashboard/VendorRecentOrders';
import VendorTopProducts from '@/components/vendor/dashboard/VendorTopProducts';
import VendorLowStock from '@/components/vendor/dashboard/VendorLowStock';
import VendorQuickActions from '@/components/vendor/dashboard/VendorQuickActions';
import { useAdminDashboard } from '@/hooks';
import {
  VENDOR_KPIS,
  SALES_CHART_DATA,
  RECENT_ORDERS,
  TOP_SELLING_PRODUCTS,
  LOW_STOCK_PRODUCTS,
} from '@/mock/vendor/vendorDashboard.mock';

const RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'];

const getDateRange = (range) => {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  const fromDate = new Date();

  if (range === 'Last 7 Days') fromDate.setDate(now.getDate() - 7);
  else if (range === 'Last 30 Days') fromDate.setDate(now.getDate() - 30);
  else if (range === 'This Month') fromDate.setDate(1);
  else if (range === 'All Time') fromDate.setFullYear(now.getFullYear() - 1);

  return { from: fromDate.toISOString().split('T')[0], to };
};

export const VendorOverviewPage = () => {
  const [selectedRange, setSelectedRange] = useState('Last 7 Days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dateParams = useMemo(() => getDateRange(selectedRange), [selectedRange]);
  const { kpis, salesOverview, recentOrders, topProducts, lowStock, isLoading } =
    useAdminDashboard(dateParams);

  const stats = useMemo(() => {
    if (!kpis) return VENDOR_KPIS;
    const formatChange = (val) => (val != null ? `${val >= 0 ? '+' : ''}${val}%` : '0%');

    return [
      {
        id: 'sales',
        title: 'Total Sales',
        value: Number(kpis.totalSales?.value ?? 0).toLocaleString(),
        change: formatChange(kpis.totalSales?.change),
        trend: (kpis.totalSales?.change ?? 0) >= 0 ? 'up' : 'down',
      },
      {
        id: 'orders',
        title: 'Total Orders',
        value: Number(kpis.totalOrders?.value ?? 0).toLocaleString(),
        change: formatChange(kpis.totalOrders?.change),
        trend: (kpis.totalOrders?.change ?? 0) >= 0 ? 'up' : 'down',
      },
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: `PKR ${Number(kpis.totalRevenue?.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: formatChange(kpis.totalRevenue?.change),
        trend: (kpis.totalRevenue?.change ?? 0) >= 0 ? 'up' : 'down',
      },
      {
        id: 'lowStock',
        title: 'Low Stock Products',
        value: String(kpis.lowStockProducts?.value ?? 0),
        change: 'Alert',
        trend: 'down',
      },
    ];
  }, [kpis]);

  const chartData = useMemo(() => {
    if (salesOverview && Array.isArray(salesOverview) && salesOverview.length > 0) {
      return salesOverview.map((item) => ({
        day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: Number(item.orders || 0),
        revenue: item.revenue || '0.00',
      }));
    }
    return SALES_CHART_DATA;
  }, [salesOverview]);

  const ordersData = useMemo(() => {
    if (recentOrders && Array.isArray(recentOrders)) {
      return recentOrders.map((order) => {
        const isOk = order.status === 'delivered' || order.status === 'completed';
        const statusType = isOk ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning';
        const dateStr = order.placedAt
          ? new Date(order.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Today';

        return {
          id: order.orderNumber || order.id,
          cleanId: order.id,
          customer: typeof order.customer === 'object' ? order.customer.fullName : (order.customer || 'Customer'),
          items: order.itemsCount || 1,
          total: String(order.total).startsWith('PKR') ? order.total : `PKR ${order.total}`,
          status: order.status
            ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')
            : 'Pending',
          statusType,
          date: dateStr,
        };
      });
    }
    return RECENT_ORDERS;
  }, [recentOrders]);

  const topProductsData = useMemo(() => {
    if (topProducts && Array.isArray(topProducts)) {
      return topProducts.map((p, idx) => ({
        id: p.productId || `tp-${idx}`,
        name: p.name,
        sales: `${Number(p.sales || 0).toLocaleString()} sales`,
        price: `PKR ${Number(p.revenue || 0).toLocaleString()}`,
        img: p.imageUrl || TOP_SELLING_PRODUCTS[idx % TOP_SELLING_PRODUCTS.length]?.img,
      }));
    }
    return TOP_SELLING_PRODUCTS;
  }, [topProducts]);

  const lowStockData = useMemo(() => {
    if (lowStock && Array.isArray(lowStock)) {
      return lowStock.map((p, idx) => ({
        id: p.productId || `ls-${idx}`,
        name: p.name,
        stock: `${p.stock} ${p.unit || ''} left in stock`,
        status: p.stock === 0 ? 'Out of Stock' : 'Low Stock',
        img: p.imageUrl || LOW_STOCK_PRODUCTS[idx % LOW_STOCK_PRODUCTS.length]?.img,
      }));
    }
    return LOW_STOCK_PRODUCTS;
  }, [lowStock]);

  return (
    <div className={`space-y-4 sm:space-y-6 ${isLoading ? 'opacity-80' : 'opacity-100'} transition-opacity`}>
      <VendorHeroBanner />

      <div className="flex items-center justify-end relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <span>{selectedRange}</span>
            <ChevronDownIcon size={14} className="text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
              {RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => {
                    setSelectedRange(range);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <VendorStatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-5">
          <VendorSalesChart data={chartData} />
        </div>
        <div className="lg:col-span-7">
          <VendorRecentOrders orders={ordersData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <VendorTopProducts products={topProductsData} />
        <VendorLowStock products={lowStockData} />
        <VendorQuickActions />
      </div>
    </div>
  );
};

export default VendorOverviewPage;
