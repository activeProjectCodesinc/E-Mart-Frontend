import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortalBase } from '@/utils/usePortalBase';
import { PAYOUT_HISTORY } from '@/mock/vendor/vendorFinance.mock';
import PayoutDetailsHeader from '@/components/vendor/finance/details/PayoutDetailsHeader';
import PayoutReferenceCard from '@/components/vendor/finance/details/PayoutReferenceCard';
import PayoutBreakdownCard from '@/components/vendor/finance/details/PayoutBreakdownCard';
import TransactionTimelineCard from '@/components/vendor/finance/details/TransactionTimelineCard';
import PayoutHelpCard from '@/components/vendor/finance/details/PayoutHelpCard';
import { useApiQuery } from '@/hooks/useApiQuery';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { toast } from '@/utils/toast';

export const VendorPayoutDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();

  const queryKey = QUERY_KEYS.ADMIN?.STORE?.FINANCE?.PAYOUT_DETAIL(id) || [
    'admin',
    'store',
    'finance',
    'payouts',
    id,
  ];
  const payoutUrl = apiRoutes.admin?.store?.finance?.payoutDetail
    ? apiRoutes.admin.store.finance.payoutDetail(id)
    : `/admin/store/finance/payouts/${id}`;

  const { data: response } = useApiQuery(queryKey, payoutUrl, {
    enabled: Boolean(id),
  });

  const payout = useMemo(() => {
    if (response?.data?.payout) return response.data.payout;
    if (response?.data) return response.data;
    return (
      PAYOUT_HISTORY.find((item) => item.id === id || item.cleanId === id) ||
      PAYOUT_HISTORY[0]
    );
  }, [response, id]);

  const handleDownloadReceipt = () => {
    toast.success(`Downloading receipt for payout ${payout.id}...`);
  };

  const handleContactSupport = () => {
    navigate(getRoute('/support'));
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <PayoutDetailsHeader
        onBack={() => navigate(getRoute('/finance'))}
        onDownloadReceipt={handleDownloadReceipt}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <PayoutReferenceCard payout={payout} />
          <PayoutBreakdownCard
            breakdown={payout.breakdown || [
              { description: 'Payout Request', orderId: '—', amount: payout.amount, type: 'credit' },
              { description: 'Transfer Fee', orderId: '—', amount: 0, type: 'fee' },
            ]}
            total={payout.amount}
          />
        </div>

        <div className="lg:col-span-1 space-y-4 sm:space-y-5">
          <TransactionTimelineCard timeline={payout.timeline || [
            { step: 'Initiated', time: payout.date || 'Today', completed: true },
            { step: 'Processing', time: payout.status === 'Processing' ? 'In Progress' : 'Completed', completed: payout.status !== 'Initiated' },
            { step: 'Completed', time: payout.status === 'Completed' ? 'Completed' : 'Pending', completed: payout.status === 'Completed' },
          ]} />
          <PayoutHelpCard onContactSupport={handleContactSupport} />
        </div>
      </div>
    </div>
  );
};

export default VendorPayoutDetailsPage;
