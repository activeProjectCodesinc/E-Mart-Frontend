import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_PRODUCTS } from '@/mock/vendor/vendorProducts.mock';
import ProductsHeader from '@/components/vendor/products/ProductsHeader';
import ProductsFilterBar from '@/components/vendor/products/ProductsFilterBar';
import ProductsTable from '@/components/vendor/products/ProductsTable';
import ProductsPagination from '@/components/vendor/products/ProductsPagination';
import UpdateProductStatusModal from '@/components/vendor/products/UpdateProductStatusModal';
import { useAdminProducts, useUpdateProductStatus, useDeleteProduct } from '@/hooks';
import { usePortalBase } from '@/utils/usePortalBase';

export const VendorProductsPage = () => {
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusModal, setStatusModal] = useState({ isOpen: false, product: null });

  const apiFilters = useMemo(() => {
    const f = { page: currentPage, pageSize: 20 };
    if (activeTab !== 'all') f.status = activeTab.replace('-', '_');
    if (searchQuery.trim()) f.q = searchQuery.trim();
    return f;
  }, [currentPage, activeTab, searchQuery]);

  const { products: apiProducts, meta, counts: apiCounts, isLoading } = useAdminProducts(apiFilters);
  const { mutate: updateStatus } = useUpdateProductStatus();
  const { mutate: deleteProduct } = useDeleteProduct();

  const productsList = useMemo(() => {
    if (apiProducts && Array.isArray(apiProducts)) {
      return apiProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: typeof p.category === 'object' ? p.category?.name : (p.category || 'General'),
        price: Number(p.price || 0),
        stock: p.stock ?? 0,
        status: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('_', ' ') : 'Active',
        image: p.imageUrl || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100',
        productCode: p.productCode,
        sku: p.sku,
      }));
    }
    return INITIAL_PRODUCTS;
  }, [apiProducts]);

  const counts = useMemo(
    () => ({
      all: apiCounts?.all ?? 130,
      active: apiCounts?.active ?? 98,
      inactive: apiCounts?.inactive ?? 12,
      lowStock: apiCounts?.lowStock ?? 6,
      outOfStock: apiCounts?.outOfStock ?? 4,
    }),
    [apiCounts]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All Categories') return productsList;
    return productsList.filter((p) => p.category === selectedCategory);
  }, [productsList, selectedCategory]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleOpenStatusModal = (product) => {
    setStatusModal({ isOpen: true, product });
  };

  const handleConfirmStatusUpdate = ({ productId, newStatus, reason }) => {
    updateStatus({
      id: productId,
      status: newStatus.toLowerCase().replace(' ', '_'),
      reason,
    });
    setStatusModal({ isOpen: false, product: null });
  };

  const handleEditProduct = (product) => {
    navigate(getRoute(`/products/edit/${product.id}`));
  };

  const handleDeleteProduct = (productId) => {
    deleteProduct(productId);
  };

  return (
    <div className={`space-y-4 sm:space-y-5 transition-opacity ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
      <ProductsHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        counts={counts}
        onAddProduct={() => navigate(getRoute('/products/new'))}
      />

      <ProductsFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(c) => {
          setSelectedCategory(c);
          setCurrentPage(1);
        }}
        onExport={() => window.open('/api/v1/admin/products/export', '_blank')}
        onImport={() => navigate(getRoute('/inventory'))}
      />

      <ProductsTable
        products={filteredProducts}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenStatusModal={handleOpenStatusModal}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      <ProductsPagination
        currentPage={currentPage}
        totalPages={meta?.pageSize ? Math.ceil((meta.total || 1) / meta.pageSize) : 1}
        totalItems={meta?.total ?? filteredProducts.length}
        itemsPerPage={meta?.pageSize || 20}
        onPageChange={setCurrentPage}
      />

      <UpdateProductStatusModal
        isOpen={statusModal.isOpen}
        product={statusModal.product}
        onClose={() => setStatusModal({ isOpen: false, product: null })}
        onConfirm={handleConfirmStatusUpdate}
      />
    </div>
  );
};

export default VendorProductsPage;
