import { useState, useMemo } from 'react';
import {
  usePosProducts,
  usePlacePosOrder,
  useStoreCustomers,
  useCategories,
  useAdminStoreProfile,
  useDebounce,
} from '@/hooks';
import { INITIAL_CUSTOMERS, POS_CATEGORIES } from '@/mock/admin/adminPos.mock';
import PosProductsSection from '@/components/admin/pos/PosProductsSection';
import PosBillingSection from '@/components/admin/pos/PosBillingSection';
import AddCustomerModal from '@/components/admin/pos/AddCustomerModal';
import { toast } from '@/utils/toast';

const WALK_IN_CUSTOMER = {
  id: 'walk-in',
  name: 'Walk-in Customer',
  phone: '—',
  email: '',
  addressLine: '',
  city: 'Lahore',
  area: '',
};

export const AdminStorePosPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [localCustomers, setLocalCustomers] = useState([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalInitialData, setCustomerModalInitialData] = useState(null);
  const [isHomeDeliveryModal, setIsHomeDeliveryModal] = useState(false);

  // 1. Fetch live POS products from backend
  const {
    products: apiProducts,
    meta,
    isLoading: isLoadingProducts,
  } = usePosProducts({
    q: debouncedSearch.trim() || undefined,
    categoryId: selectedCategoryId || undefined,
    page: currentPage,
    pageSize: 9,
  });

  // 2. Fetch categories for filter dropdown
  const { categories: rawCategories = [] } = useCategories();

  // 3. Fetch store profile for configured delivery fee
  const { store } = useAdminStoreProfile();
  const storeDeliveryFee =
    store?.deliveryFee !== undefined && store?.deliveryFee !== null
      ? Number(store.deliveryFee)
      : 50;

  // 4. Fetch registered customers
  const { customers: apiCustomers = [] } = useStoreCustomers();

  // 5. Mutation for placing POS order
  const { mutate: placeOrder, isPending: isPlacingOrder } = usePlacePosOrder();

  // Format categories list with API categories + fallback
  const categoriesList = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (Array.isArray(rawCategories)) {
      rawCategories.forEach((cat) => {
        if (cat?.name && !seen.has(cat.name.toLowerCase())) {
          seen.add(cat.name.toLowerCase());
          list.push({ id: cat.id || '', name: cat.name });
        }
      });
    }

    POS_CATEGORIES.filter((c) => c !== 'All Categories').forEach((name) => {
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ id: '', name });
      }
    });

    return list;
  }, [rawCategories]);

  // Merge Walk-in Customer + local newly created customers + API customers + mock
  const customersList = useMemo(() => {
    const list = [WALK_IN_CUSTOMER];
    const seen = new Set(['walk-in']);

    localCustomers.forEach((c) => {
      if (c?.id && !seen.has(c.id)) {
        seen.add(c.id);
        list.push(c);
      }
    });

    if (Array.isArray(apiCustomers)) {
      apiCustomers.forEach((c) => {
        if (c?.id && !seen.has(c.id)) {
          seen.add(c.id);
          list.push({
            id: c.id,
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer',
            phone: c.phone || '—',
            email: c.email || '',
            addressLine: c.addressLine || c.address || '',
            city: c.city || 'Lahore',
            area: c.area || '',
          });
        }
      });
    }

    INITIAL_CUSTOMERS.forEach((c) => {
      if (c?.id && !seen.has(c.id)) {
        seen.add(c.id);
        list.push(c);
      }
    });

    return list;
  }, [localCustomers, apiCustomers]);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const targetId = product.variantId || product.id;
      const existing = prev.find((item) => (item.variantId || item.id) === targetId);
      if (existing) {
        return prev.map((item) =>
          (item.variantId || item.id) === targetId
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          variantId: product.variantId || product.id,
          name: product.name,
          unit: product.unit || '1pc',
          price: Number(product.price) || 0,
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
          qty: 1,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const itemId = item.variantId || item.id;
          return itemId === id ? { ...item, qty: item.qty + delta } : item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prev) => prev.filter((item) => (item.variantId || item.id) !== id));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    toast.info('Order cancelled, cart cleared');
  };

  const handleOpenAddCustomerModal = (customerToEdit = null) => {
    setCustomerModalInitialData(customerToEdit);
    setIsHomeDeliveryModal(Boolean(customerToEdit));
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (newOrUpdatedCustomer) => {
    setLocalCustomers((prev) => {
      const index = prev.findIndex((c) => c.id === newOrUpdatedCustomer.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = newOrUpdatedCustomer;
        return next;
      }
      return [newOrUpdatedCustomer, ...prev];
    });
  };

  const handlePlaceOrder = ({
    customer,
    orderType,
    paymentMethod,
    total,
    paid,
  }) => {
    if (cart.length === 0) {
      toast.error('Please add products before placing order');
      return;
    }

    const isHomeDelivery = orderType === 'Home Delivery';

    if (isHomeDelivery && !customer?.addressLine) {
      toast.error('Delivery address is required for Home Delivery orders');
      handleOpenAddCustomerModal(customer);
      return;
    }

    const payload = {
      orderType: isHomeDelivery ? 'home_delivery' : 'take_away',
      customer: {
        name: customer.name || 'Walk-in Customer',
        phone: customer.phone && customer.phone !== '—' ? customer.phone : '+92 300 0000000',
        email: customer.email || '',
        addressLine: customer.addressLine || '',
        city: customer.city || 'Lahore',
        area: customer.area || '',
      },
      items: cart.map((item) => ({
        productId: item.id,
        variantId: item.variantId || item.id,
        name: item.name,
        unit: item.unit,
        price: Number(item.price),
        quantity: Number(item.qty),
      })),
      paymentMethod: paymentMethod.toLowerCase(),
      paidAmount: Number(paid) || Number(total),
      notes: isHomeDelivery ? 'POS Home Delivery Order' : 'POS Counter Take Away',
    };

    placeOrder(payload, {
      onSuccess: (res) => {
        const order = res?.data?.order || res?.data || res?.order;
        const orderNum = order?.orderNumber || 'EM-POS';
        const totalAmount = order?.billing?.total ?? total;
        toast.success(
          `Order #${orderNum} placed successfully! Total: Rs. ${Number(totalAmount).toFixed(2)}`
        );
        setCart([]);
      },
      onError: (err) => {
        const errorMsg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Failed to place POS order. Please check inputs and try again.';
        toast.error(errorMsg);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Point of Sale (POS)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Process counter take away and home delivery orders with real-time stock sync
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Products Grid & Search/Filter */}
        <div className="lg:col-span-7 xl:col-span-7">
          <PosProductsSection
            products={apiProducts}
            categories={categoriesList}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            totalPages={meta?.totalPages || 1}
            onPageChange={setCurrentPage}
            onAddToCart={handleAddToCart}
            isLoading={isLoadingProducts}
          />
        </div>

        {/* Right Column: Billing & Customer Details */}
        <div className="lg:col-span-5 xl:col-span-5">
          <PosBillingSection
            customers={customersList}
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOpenAddCustomer={handleOpenAddCustomerModal}
            onPlaceOrder={handlePlaceOrder}
            isPlacing={isPlacingOrder}
            storeDeliveryFee={storeDeliveryFee}
          />
        </div>
      </div>

      {/* Customer / Delivery Address Modal */}
      <AddCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onAddCustomer={handleSaveCustomer}
        initialData={customerModalInitialData}
        isHomeDelivery={isHomeDeliveryModal}
      />
    </div>
  );
};

export default AdminStorePosPage;
