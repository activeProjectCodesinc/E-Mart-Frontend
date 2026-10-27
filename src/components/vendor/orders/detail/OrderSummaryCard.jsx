export const OrderSummaryCard = ({ order }) => {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full flex flex-col justify-between">
      <h3 className="text-sm font-semibold text-slate-900 tracking-tight mb-4">
        Order Summary
      </h3>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-500">
          <span>Items Total</span>
          <span className="font-semibold text-slate-800">{order.subtotal || order.total}</span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span>Delivery Fee</span>
          <span className="font-semibold text-slate-800">{order.deliveryFee || 'PKR 0.00'}</span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span>Discount</span>
          <span className="font-semibold text-slate-800">{order.discount || 'PKR 0.00'}</span>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Total</span>
          <span className="text-base font-semibold text-orange-500">{order.total}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4">
        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
          Payment Method
        </span>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
            COD
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-800 leading-none">
              {order.paymentMethod || 'Cash'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {order.paymentMethod === 'Online Payment' ? 'Paid Online' : 'Cash on Delivery'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
