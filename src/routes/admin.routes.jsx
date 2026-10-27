import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { adminStoreRoutes } from './store.routes';

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLogin/AdminLoginPage'));
const AdminTwoFactorPage = lazy(() => import('@/pages/admin/AdminTwoFactor/AdminTwoFactorPage'));
const AdminResetPasswordPage = lazy(() => import('@/pages/admin/AdminResetPassword/AdminResetPasswordPage'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverview/AdminOverviewPage'));
const AdminVendorsPage = lazy(() => import('@/pages/admin/AdminVendors/AdminVendorsPage'));
const AdminVendorDetailPage = lazy(() => import('@/pages/admin/AdminVendors/AdminVendorDetailPage'));
const AdminRidersPage = lazy(() => import('@/pages/admin/AdminRiders/AdminRidersPage'));
const AdminRiderDetailPage = lazy(() => import('@/pages/admin/AdminRiders/AdminRiderDetailPage'));
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomers/AdminCustomersPage'));
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomers/AdminCustomerDetailPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrders/AdminOrdersPage'));
const AdminVendorOrdersPage = lazy(() => import('@/pages/admin/AdminOrders/AdminVendorOrdersPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProducts/AdminProductsPage'));
const AdminVendorProductsPage = lazy(() => import('@/pages/admin/AdminProducts/AdminVendorProductsPage'));
const AdminProductDetailPage = lazy(() => import('@/pages/admin/AdminProducts/AdminProductDetailPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategories/AdminCategoriesPage'));
const AdminPayoutsPage = lazy(() => import('@/pages/admin/AdminPayouts/AdminPayoutsPage'));
const AdminPayoutDetailPage = lazy(() => import('@/pages/admin/AdminPayouts/AdminPayoutDetailPage'));
const AdminNotificationsPage = lazy(() => import('@/pages/admin/AdminNotifications/AdminNotificationsPage'));
const AdminPromotionsPage = lazy(() => import('@/pages/admin/AdminPromotions/AdminPromotionsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettings/AdminSettingsPage'));

export const adminRoutes = (
  <>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/admin/2fa" element={<AdminTwoFactorPage />} />
    <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="/admin/store/dashboard" replace />} />
      <Route path="dashboard" element={<AdminOverviewPage />} />
      <Route path="vendors" element={<AdminVendorsPage />} />
      <Route path="vendors/:id" element={<AdminVendorDetailPage />} />
      <Route path="riders" element={<AdminRidersPage />} />
      <Route path="riders/:id" element={<AdminRiderDetailPage />} />
      <Route path="customers" element={<AdminCustomersPage />} />
      <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="orders/vendor/:vendorId" element={<AdminVendorOrdersPage />} />
      <Route path="products" element={<AdminProductsPage />} />
      <Route path="products/vendor/:vendorId" element={<AdminVendorProductsPage />} />
      <Route path="products/:id" element={<AdminProductDetailPage />} />
      <Route path="categories" element={<AdminCategoriesPage />} />
      <Route path="payouts" element={<AdminPayoutsPage />} />
      <Route path="payouts/:id" element={<AdminPayoutDetailPage />} />
      <Route path="promotions" element={<Navigate to="/admin/store/promotions" replace />} />
      <Route path="notifications" element={<AdminNotificationsPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
      {adminStoreRoutes}

      <Route path="*" element={<Navigate to="/admin/store/dashboard" replace />} />
    </Route>
  </>
);


export default adminRoutes;
