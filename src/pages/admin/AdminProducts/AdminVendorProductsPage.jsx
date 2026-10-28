import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import { getVendorProductSummaryById, getProductsByVendorId } from '@/mock/admin/products.mock';
import ProductDetailModal from '@/components/admin/products/ProductDetailModal';
import RemoveProductModal from '@/components/admin/products/RemoveProductModal';
import ProductPagination from '@/components/admin/products/ProductPagination';
import OrderActionButton from '@/components/admin/orders/OrderActionButton';
import VendorProductHeaderCard from './components/VendorProductHeaderCard';
import VendorProductListRow from './components/VendorProductListRow';
import { ArrowLeftIcon, SearchIcon } from '@/icons';
import { toast } from '@/utils/toast';
import { useDebounce } from '@/hooks';

export const AdminVendorProductsPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const vendor = useMemo(() => getVendorProductSummaryById(vendorId), [vendorId]);
  const rawProducts = useMemo(() => getProductsByVendorId(vendorId), [vendorId]);
  const [removedIds, setRemovedIds] = useState(new Set());
  const allProducts = useMemo(() => rawProducts.filter((p) => !removedIds.has(p.id)), [rawProducts, removedIds]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allProducts, statusFilter, debouncedSearch]);

  const totalCount = filteredProducts.length;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.has(p.id));

  const handleToggleSelectAll = () => {
    setSelectedIds(isAllSelected ? new Set() : new Set(paginatedProducts.map((p) => p.id)));
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleConfirmDelete = (productId) => {
    setRemovedIds((prev) => new Set(prev).add(productId));
    setProductToDelete(null);
    toast.error(`"${productToDelete?.name}" has been deleted from store.`);
  };

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <OrderActionButton
            icon={ArrowLeftIcon}
            title="Back to Products"
            onClick={() => navigate('/admin/products')}
            iconSize={16}
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-orange-600 shadow-2xs"
          />
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Link to="/admin/products" className="hover:text-orange-600 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-slate-400">Vendor Products</span>
            <span>/</span>
            <span className="font-bold text-slate-800">{vendor.vendorName}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          View All Vendors
        </button>
      </div>

      {/* Vendor Profile Header Card */}
      <VendorProductHeaderCard vendor={vendor} />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <SearchIcon animateOnHover={false} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3.5 py-2 text-xs sm:text-sm font-medium bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                </th>
                {['#', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Reports'].map((h) => (
                  <th key={h} className="py-3.5 px-3 font-semibold">{h}</th>
                ))}
                <th className="py-3.5 px-3 pr-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No products found for this vendor.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <VendorProductListRow
                    key={product.id}
                    product={product}
                    isSelected={selectedIds.has(product.id)}
                    onToggleSelect={handleToggleSelect}
                    onViewProduct={setSelectedProduct}
                    onDeleteProduct={setProductToDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <ProductPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={setCurrentPage}
        />
      </div>

      <ProductDetailModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
      <RemoveProductModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />
    </motion.div>
  );
};

export default AdminVendorProductsPage;
