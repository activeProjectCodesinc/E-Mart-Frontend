import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalBase } from '@/utils/usePortalBase';
import { INITIAL_INVENTORY } from '@/mock/vendor/vendorInventory.mock';
import InventoryHeader from '@/components/vendor/inventory/InventoryHeader';
import InventoryFilterBar from '@/components/vendor/inventory/InventoryFilterBar';
import InventoryTable from '@/components/vendor/inventory/InventoryTable';
import StockUpdateModal from '@/components/vendor/inventory/StockUpdateModal';
import CsvValidationModal from '@/components/vendor/inventory/CsvValidationModal';
import ProductsPagination from '@/components/vendor/products/ProductsPagination';
import { useAdminInventory, useAdjustStock } from '@/hooks';

export const VendorInventoryPage = () => {
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All Products');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStockProduct, setActiveStockProduct] = useState(null);
  const [activeCsvFile, setActiveCsvFile] = useState(null);

  const apiFilters = useMemo(() => {
    const f = { page: currentPage, pageSize: 20 };
    if (stockFilter !== 'All Products') {
      f.status = stockFilter.toLowerCase().replace(/\s+/g, '_');
    }
    if (searchQuery.trim()) f.q = searchQuery.trim();
    return f;
  }, [currentPage, stockFilter, searchQuery]);

  const { inventory: apiInventory, meta, isLoading } = useAdminInventory(apiFilters);
  const { mutate: adjustStock } = useAdjustStock();

  const inventoryItems = useMemo(() => {
    if (apiInventory && Array.isArray(apiInventory) && apiInventory.length > 0) {
      return apiInventory.map((item) => {
        const stockNum = Number(item.stock ?? 0);
        const lowAlert = Number(item.lowStockAlert ?? 10);
        const derivedStatus =
          typeof item.status === 'string'
            ? item.status
            : stockNum === 0
            ? 'Out of Stock'
            : stockNum <= lowAlert
            ? 'Low Stock'
            : 'In Stock';

        // Extract clean strings in case backend returns relation objects { id, name }
        const unitStr =
          typeof item.unit === 'object' && item.unit !== null
            ? (item.unit.name || item.unit.symbol || item.unit.code || '1 unit')
            : (item.unit || '1 unit');

        const categoryStr =
          typeof item.category === 'object' && item.category !== null
            ? (item.category.name || item.category.title || 'General')
            : (item.category || 'General');

        const nameStr =
          typeof item.name === 'object' && item.name !== null
            ? (item.name.name || item.name.title || 'Product')
            : (item.name || 'Product');

        const skuStr =
          typeof item.sku === 'object' && item.sku !== null
            ? (item.sku.code || item.sku.name || 'N/A')
            : (item.sku || item.productCode || 'N/A');

        return {
          ...item,
          id: item.id,
          variantId: item.variantId || item.id,
          name: nameStr,
          sku: skuStr,
          unit: unitStr,
          stock: stockNum,
          lowStockAlert: lowAlert,
          status: derivedStatus,
          image: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100',
          category: categoryStr,
          price: Number(item.price ?? item.sellingPrice ?? item.salePrice ?? 0),
          costPrice: Number(item.costPrice ?? item.cost ?? item.purchasePrice ?? item.price ?? 0),
          lastAdded: item.lastAdded || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'),
          lastUpdated: item.lastUpdated || (item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'),
        };
      });
    }
    if (apiInventory && Array.isArray(apiInventory) && apiInventory.length === 0) {
      return [];
    }
    return INITIAL_INVENTORY;
  }, [apiInventory]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === inventoryItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inventoryItems.map((i) => i.id));
    }
  };

  const handleUpdateStock = ({ productId, change, notes }) => {
    const target = inventoryItems.find((i) => i.id === productId);
    adjustStock({
      variantId: target?.variantId || productId,
      change,
      reason: change >= 0 ? 'restock' : 'damaged',
      notes: notes || undefined,
    });
    setActiveStockProduct(null);
  };

  const handleOpenCsvValidation = (file) => {
    setActiveCsvFile(file || { name: 'inventory_stock_oct_01.csv' });
  };

  return (
    <div className={`space-y-4 sm:space-y-5 transition-opacity ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
      <InventoryHeader />

      <InventoryFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        stockFilter={stockFilter}
        onStockFilterChange={(s) => {
          setStockFilter(s);
          setCurrentPage(1);
        }}
        onOpenCsvModal={() => handleOpenCsvValidation(null)}
      />

      <InventoryTable
        items={inventoryItems}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onAddStock={(prod) => setActiveStockProduct(prod)}
        onEditProduct={(prod) => navigate(getRoute(`/products/edit/${prod.id}`))}
      />

      <ProductsPagination
        currentPage={currentPage}
        totalPages={meta?.pageSize ? Math.ceil((meta.total || 1) / meta.pageSize) : 1}
        totalItems={meta?.total ?? inventoryItems.length}
        itemsPerPage={meta?.pageSize || 20}
        onPageChange={setCurrentPage}
      />

      <StockUpdateModal
        isOpen={Boolean(activeStockProduct)}
        product={activeStockProduct}
        onClose={() => setActiveStockProduct(null)}
        onUpdateStock={handleUpdateStock}
        onOpenCsvValidation={(file) => handleOpenCsvValidation(file)}
      />

      <CsvValidationModal
        isOpen={Boolean(activeCsvFile)}
        file={activeCsvFile}
        onClose={() => setActiveCsvFile(null)}
        onBack={() => setActiveCsvFile(null)}
      />
    </div>
  );
};

export default VendorInventoryPage;
