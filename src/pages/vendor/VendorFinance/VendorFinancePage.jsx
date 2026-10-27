import { useState } from 'react';
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
import { toast } from '@/utils/toast';

export const VendorFinancePage = () => {
  const navigate = useNavigate();
  const { isAdminStore, getRoute } = usePortalBase();
  const [balance, setBalance] = useState(INITIAL_PAYOUT_BALANCE);
  const [bankAccount, setBankAccount] = useState(INITIAL_BANK_ACCOUNT);
  const [payouts, setPayouts] = useState(PAYOUT_HISTORY);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);

  const handleRequestPayout = (amount) => {
    setBalance((prev) => ({
      ...prev,
      available: Math.max(0, prev.available - amount),
    }));

    const newPayout = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Today',
      amount: amount,
      status: 'Processing',
      method: 'Bank Transfer',
      bank: `${bankAccount.bankName} (${bankAccount.accountNumber.slice(-8)})`,
      timeline: [
        { step: 'Initiated', time: 'Just now', completed: true },
        { step: 'Processing', time: 'Estimated 24-48 hrs', completed: false },
        { step: 'Completed', time: 'Pending confirmation', completed: false },
      ],
      breakdown: [
        { description: 'Payout Request', orderId: '—', amount: amount, type: 'credit' },
        { description: 'Transfer Fee', orderId: '—', amount: 0, type: 'fee' },
      ],
    };

    setPayouts((prev) => [newPayout, ...prev]);
    setIsRequestModalOpen(false);
    toast.success(`Payout request of PKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} submitted successfully!`);
  };

  const handleSaveBank = (updatedBank) => {
    setBankAccount(updatedBank);
    setIsEditBankModalOpen(false);
    toast.success('Bank account details updated successfully!');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <FinanceHeader />

      <FinanceMetricsGrid />

      {!isAdminStore && (
        <>
          <PayoutBannerCard
            amount={`PKR ${balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            nextDate={balance.nextPayoutDate}
            onRequestPayout={() => setIsRequestModalOpen(true)}
          />

          <PayoutBalanceCard
            available={`PKR ${balance.available.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            minimum={`PKR ${balance.minimumAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            autoPayoutEnabled={balance.autoPayout}
            autoPayoutFrequency={balance.frequency}
          />

          <BankAccountCard
            bankAccount={bankAccount}
            onEdit={() => setIsEditBankModalOpen(true)}
          />
        </>
      )}

      <EarningsOverviewChart data={EARNINGS_CHART_DATA} />

      {!isAdminStore && (
        <>
          <PayoutHistoryTable
            payouts={payouts}
            onViewDetails={(item) => navigate(getRoute(`/finance/payouts/${item.id}`))}
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
        </>
      )}
    </div>
  );
};

export default VendorFinancePage;
