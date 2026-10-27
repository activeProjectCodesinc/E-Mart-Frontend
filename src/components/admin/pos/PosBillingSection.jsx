import { useState, useEffect } from 'react';
import { ChevronDownIcon, TrashIcon, CartIcon, MapPinIcon } from '@/icons';
import { toast } from '@/utils/toast';

export const PosBillingSection = ({
  customers = [],
  cart = [],
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenAddCustomer,
  onPlaceOrder,
  isPlacing = false,
  storeDeliveryFee = 50,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customers[0]?.id || 'walk-in'
  );
  const [orderType, setOrderType] = useState('Take Away');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState('');

  // Sync selectedCustomerId when customers change if not found
  useEffect(() => {
    if (customers.length > 0 && !customers.some((c) => c.id === selectedCustomerId)) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) ||
    customers[0] || {
      id: 'walk-in',
      name: 'Walk-in Customer',
      phone: '—',
      email: '',
      addressLine: '',
      city: 'Lahore',
      area: '',
    };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type === 'Home Delivery') {
      if (!selectedCustomer?.addressLine || selectedCustomer?.name === 'Walk-in Customer') {
        onOpenAddCustomer(selectedCustomer);
      }
    }
  };

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const productDiscount = cart.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.qty;
    }
    return sum;
  }, 0);
  const extraDiscount = 0;
  const tax = 0;
  const deliveryCharge = orderType === 'Home Delivery' && cart.length > 0 ? storeDeliveryFee : 0;
  const total = Math.max(0, subTotal + tax + deliveryCharge - extraDiscount);

  const numPaid = parseFloat(paidAmount) || 0;
  const changeAmount = numPaid > total ? (numPaid - total).toFixed(2) : '0.00';

  const handleTriggerPlaceOrder = () => {
    if (cart.length === 0) {
      toast.error('Please add products to cart before placing an order');
      return;
    }

    if (orderType === 'Home Delivery' && !selectedCustomer?.addressLine) {
      toast.error('Delivery address is required for Home Delivery orders');
      onOpenAddCustomer(selectedCustomer);
      return;
    }

    onPlaceOrder({
      customer: selectedCustomer,
      orderType,
      paymentMethod,
      total,
      paid: numPaid > 0 ? numPaid : total,
      change: changeAmount,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-slate-900">
          Billing Section
        </h2>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {cart.length} item{cart.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Customer Selection & Add New Customer */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">
          Customer <span className="text-rose-500">*</span>
        </label>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedCustomerId(nextId);
                const nextCust = customers.find((c) => c.id === nextId);
                if (orderType === 'Home Delivery' && (!nextCust?.addressLine || nextCust?.name === 'Walk-in Customer')) {
                  onOpenAddCustomer(nextCust);
                }
              }}
              className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer text-slate-800 font-semibold pr-9"
            >
              {customers.map((c) => (
                <option key={c.id || c.name} value={c.id}>
                  {c.name} {c.phone && c.phone !== '—' ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          <button
            type="button"
            onClick={() => onOpenAddCustomer(null)}
            className="px-3.5 py-2.5 bg-[#f95900] hover:bg-[#ea5000] active:scale-95 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-xs shadow-orange-500/20"
          >
            + New Customer
          </button>
        </div>

        {/* Home Delivery Address Snapshot Card */}
        {orderType === 'Home Delivery' && (
          <div className="mt-2 transition-all">
            {selectedCustomer?.addressLine ? (
              <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 text-xs min-w-0">
                  <MapPinIcon size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">
                      Delivery to: {selectedCustomer.name}
                    </span>
                    <p className="text-slate-700 truncate font-medium">
                      {selectedCustomer.addressLine}
                      {selectedCustomer.area ? `, ${selectedCustomer.area}` : ''}
                      {selectedCustomer.city ? `, ${selectedCustomer.city}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Phone: <span className="font-semibold text-slate-700">{selectedCustomer.phone || 'N/A'}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAddCustomer(selectedCustomer)}
                  className="text-xs font-bold text-[#f95900] hover:text-[#ea5000] hover:underline cursor-pointer shrink-0 whitespace-nowrap self-center"
                >
                  Edit Address
                </button>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <span>📍</span>
                  <span>Delivery address required for Home Delivery.</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAddCustomer(selectedCustomer)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  Add Address
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Type Toggle: Take Away vs Home Delivery */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Select Order Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 border border-slate-200/90 rounded-2xl bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleOrderTypeChange('Take Away')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
              orderType === 'Take Away'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Take Away (Pickup)
          </button>
          <button
            type="button"
            onClick={() => handleOrderTypeChange('Home Delivery')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
              orderType === 'Home Delivery'
                ? 'bg-white text-[#f95900] shadow-2xs border border-orange-200 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home Delivery
          </button>
        </div>
      </div>

      {/* Cart Items Table */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50/80 px-3 py-2 text-[11px] font-semibold text-slate-500 border-b border-slate-100">
          <span className="col-span-5">Item</span>
          <span className="col-span-3 text-center">Qty</span>
          <span className="col-span-3 text-right">Price</span>
          <span className="col-span-1 text-center">Del</span>
        </div>

        {cart.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="grid grid-cols-12 items-center px-3 py-2.5 text-xs">
                <div className="col-span-5 min-w-0 pr-1">
                  <h5 className="font-semibold text-slate-800 truncate">{item.name}</h5>
                  <span className="text-[10px] text-slate-400 block">{item.unit}</span>
                </div>
                <div className="col-span-3 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-semibold text-slate-800">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="col-span-3 text-right font-bold text-slate-900">
                  Rs. {(item.price * item.qty).toFixed(2)}
                </span>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-1"
                    title="Remove item"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f95900] flex items-center justify-center mb-2">
              <CartIcon size={24} />
            </div>
            <p className="text-xs text-slate-400 font-medium">No products added to cart</p>
          </div>
        )}
      </div>

      {/* Subtotals & Totals (Currency Rs.) */}
      <div className="space-y-1.5 text-xs border-b border-slate-100 pb-3 text-slate-500 font-medium">
        <div className="flex justify-between">
          <span>Sub total :</span>
          <span className="font-semibold text-slate-800">Rs. {subTotal.toFixed(2)}</span>
        </div>
        {productDiscount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Product Discount :</span>
            <span>- Rs. {productDiscount.toFixed(2)}</span>
          </div>
        )}
        {extraDiscount > 0 && (
          <div className="flex justify-between text-[#f95900]">
            <span>Extra Discount :</span>
            <span>- Rs. {extraDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Delivery Charge :</span>
          <span className={deliveryCharge > 0 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
            {deliveryCharge > 0 ? `Rs. ${deliveryCharge.toFixed(2)}` : 'Rs. 0.00 (Free)'}
          </span>
        </div>
        <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-100 text-sm">
          <span>Total Payable :</span>
          <span className="text-[#f95900] text-base">Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method: Cash vs Card */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['Cash', 'Card'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(m)}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                paymentMethod === m
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Paid Amount and Change Calculation */}
      <div className="space-y-2 text-xs font-medium text-slate-600 pt-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Tendered / Paid Amount :</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
              Rs.
            </span>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={total > 0 ? String(total) : '0'}
              className="w-32 pl-8 pr-3 py-1.5 text-right bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800 font-bold"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Change Due :</span>
          <span className="font-bold text-slate-900 text-sm">Rs. {changeAmount}</span>
        </div>
      </div>

      {/* Action Buttons: Cancel vs Place Order */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClearCart}
          disabled={cart.length === 0 || isPlacing}
          className="flex-1 py-2.5 border border-rose-300 text-rose-500 hover:bg-rose-50 active:scale-95 rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel Order
        </button>
        <button
          type="button"
          disabled={cart.length === 0 || isPlacing}
          onClick={handleTriggerPlaceOrder}
          className="flex-1 py-2.5 bg-[#f95900] hover:bg-[#ea5000] active:scale-95 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPlacing ? (
            <span>Processing Order...</span>
          ) : (
            <span>Place Order (Rs. {total.toFixed(2)})</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default PosBillingSection;
