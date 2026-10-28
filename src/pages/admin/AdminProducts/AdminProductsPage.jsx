import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import {
  PRODUCT_STATS,
  VENDOR_PRODUCTS_SUMMARY,
  getProducts,
} from '@/mock/admin/products.mock';
import ProductStatCards from '@/components/admin/products/ProductStatCards';
import VendorProductsTable from '@/components/admin/products/VendorProductsTable';
import ProductFilterBar from '@/components/admin/products/ProductFilterBar';
import ProductTable from '@/components/admin/products/ProductTable';
import ProductDetailModal from '@/components/admin/products/ProductDetailModal';
import RemoveProductModal from '@/components/admin/products/RemoveProductModal';
import AdminProductsTabs from './components/AdminProductsTabs';
import { SearchIcon } from '@/icons';
import { toast } from '@/utils/toast';
import { useDebounce } from '@/hooks';

export const AdminProductsPage = () => {
  const [activeTab, setActiveTab] = useState('by-vendor');
  const [vendorSearch, setVendorSearch] = useState('');
  const debouncedVendorSearch = useDebounce(vendorSearch, 300);

  const [rawProducts] = useState(() => getProducts());
  const [removedIds, setRemovedIds] = useState(new Set());
  const products = useMemo(() => rawProducts.filter((p) => !removedIds.has(p.id)), [rawProducts, removedIds]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('All Categories');
  const [vendor, setVendor] = useState('All Vendors');
  const [status, setStatus] = useState('All Status');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const filteredVendors = useMemo(() => {
    if (!debouncedVendorSearch.trim()) return VENDOR_PRODUCTS_SUMMARY;
    const q = debouncedVendorSearch.toLowerCase();
    return VENDOR_PRODUCTS_SUMMARY.filter(
      (v) =>
        v.vendorName.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
    );
  }, [debouncedVendorSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (category !== 'All Categories' && p.category !== category) return false;
      if (vendor !== 'All Vendors' && p.vendor !== vendor) return false;
      if (status !== 'All Status' && p.status !== status) return false;

      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesVendor = p.vendor.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesVendor) return false;
      }
      return true;
    });
  }, [products, category, vendor, status, debouncedSearch]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Products Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Add, edit and manage all products. Organize by category, track stock and control visibility.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <ProductStatCards stats={PRODUCT_STATS} />

      {/* Navigation Tabs */}
      <AdminProductsTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        vendorsCount={VENDOR_PRODUCTS_SUMMARY.length}
        allProductsCount="2,480"
      />

      {/* Content based on Active Tab */}
      {activeTab === 'by-vendor' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <SearchIcon
                animateOnHover={false}
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search vendor name or ID..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Click the <span className="font-bold text-orange-600">Eye icon</span> to inspect all products listed by that vendor.
            </p>
          </div>

          <VendorProductsTable vendors={filteredVendors} />
        </div>
      ) : (
        <div className="space-y-4">
          <ProductFilterBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            category={category}
            onCategoryChange={(v) => {
              setCategory(v);
              setCurrentPage(1);
            }}
            vendor={vendor}
            onVendorChange={(v) => {
              setVendor(v);
              setCurrentPage(1);
            }}
            status={status}
            onStatusChange={(v) => {
              setStatus(v);
              setCurrentPage(1);
            }}
          />

          <ProductTable
            products={paginatedProducts}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={products.length}
            onPageChange={setCurrentPage}
            onViewProduct={setSelectedProduct}
            onDeleteProduct={setProductToDelete}
          />
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />

      {/* Delete Product Modal */}
      <RemoveProductModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={(id) => {
          setRemovedIds((prev) => new Set(prev).add(id));
          setProductToDelete(null);
          toast.error(`"${productToDelete?.name}" has been deleted from store.`);
        }}
        product={productToDelete}
      />
    </motion.div>
  );
};

export default AdminProductsPage;
