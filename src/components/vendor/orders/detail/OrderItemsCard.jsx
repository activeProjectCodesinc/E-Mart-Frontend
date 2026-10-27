export const OrderItemsCard = ({ items = [] }) => {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Order Items ({items.length})
        </h3>
        <span className="text-[11px] text-slate-400 font-semibold">{items.length} Items</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item, idx) => {
          const itemImg =
            item.img ||
            item.image ||
            item.imageUrl ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60';
          const itemQty = item.qty || item.quantity || 1;
          const itemPrice =
            typeof item.price === 'number'
              ? `PKR ${item.price.toFixed(2)}`
              : item.price || 'PKR 0.00';
          const itemTotal =
            item.total ||
            (item.lineTotal !== undefined
              ? `PKR ${Number(item.lineTotal).toFixed(2)}`
              : itemPrice);

          return (
            <div key={item.id || `order-item-${idx}`} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={itemImg}
                  alt={item.name || 'Item'}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {item.name || 'Product Item'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.category ? `Category: ${item.category}` : item.unit ? `Unit: ${item.unit}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                <span className="text-xs text-slate-500 font-medium">{itemPrice}</span>
                <span className="text-xs font-semibold text-slate-400">x{itemQty}</span>
                <span className="text-xs font-semibold text-slate-900 min-w-[50px]">
                  {itemTotal}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItemsCard;
