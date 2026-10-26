import { useMemo } from 'react';
import AdminHeroBanner from '@/components/admin/dashboard/AdminHeroBanner';
import AdminStatCards from '@/components/admin/dashboard/AdminStatCards';
import AdminSalesChart from '@/components/admin/dashboard/AdminSalesChart';
import AdminTopProducts from '@/components/admin/dashboard/AdminTopProducts';
import AdminReportedProducts from '@/components/admin/dashboard/AdminReportedProducts';
import AdminOrderStatusDonut from '@/components/admin/dashboard/AdminOrderStatusDonut';
import AdminRecentOrders from '@/components/admin/dashboard/AdminRecentOrders';
import AdminRecentVendors from '@/components/admin/dashboard/AdminRecentVendors';
import { useAdminDashboard } from '@/hooks';
import { ADMIN_STAT_CARDS } from '@/mock/admin/adminDashboard.mock';

export const AdminOverviewPage = () => {
  const { kpis, recentOrders, topProducts, isLoading } = useAdminDashboard();

  const stats = useMemo(() => {
    if (!kpis) return ADMIN_STAT_CARDS;
    return [
      {
        id: 'orders',
        title: 'Total Orders',
        value: Number(kpis.totalOrders?.value || 0).toLocaleString(),
        trend: `${(kpis.totalOrders?.change ?? 0) >= 0 ? '+' : ''}${kpis.totalOrders?.change || 0}%`,
        iconBg: 'bg-orange-50 text-orange-500',
        accentBorder: 'border-l-orange-500',
      },
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: `PKR ${Number(kpis.totalRevenue?.value || 0).toLocaleString()}`,
        trend: `${(kpis.totalRevenue?.change ?? 0) >= 0 ? '+' : ''}${kpis.totalRevenue?.change || 0}%`,
        iconBg: 'bg-emerald-50 text-emerald-500',
        accentBorder: 'border-l-emerald-500',
      },
      {
        id: 'sales',
        title: 'Total Sales',
        value: Number(kpis.totalSales?.value || 0).toLocaleString(),
        trend: `${(kpis.totalSales?.change ?? 0) >= 0 ? '+' : ''}${kpis.totalSales?.change || 0}%`,
        iconBg: 'bg-blue-50 text-blue-500',
        accentBorder: 'border-l-blue-500',
      },
      {
        id: 'lowStock',
        title: 'Low Stock Items',
        value: String(kpis.lowStockProducts?.value || 0),
        trend: 'Alert',
        iconBg: 'bg-purple-50 text-purple-500',
        accentBorder: 'border-l-purple-500',
      },
      ADMIN_STAT_CARDS[4] || {
        id: 'customers',
        title: 'Total Customers',
        value: '3,420',
        trend: '+10%',
        iconBg: 'bg-teal-50 text-teal-500',
        accentBorder: 'border-l-teal-500',
      },
    ];
  }, [kpis]);

  return (
    <div className={`space-y-6 transition-opacity ${isLoading ? 'opacity-85' : 'opacity-100'}`}>
      <AdminHeroBanner />
      <AdminStatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <AdminSalesChart />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <AdminTopProducts products={topProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <AdminReportedProducts />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <AdminOrderStatusDonut />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <AdminRecentOrders orders={recentOrders} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <AdminRecentVendors />
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
