import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import {
  getCategories,
  addCategoryMock,
  updateCategoryMock,
  toggleCategoryStatusMock,
  deleteCategoryMock,
} from '@/mock/admin/categories.mock';
import CategoryStatCards from '@/components/admin/categories/CategoryStatCards';
import CategoryFilterBar from '@/components/admin/categories/CategoryFilterBar';
import CategoryTable from '@/components/admin/categories/CategoryTable';
import CategoryModal from '@/components/admin/categories/CategoryModal';
import DeleteCategoryModal from '@/components/admin/categories/DeleteCategoryModal';
import { PlusIcon } from '@/icons';
import { toast } from '@/utils/toast';
import { useDebounce } from '@/hooks';

export const AdminCategoriesPage = () => {
  const [categoriesList, setCategoriesList] = useState(() => getCategories());
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const stats = useMemo(() => {
    const total = categoriesList.length;
    const active = categoriesList.filter((c) => c.status === 'Active').length;
    const inactive = total - active;
    const totalProducts = categoriesList.reduce((acc, c) => acc + (c.productsCount || 0), 0);
    return { total, active, inactive, totalProducts };
  }, [categoriesList]);

  const filteredCategories = useMemo(() => {
    return categoriesList.filter((cat) => {
      if (statusFilter !== 'All' && cat.status !== statusFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        return cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [categoriesList, statusFilter, debouncedSearch]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  const handleToggleStatus = (id) => {
    const updated = toggleCategoryStatusMock(id);
    setCategoriesList((prev) => prev.map((c) => (c.id === id ? { ...updated } : c)));
    toast.success(`Category "${updated.name}" is now ${updated.status}.`);
  };

  const handleSubmitCategory = (payload) => {
    if (editingCategory) {
      const updated = updateCategoryMock(editingCategory.id, payload);
      setCategoriesList((prev) => prev.map((c) => (c.id === editingCategory.id ? { ...updated } : c)));
      toast.success(`Category "${updated.name}" updated successfully.`);
    } else {
      const created = addCategoryMock(payload);
      setCategoriesList((prev) => [created, ...prev]);
      toast.success(`Category "${created.name}" created successfully.`);
    }
  };

  const handleConfirmDelete = (id) => {
    const target = deleteCategoryMock(id);
    setCategoriesList((prev) => prev.filter((c) => c.id !== id));
    setCategoryToDelete(null);
    toast.error(`Category "${target?.name || ''}" deleted.`);
  };

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize categories, manage products and control visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
        >
          <PlusIcon animateOnHover={false} size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* KPI Stats */}
      <CategoryStatCards stats={stats} />

      {/* Filter and Search Bar */}
      <CategoryFilterBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        totalCategories={filteredCategories.length}
      />

      {/* Main Categories Table */}
      <CategoryTable
        categories={paginatedCategories}
        onToggleStatus={handleToggleStatus}
        onEdit={(cat) => {
          setEditingCategory(cat);
          setIsModalOpen(true);
        }}
        onDelete={(cat) => setCategoryToDelete(cat)}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredCategories.length}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmitCategory}
        categoryToEdit={editingCategory}
      />

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        category={categoryToDelete}
      />
    </motion.div>
  );
};

export default AdminCategoriesPage;
