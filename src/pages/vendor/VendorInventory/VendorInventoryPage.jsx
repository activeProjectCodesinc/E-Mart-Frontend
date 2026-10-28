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
import {
  useAdminInventory,
  useAdjustStock,
  useCommitInventoryImport,
  useDebounce,
} from '@/hooks';

export const VendorInventoryPage = () => {
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
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
    if (debouncedSearchQuery.trim()) f.q = debouncedSearchQuery.trim();
    return f;
  }, [currentPage, stockFilter, debouncedSearchQuery]);

  const { inventory: apiInventory, meta, isLoading } = useAdminInventory(apiFilters);
  const { mutate: adjustStock, isPending: isAdjusting } = useAdjustStock();
  const { mutate: commitImport, isPending: isCommittingImport } = useCommitInventoryImport();

  const inventoryItems = useMemo(() => {
    if (apiInventory && Array.isArray(apiInventory) && apiInventory.length > 0) {
      return apiInventory.map((item) => {
        const stockNum = Number(item.stock ?? 0);
        const lowAlert = Number(item.lowStockAlert ?? 10);

        // Derive stock availability status for inventory (In Stock, Low Stock, Out of Stock)
        let stockAvailability = 'In Stock';
        if (
          item.stockStatus === 'out_of_stock' ||
          item.status === 'Out of Stock' ||
          stockNum === 0
        ) {
          stockAvailability = 'Out of Stock';
        } else if (
          item.stockStatus === 'low_stock' ||
          item.status === 'Low Stock' ||
          stockNum <= lowAlert
        ) {
          stockAvailability = 'Low Stock';
        } else {
          stockAvailability = 'In Stock';
        }

        // Extract clean strings in case backend returns relation objects { id, name }
        const unitStr =
          typeof item.unit === 'object' && item.unit !== null
            ? (item.unit.name || item.unit.symbol || item.unit.code || '1 unit')
            : (typeof item.unit === 'string' ? item.unit : '1 unit');

        const categoryStr =
          typeof item.category === 'object' && item.category !== null
            ? (item.category.name || item.category.title || 'General')
            : (typeof item.category === 'string' ? item.category : 'General');

        const nameStr =
          typeof item.name === 'object' && item.name !== null
            ? (item.name.name || item.name.title || 'Product')
            : (typeof item.name === 'string' ? item.name : 'Product');

        const skuStr =
          typeof item.sku === 'object' && item.sku !== null
            ? (item.sku.code || item.sku.name || 'N/A')
            : (typeof item.sku === 'string' ? item.sku : (item.productCode || 'N/A'));

        const lastAddedStr =
          typeof item.lastAdded === 'string'
            ? item.lastAdded
            : item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : 'N/A';

        const lastUpdatedStr =
          typeof item.lastUpdated === 'string'
            ? item.lastUpdated
            : item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString()
            : 'N/A';

        return {
          ...item,
          id: item.id,
          variantId: item.variantId || item.id,
          name: nameStr,
          sku: skuStr,
          unit: unitStr,
          stock: stockNum,
          lowStockAlert: lowAlert,
          status: stockAvailability,
          stockStatus: stockAvailability,
          productStatus: item.status || 'Active',
          image:
            (Array.isArray(item.images) && (item.images.find((img) => img.isMain)?.url || item.images[0]?.url)) ||
            item.imageUrl ||
            item.image ||
            'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100',
          category: categoryStr,
          price: Number(item.price ?? item.sellingPrice ?? item.salePrice ?? 0),
          costPrice: Number(item.costPrice ?? item.cost ?? item.purchasePrice ?? item.price ?? 0),
          lastAdded: lastAddedStr,
          lastUpdated: lastUpdatedStr,
        };
      });
    }
    if (apiInventory && Array.isArray(apiInventory) && apiInventory.length === 0) {
      return [];
    }
    return INITIAL_INVENTORY;
  }, [apiInventory]);

  const activeProduct = useMemo(() => {
    if (!activeStockProduct) return null;
    return inventoryItems.find((i) => i.id === activeStockProduct.id) || activeStockProduct;
  }, [activeStockProduct, inventoryItems]);

  const displayedItems = useMemo(() => {
    if (!stockFilter || stockFilter === 'All Products') return inventoryItems;
    return inventoryItems.filter(
      (item) => item.status?.toLowerCase() === stockFilter.toLowerCase()
    );
  }, [inventoryItems, stockFilter]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === displayedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedItems.map((i) => i.id));
    }
  };

  const handleUpdateStock = ({ productId, variantId, type, quantity, note, change, notes }) => {
    const target = inventoryItems.find((i) => i.id === productId);
    const resolvedVariantId = variantId || target?.variantId || productId;
    const resolvedType = type || (change >= 0 ? 'add' : 'reduce');
    const resolvedQuantity = quantity || (change !== undefined ? Math.abs(change) : 0);
    const resolvedNote = note || notes || undefined;

    adjustStock(
      {
        variantId: resolvedVariantId,
        productId,
        type: resolvedType,
        quantity: resolvedQuantity,
        note: resolvedNote,
      },
      {
        onSuccess: () => {
          setActiveStockProduct(null);
        },
      }
    );
  };

  const handleOpenCsvValidation = (file) => {
    setActiveCsvFile(file || { name: 'inventory_stock_oct_01.csv' });
  };

  const handleImportValidRows = (validRows) => {
    if (!validRows || validRows.length === 0) return;

    const items = validRows.map((r) => ({
      productId: r.productId,
      variantId: r.variantId,
      sku: r.sku,
      quantity: r.quantity,
      type: 'add',
      note: r.notes || 'CSV Bulk Import',
    }));

    commitImport(
      { items },
      {
        onSuccess: () => {
          setActiveCsvFile(null);
        },
        onError: () => {
          setActiveCsvFile(null);
        },
      }
    );
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
        onOpenCsvModal={(file) => handleOpenCsvValidation(file)}
      />

      <InventoryTable
        items={displayedItems}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onAddStock={(prod) => setActiveStockProduct(prod)}
        onEditProduct={(prod) => navigate(getRoute(`/products/edit/${prod.id}`))}
      />

      <ProductsPagination
        currentPage={currentPage}
        totalPages={meta?.pageSize ? Math.ceil((meta.total || 1) / meta.pageSize) : Math.max(1, Math.ceil(displayedItems.length / 20))}
        totalItems={meta?.total ?? displayedItems.length}
        itemsPerPage={meta?.pageSize || 20}
        onPageChange={setCurrentPage}
      />

      <StockUpdateModal
        isOpen={Boolean(activeProduct)}
        product={activeProduct}
        onClose={() => setActiveStockProduct(null)}
        onUpdateStock={handleUpdateStock}
        onOpenCsvValidation={(file) => handleOpenCsvValidation(file)}
        isSubmitting={isAdjusting}
      />

      <CsvValidationModal
        isOpen={Boolean(activeCsvFile)}
        file={activeCsvFile}
        inventoryItems={inventoryItems}
        isCommitting={isCommittingImport}
        onClose={() => setActiveCsvFile(null)}
        onBack={() => setActiveCsvFile(null)}
        onImportSuccess={handleImportValidRows}
      />
    </div>
  );
};

export default VendorInventoryPage;
