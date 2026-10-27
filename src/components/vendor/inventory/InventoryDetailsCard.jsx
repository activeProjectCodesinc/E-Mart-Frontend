import { ArchiveIcon } from '@/icons';

export const InventoryDetailsCard = ({ product }) => {
  if (!product) return null;

  const stock = Number(product.stock ?? 0);
  const lowStockAlert = Number(product.lowStockAlert ?? 0);
  const unit =
    typeof product.unit === 'object' && product.unit !== null
      ? (product.unit.name || product.unit.symbol || product.unit.title || product.unit.code || 'unit')
      : (typeof product.unit === 'string' ? product.unit : 'unit');
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const costPrice =
    typeof product.costPrice === 'number'
      ? product.costPrice
      : parseFloat(product.costPrice) || (typeof product.cost === 'number' ? product.cost : parseFloat(product.cost) || price);
  const totalStockValue = stock * costPrice;
  const lastAdded =
    typeof product.lastAdded === 'object' && product.lastAdded !== null
      ? (product.lastAdded.name || product.lastAdded.date || 'N/A')
      : (typeof product.lastAdded === 'string' ? product.lastAdded : 'N/A');
  const lastUpdated =
    typeof product.lastUpdated === 'object' && product.lastUpdated !== null
      ? (product.lastUpdated.name || product.lastUpdated.date || 'N/A')
      : (typeof product.lastUpdated === 'string' ? product.lastUpdated : 'N/A');

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2">
        <ArchiveIcon size={16} className="text-orange-600" />
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
          Inventory Details
        </h3>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Current Stock</span>
          <span className="font-black text-slate-800">
            {stock} {unit}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Low Stock Alert</span>
          <span className="font-bold text-slate-800">
            {lowStockAlert} {unit}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Unit</span>
          <span className="font-bold text-slate-800">{unit}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Selling Price</span>
          <span className="font-bold text-slate-800">
            PKR {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per {unit}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Total Stock Value</span>
          <span className="font-bold text-slate-800">
            PKR {(isNaN(totalStockValue) ? 0 : totalStockValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Last Stock Added</span>
          <span className="text-slate-700">{lastAdded}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Last Updated</span>
          <span className="text-slate-700">{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsCard;
