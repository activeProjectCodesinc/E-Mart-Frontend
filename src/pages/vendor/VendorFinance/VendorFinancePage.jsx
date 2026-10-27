import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalBase } from '@/utils/usePortalBase';
import {
  FINANCE_METRICS,
  INITIAL_PAYOUT_BALANCE,
  INITIAL_BANK_ACCOUNT,
  EARNINGS_CHART_DATA,
  PAYOUT_HISTORY,
} from '@/mock/vendor/vendorFinance.mock';
import FinanceHeader from '@/components/vendor/finance/FinanceHeader';
import FinanceMetricsGrid from '@/components/vendor/finance/FinanceMetricsGrid';
import PayoutBannerCard from '@/components/vendor/finance/PayoutBannerCard';
import PayoutBalanceCard from '@/components/vendor/finance/PayoutBalanceCard';
import BankAccountCard from '@/components/vendor/finance/BankAccountCard';
import EarningsOverviewChart from '@/components/vendor/finance/EarningsOverviewChart';
import PayoutHistoryTable from '@/components/vendor/finance/PayoutHistoryTable';
import RequestPayoutModal from '@/components/vendor/finance/RequestPayoutModal';
import EditBankAccountModal from '@/components/vendor/finance/EditBankAccountModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post, put } from '@/services/apiServices';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';

export const VendorFinancePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getRoute } = usePortalBase();

  const [dateRange] = useState(() => {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const to = now.toISOString().split('T')[0];
    return { from, to };
  });

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);

  // Fetch Finance Overview from Backend API
  const queryKey = QUERY_KEYS.ADMIN?.STORE?.FINANCE?.OVERVIEW(dateRange) || [
    'admin',
    'store',
    'finance',
    'overview',
    dateRange,
  ];
  const financeUrl =
    apiRoutes.admin?.store?.finance?.base || '/admin/store/finance';

  const { data: response, isLoading, refetch } = useApiQuery(
    queryKey,
    financeUrl,
    {
      params: dateRange,
      staleTime: 1000 * 60 * 3,
    }
  );

  const apiData = response?.data;

  // Normalized Metrics
  const metrics = useMemo(() => {
    return apiData?.metrics || null;
  }, [apiData]);

  // Normalized Balance
  const balance = useMemo(() => {
    const available = Number(
      apiData?.balance?.availableRaw ?? apiData?.balance?.available ?? INITIAL_PAYOUT_BALANCE.available
    );
    const minimum = Number(
      apiData?.balance?.minimumAmount ?? INITIAL_PAYOUT_BALANCE.minimumAmount
    );

    return {
      available,
      minimumAmount: minimum,
      autoPayout: apiData?.balance?.autoPayout ?? INITIAL_PAYOUT_BALANCE.autoPayout,
      frequency: apiData?.balance?.frequency || INITIAL_PAYOUT_BALANCE.frequency,
      nextPayoutDate:
        apiData?.balance?.nextPayoutDate || INITIAL_PAYOUT_BALANCE.nextPayoutDate,
    };
  }, [apiData]);

  // Normalized Bank Account
  const bankAccount = useMemo(() => {
    if (apiData?.bankAccount) {
      return {
        bankName: apiData.bankAccount.bankName,
        accountTitle: apiData.bankAccount.accountTitle,
        accountNumber: apiData.bankAccount.accountNumber,
        rawAccountNumber:
          apiData.bankAccount.rawAccountNumber || apiData.bankAccount.accountNumber,
        iban: apiData.bankAccount.iban || '',
        branchCode: apiData.bankAccount.branchCode || '',
        isVerified: Boolean(apiData.bankAccount.isVerified),
      };
    }
    return INITIAL_BANK_ACCOUNT;
  }, [apiData]);

  // Normalized Earnings Chart
  const chartData = useMemo(() => {
    if (apiData?.earningsChart && Array.isArray(apiData.earningsChart) && apiData.earningsChart.length > 0) {
      return apiData.earningsChart.map((item) => ({
        label: item.day || item.date || item.label,
        sales: Number(item.totalSales ?? item.sales ?? 0),
        net: Number(item.netEarnings ?? item.net ?? 0),
      }));
    }
    return EARNINGS_CHART_DATA;
  }, [apiData]);

  // Normalized Payouts History
  const payouts = useMemo(() => {
    if (apiData?.payouts && Array.isArray(apiData.payouts)) {
      return apiData.payouts;
    }
    return PAYOUT_HISTORY;
  }, [apiData]);

  // Submit Payout Request Mutation
  const handleRequestPayout = async (amount, notes = '') => {
    try {
      const payoutsUrl =
        apiRoutes.admin?.store?.finance?.payouts || '/admin/store/finance/payouts';
      await post(payoutsUrl, { amount, notes });
      toast.success(
        `Payout request of PKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} submitted successfully!`
      );
      setIsRequestModalOpen(false);
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch (err) {
      console.error('Payout request error:', err);
      toast.error('Failed to submit payout request');
    }
  };

  // Update Bank Account Mutation
  const handleSaveBank = async (updatedBank) => {
    try {
      const bankUrl =
        apiRoutes.admin?.store?.finance?.bankAccount ||
        '/admin/store/finance/bank-account';
      await put(bankUrl, {
        bankName: updatedBank.bankName,
        accountTitle: updatedBank.accountTitle,
        accountNumber: updatedBank.rawAccountNumber || updatedBank.accountNumber,
        iban: updatedBank.iban,
        branchCode: updatedBank.branchCode || '',
      });
      toast.success('Bank account details updated successfully!');
      setIsEditBankModalOpen(false);
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch (err) {
      console.error('Update bank account error:', err);
      toast.error('Failed to update bank account');
    }
  };

  const formattedDateRange = useMemo(() => {
    const f = new Date(dateRange.from).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const t = new Date(dateRange.to).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${f} - ${t}`;
  }, [dateRange]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <FinanceHeader dateRange={formattedDateRange} />

      <FinanceMetricsGrid metrics={metrics} />

      <PayoutBannerCard
        amount={`PKR ${balance.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        nextDate={balance.nextPayoutDate}
        onRequestPayout={() => setIsRequestModalOpen(true)}
      />

      <PayoutBalanceCard
        available={`PKR ${balance.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        minimum={`PKR ${balance.minimumAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        autoPayoutEnabled={balance.autoPayout}
        autoPayoutFrequency={balance.frequency}
      />

      <BankAccountCard
        bankAccount={bankAccount}
        onEdit={() => setIsEditBankModalOpen(true)}
      />

      <EarningsOverviewChart data={chartData} />

      <PayoutHistoryTable
        payouts={payouts}
        onViewDetails={(item) =>
          navigate(getRoute(`/finance/payouts/${item.cleanId || item.id}`))
        }
      />

      <RequestPayoutModal
        isOpen={isRequestModalOpen}
        availableBalance={balance.available}
        bankAccount={bankAccount}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmitPayout={handleRequestPayout}
      />

      <EditBankAccountModal
        isOpen={isEditBankModalOpen}
        bankAccount={bankAccount}
        onClose={() => setIsEditBankModalOpen(false)}
        onSave={handleSaveBank}
      />
    </div>
  );
};

export default VendorFinancePage;
