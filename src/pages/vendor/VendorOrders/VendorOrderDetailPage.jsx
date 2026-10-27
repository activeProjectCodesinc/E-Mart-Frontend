import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/icons';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { usePortalBase } from '@/utils/usePortalBase';
import { INITIAL_ORDERS } from '@/mock/vendor/vendorOrders.mock';
import CustomerInfoCard from '@/components/vendor/orders/detail/CustomerInfoCard';
import RiderInfoCard from '@/components/vendor/orders/detail/RiderInfoCard';
import TakeAwayInfoCard from '@/components/vendor/orders/detail/TakeAwayInfoCard';
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
  'Ready for Pickup': 'bg-sky-50 text-sky-600 border-sky-200',
  'Out For Delivery': 'bg-orange-50 text-orange-600 border-orange-200',
  'Out for Delivery': 'bg-orange-50 text-orange-600 border-orange-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const DEFAULT_RIDER = {
  name: 'Usman Khan (R-21)',
  phone: '+92 335 4450667',
  rating: '4.8',
  deliveries: 320,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
};

export const VendorOrderDetailPage = () => {
  const { id } = useParams();
  const { getRoute } = usePortalBase();
  const [backRef, backTrigger] = useAnimatedIcon();
  const { order: apiOrder, isLoading } = useAdminOrderDetail(id);
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const order = useMemo(() => {
    if (apiOrder) {
      const cust = apiOrder.customer;
      const custName =
        typeof cust === 'object' && cust !== null
          ? cust.name ||
            cust.fullName ||
            `${cust.firstName || ''} ${cust.lastName || ''}`.trim() ||
            'Customer'
          : typeof cust === 'string' && cust.trim()
          ? cust.trim()
          : 'Customer';

      const custPhone =
        (typeof cust === 'object' && cust !== null ? cust.phone : null) ||
        apiOrder.phone ||
        '';

      const formatAddress = (addr) => {
        if (!addr) {
          return apiOrder.deliveryType === 'take_away'
            ? 'Take away counter order'
            : 'Address provided at checkout';
        }
        if (typeof addr === 'string') return addr;
        if (typeof addr === 'object') {
          return (
            [addr.addressLine || addr.address, addr.area, addr.city]
              .filter(Boolean)
              .join(', ') || 'Address provided at checkout'
          );
        }
        return String(addr);
      };

      const normalizedItems = Array.isArray(apiOrder.items)
        ? apiOrder.items.map((item, idx) => {
            const unitPrice = Number(item.price || 0);
            const quantity = Number(item.quantity || item.qty || 1);
            const lineTotal =
              item.lineTotal !== undefined
                ? Number(item.lineTotal)
                : unitPrice * quantity;
            return {
              id: item.productId || item.id || `item-${idx}`,
              name: item.name || 'Product Item',
              category: item.category || item.unit || 'Standard',
              price: `PKR ${unitPrice.toFixed(2)}`,
              qty: quantity,
              total: `PKR ${lineTotal.toFixed(2)}`,
              img:
                item.imageUrl ||
                item.image ||
                item.img ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60',
            };
          })
        : [];

      const summary = apiOrder.summary || apiOrder.billing || {};
      const subtotalVal = summary.subtotal ?? apiOrder.subtotal ?? apiOrder.total ?? 0;
      const deliveryFeeVal = summary.deliveryFee ?? apiOrder.deliveryFee ?? 0;
      const discountVal =
        summary.couponDiscount ??
        summary.discount ??
        summary.savings ??
        apiOrder.discount ??
        0;
      const totalVal = summary.total ?? apiOrder.total ?? 0;
      const paymentMethod =
        apiOrder.payment?.method || summary.paymentMethod || apiOrder.paymentMethod || 'Cash';
      const paymentStatus = apiOrder.payment?.status || 'paid';

      return {
        id: apiOrder.orderNumber ? `#${apiOrder.orderNumber}` : (apiOrder.id ? `#${apiOrder.id.slice(0, 8)}` : '#EM'),
        cleanId: apiOrder.id,
        orderNumber: apiOrder.orderNumber || apiOrder.id,
        customer: custName,
        phone: custPhone,
        address: formatAddress(apiOrder.deliveryAddress || apiOrder.address || apiOrder.customer?.location),
        items: normalizedItems,
        subtotal: `PKR ${Number(subtotalVal).toFixed(2)}`,
        deliveryFee: `PKR ${Number(deliveryFeeVal).toFixed(2)}`,
        discount: `PKR ${Number(discountVal).toFixed(2)}`,
        total: `PKR ${Number(totalVal).toFixed(2)}`,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        deliveryType: apiOrder.deliveryType || 'take_away',
        deliveryInstructions:
          apiOrder.deliveryInstructions ||
          (apiOrder.deliveryType === 'take_away' ? 'POS Counter Take Away' : ''),
        status: apiOrder.status
          ? apiOrder.status === 'delivered'
            ? 'Delivered'
            : apiOrder.status.charAt(0).toUpperCase() + apiOrder.status.slice(1).replace('_', ' ')
          : 'Pending',
        rider: apiOrder.rider || null,
        deliveryProof: apiOrder.deliveryProof || null,
        timeline: apiOrder.timeline || [],
        placedAt: apiOrder.placedAt || null,
        actions: apiOrder.actions || {},
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Order {order.id}
          </h1>

          <span
            className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
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
            ) : order.deliveryType === 'take_away' ? (
              <TakeAwayInfoCard order={order} />
            ) : order.rider ? (
              <RiderInfoCard rider={order.rider} />
            ) : (
              <TakeAwayInfoCard order={order} />
            )}
          </div>

          <OrderItemsCard items={order.items || []} />

          {!isCancelled && order.deliveryProof && (
            <DeliveryProofCard deliveryProof={order.deliveryProof} />
          )}
        </div>

        <div className="lg:col-span-4 space-y-5">
          <OrderSummaryCard order={order} />

          {!isCancelled && (
            <OrderStatusStepper
              currentStatus={order.status}
              deliveryType={order.deliveryType}
              timeline={order.timeline}
              placedAt={order.placedAt}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailPage;
