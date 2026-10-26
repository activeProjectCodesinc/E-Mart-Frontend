import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/icons';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { usePortalBase } from '@/utils/usePortalBase';
import { INITIAL_ORDERS } from '@/mock/vendor/vendorOrders.mock';
import CustomerInfoCard from '@/components/vendor/orders/detail/CustomerInfoCard';
import RiderInfoCard from '@/components/vendor/orders/detail/RiderInfoCard';
import OrderSummaryCard from '@/components/vendor/orders/detail/OrderSummaryCard';
import OrderItemsCard from '@/components/vendor/orders/detail/OrderItemsCard';
import OrderStatusStepper from '@/components/vendor/orders/detail/OrderStatusStepper';
import DeliveryProofCard from '@/components/vendor/orders/detail/DeliveryProofCard';
import OrderCancelledCard from '@/components/vendor/orders/detail/OrderCancelledCard';
import { useAdminOrderDetail, useUpdateOrderStatus } from '@/hooks';

const STATUS_PILLS = {
  Completed: 'bg-[#ebf8ee] text-[#16a34a] border-[#bbf7d0]',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-200',
  'New Order': 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-600 border-blue-200',
  'Ready For Pickup': 'bg-sky-50 text-sky-600 border-sky-200',
  'Out For Delivery': 'bg-orange-50 text-orange-600 border-orange-200',
  Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const DEFAULT_RIDER = {
  name: 'Usman Khan (R-21)',
  phone: '+92 335 4450667',
  rating: '4.8',
  deliveries: 320,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
};

const DEFAULT_PROOF = {
  photos: [
    'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=300&auto=format&fit=crop&q=80',
  ],
  completedAt: 'Just now',
  riderNote: 'Package delivered securely.',
};

export const VendorOrderDetailPage = () => {
  const { id } = useParams();
  const { getRoute } = usePortalBase();
  const [backRef, backTrigger] = useAnimatedIcon();
  const { order: apiOrder, isLoading } = useAdminOrderDetail(id);
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const order = useMemo(() => {
    if (apiOrder) {
      return {
        id: apiOrder.orderNumber || apiOrder.id,
        cleanId: apiOrder.id,
        customer: apiOrder.customer?.fullName || apiOrder.customer || 'Customer',
        phone: apiOrder.customer?.phone || '',
        address: apiOrder.deliveryAddress || apiOrder.address || 'Address provided at checkout',
        items: apiOrder.items || [],
        total: apiOrder.total ? (String(apiOrder.total).startsWith('PKR') ? apiOrder.total : `PKR ${apiOrder.total}`) : 'PKR 0.00',
        status: apiOrder.status ? apiOrder.status.charAt(0).toUpperCase() + apiOrder.status.slice(1).replace('_', ' ') : 'Pending',
        rider: apiOrder.rider || DEFAULT_RIDER,
        deliveryProof: apiOrder.deliveryProof || DEFAULT_PROOF,
      };
    }
    const formattedId = id?.startsWith('#') ? id : `#${id}`;
    return INITIAL_ORDERS.find((o) => o.id === formattedId) || INITIAL_ORDERS[0];
  }, [apiOrder, id]);

  const isCancelled = order.status === 'Cancelled';

  const handleStatusChange = (newStatus) => {
    const apiStatus = newStatus.toLowerCase().replace(/\s+/g, '_');
    updateStatus({
      id: order.cleanId || id,
      status: apiStatus,
    });
  };

  return (
    <div className={`space-y-4 transition-opacity ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
      <div>
        <Link
          to={getRoute('/orders')}
          onMouseEnter={backTrigger.onMouseEnter}
          onMouseLeave={backTrigger.onMouseLeave}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeftIcon ref={backRef} animateOnHover={false} size={14} />
          <span>Back to Orders</span>
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Order {order.id}
          </h1>

          <span
            className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${
              STATUS_PILLS[order.status] || STATUS_PILLS.Completed
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <CustomerInfoCard
              customer={order.customer}
              phone={order.phone}
              address={order.address}
            />

            {isCancelled ? (
              <OrderCancelledCard order={order} />
            ) : (
              <RiderInfoCard rider={order.rider} />
            )}
          </div>

          <OrderItemsCard items={order.items || []} />

          {!isCancelled && (
            <DeliveryProofCard deliveryProof={order.deliveryProof} />
          )}
        </div>

        <div className="lg:col-span-4 space-y-5">
          <OrderSummaryCard order={order} />

          {!isCancelled && (
            <OrderStatusStepper
              currentStatus={order.status}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailPage;
