import { useState, useMemo } from 'react';
import AnalyticsHeader from '@/components/vendor/analytics/AnalyticsHeader';
import AnalyticsMetricsGrid from '@/components/vendor/analytics/AnalyticsMetricsGrid';
import SalesOrdersTrendChart from '@/components/vendor/analytics/SalesOrdersTrendChart';
import SalesByCategoryCard from '@/components/vendor/analytics/SalesByCategoryCard';
import SalesByPaymentMethodCard from '@/components/vendor/analytics/SalesByPaymentMethodCard';
import SalesByCustomerTypeCard from '@/components/vendor/analytics/SalesByCustomerTypeCard';
import { useApiQuery } from '@/hooks/useApiQuery';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import baseURL from '@/services/apiBaseURL';
import { getAccessToken } from '@/services/tokenService';
import { toast } from '@/utils/toast';

import { getPresetDates } from '@/utils/datePresets';

const CATEGORY_COLORS = ['#f97316', '#fed7aa', '#c084fc', '#38bdf8', '#818cf8', '#22c55e'];
const PAYMENT_COLORS = {
  cash: '#22c55e',
  card: '#f97316',
  wallet: '#38bdf8',
  other: '#a855f7',
};

export const VendorAnalyticsPage = () => {
  const [dateRange, setDateRange] = useState(() => getPresetDates('last_30_days'));
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Analytics from Backend API with reactive dateRange
  const queryParams = useMemo(() => ({
    from: dateRange.from,
    to: dateRange.to,
  }), [dateRange.from, dateRange.to]);

  const queryKey = QUERY_KEYS.ADMIN?.STORE?.ANALYTICS?.OVERVIEW(queryParams) || [
    'admin',
    'store',
    'analytics',
    'overview',
    queryParams,
  ];
  const analyticsUrl =
    apiRoutes.admin?.store?.analytics?.base || '/admin/store/analytics';

  const { data: response, isLoading } = useApiQuery(queryKey, analyticsUrl, {
    params: queryParams,
    staleTime: 1000 * 60 * 5,
  });

  const analyticsData = response?.data;
  const totals = analyticsData?.totals;

  // Format Total Sales in PKR
  const formattedTotalSales = useMemo(() => {
    const val = totals?.sales?.value;
    if (val != null) {
      return `PKR ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return 'PKR 0.00';
  }, [totals]);

  // Normalized Sales by Category
  const categoryData = useMemo(() => {
    if (
      analyticsData?.salesByCategory &&
      Array.isArray(analyticsData.salesByCategory) &&
      analyticsData.salesByCategory.length > 0
    ) {
      return analyticsData.salesByCategory.map((c, i) => ({
        label: c.category,
        percentage: Number(c.percent ?? c.percentage ?? 0),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));
    }
    return undefined; // Fallback to mock inside component
  }, [analyticsData]);

  // Normalized Sales by Payment Method
  const paymentData = useMemo(() => {
    if (
      analyticsData?.salesByPaymentMethod &&
      Array.isArray(analyticsData.salesByPaymentMethod) &&
      analyticsData.salesByPaymentMethod.length > 0
    ) {
      return analyticsData.salesByPaymentMethod.map((m, i) => {
        const methodKey = String(m.method || '').toLowerCase();
        let displayLabel = 'Cash on Delivery';
        if (methodKey === 'card' || methodKey === 'credit card') displayLabel = 'Credit Card';
        else if (methodKey === 'wallet' || methodKey === 'digital wallet') displayLabel = 'Digital Wallet';
        else if (methodKey === 'cash') displayLabel = 'Cash on Delivery';
        else if (methodKey) displayLabel = m.method;

        return {
          label: displayLabel,
          percentage: Number(m.percent ?? m.percentage ?? 0),
          color: PAYMENT_COLORS[methodKey] || CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        };
      });
    }
    return undefined;
  }, [analyticsData]);

  // Normalized Customer Habits
  const customerData = useMemo(() => {
    if (analyticsData?.customers) {
      return [
        {
          label: 'New Customers',
          percentage: Number(analyticsData.customers.newPercent ?? 100),
          color: '#0ea5e9',
        },
        {
          label: 'Returning Customers',
          percentage: Number(analyticsData.customers.returningPercent ?? 0),
          color: '#f97316',
        },
      ];
    }
    return undefined;
  }, [analyticsData]);

  // Export Analytics CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const token = getAccessToken();
      const params = new URLSearchParams({
        report: 'daily',
        from: dateRange.from,
        to: dateRange.to,
      });

      const exportEndpoint =
        apiRoutes.admin?.store?.analytics?.export || '/admin/store/analytics/export';
      const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
      const exportUrl = `${cleanBase}${exportEndpoint}?${params.toString()}`;

      const res = await fetch(exportUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Analytics export failed');

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `store_analytics_${dateRange.from}_to_${dateRange.to}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success('Analytics report exported successfully!');
    } catch (err) {
      console.error('Export analytics error:', err);
      toast.error('Failed to export analytics CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePeriodChange = (presetId) => {
    setDateRange(getPresetDates(presetId));
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <AnalyticsHeader
        currentRange={dateRange}
        onRangeChange={setDateRange}
        onExport={handleExportCSV}
        isExporting={isExporting}
      />

      <AnalyticsMetricsGrid totals={totals} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <SalesOrdersTrendChart
            data={analyticsData?.trend}
            period={dateRange.label || 'This Month'}
            onPeriodChange={handlePeriodChange}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <SalesByCategoryCard
            data={categoryData}
            totalSales={formattedTotalSales}
            period={dateRange.label || 'This Month'}
            onPeriodChange={handlePeriodChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        <SalesByPaymentMethodCard
          data={paymentData}
          totalSales={formattedTotalSales}
        />
        <SalesByCustomerTypeCard
          data={customerData}
          totalOrders={totals?.orders?.value || 0}
        />
      </div>
    </div>
  );
};

export default VendorAnalyticsPage;
