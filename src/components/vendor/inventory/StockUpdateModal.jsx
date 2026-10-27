import { useMemo } from 'react';
import { XIcon } from '@/icons';
import { useInventoryMovements } from '@/hooks';
import InventoryDetailsCard from './InventoryDetailsCard';
import QuickStockUpdateCard from './QuickStockUpdateCard';
import StockHistoryTable from './StockHistoryTable';

export const StockUpdateModal = ({
  isOpen,
  product,
  onClose,
  onUpdateStock,
  onOpenCsvValidation,
  isSubmitting = false,
}) => {
  if (!isOpen || !product) return null;

  const unitStr = typeof product.unit === 'object' && product.unit !== null ? (product.unit.name || product.unit.symbol || 'unit') : (product.unit || 'unit');
  const catStr = typeof product.category === 'object' && product.category !== null ? (product.category.name || product.category.title || 'General') : (product.category || 'General');
  const nameStr = typeof product.name === 'object' && product.name !== null ? (product.name.name || product.name.title || 'Product') : (product.name || 'Product');
  const statusStr = typeof product.status === 'object' && product.status !== null ? (product.status.name || product.status.title || 'In Stock') : (product.status || 'In Stock');

  const { movements, isLoading: isLoadingMovements } = useInventoryMovements({
    productId: product.id,
    variantId: product.variantId,
  });

  const formattedHistory = useMemo(() => {
    if (!movements || !Array.isArray(movements) || movements.length === 0) return [];
    return movements.map((m) => {
      const isPositive = m.quantity > 0;
      const typeLabel =
        m.type === 'stock_in'
          ? 'Stock In'
          : m.type === 'stock_out'
          ? 'Stock Out'
          : 'Stock Adjustment';

      const unit = m.stockUnit || unitStr || '';
      const dateStr = m.createdAt
        ? new Date(m.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-';

      return {
        id: m.id,
        date: dateStr,
        type: typeLabel,
        quantity: `${isPositive ? '+' : ''}${m.quantity}${unit ? ` ${unit}` : ''}`,
        prevStock: m.previousStock !== null && m.previousStock !== undefined ? `${m.previousStock} ${unit}` : '-',
        newStock: m.newStock !== null && m.newStock !== undefined ? `${m.newStock} ${unit}` : '-',
        notes: m.note || '-',
        addedBy: m.addedBy?.isYou ? 'You' : (m.addedBy?.name || 'System'),
      };
    });
  }, [movements, unitStr]);

  const enrichedProduct = useMemo(() => {
    if (!product) return product;
    let lastAdded = product.lastAdded;
    let lastUpdated = product.lastUpdated;
    if (movements && movements.length > 0) {
      const latest = movements[0];
      if (latest?.createdAt) {
        lastUpdated = new Date(latest.createdAt).toLocaleDateString();
      }
      const latestAdd = movements.find((m) => m.quantity > 0);
      if (latestAdd?.createdAt) {
        lastAdded = new Date(latestAdd.createdAt).toLocaleDateString();
      }
    }
    return {
      ...product,
      lastAdded: lastAdded || product.lastAdded || 'N/A',
      lastUpdated: lastUpdated || product.lastUpdated || 'N/A',
    };
  }, [product, movements]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 sm:p-7 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-150 space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <XIcon size={18} />
        </button>

        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <img
            src={product.image}
            alt={nameStr}
            className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-200/90 shadow-2xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                {nameStr} ({unitStr})
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eaf8ef] text-[#16a34a] border border-[#bbf7d0]">
                {statusStr}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Category: <span className="font-semibold text-slate-600">{catStr}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InventoryDetailsCard product={enrichedProduct} />

          <QuickStockUpdateCard
            product={enrichedProduct}
            onClose={onClose}
            onUpdateStock={onUpdateStock}
            onOpenCsvValidation={onOpenCsvValidation}
            isSubmitting={isSubmitting}
          />
        </div>

        <StockHistoryTable history={formattedHistory} isLoading={isLoadingMovements} />
      </div>
    </div>
  );
};

export default StockUpdateModal;
