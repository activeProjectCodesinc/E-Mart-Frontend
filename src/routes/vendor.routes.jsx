import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

const VendorLayout = lazy(() => import('@/layouts/VendorLayout'));
const VendorOverviewPage = lazy(() => import('@/pages/vendor/VendorOverview/VendorOverviewPage'));
const VendorOrdersPage = lazy(() => import('@/pages/vendor/VendorOrders/VendorOrdersPage'));
const VendorOrderDetailPage = lazy(() => import('@/pages/vendor/VendorOrders/VendorOrderDetailPage'));
const VendorProductsPage = lazy(() => import('@/pages/vendor/VendorProducts/VendorProductsPage'));
const AddEditProductPage = lazy(() => import('@/pages/vendor/VendorProducts/AddEditProductPage'));
const VendorInventoryPage = lazy(() => import('@/pages/vendor/VendorInventory/VendorInventoryPage'));
const VendorFinancePage = lazy(() => import('@/pages/vendor/VendorFinance/VendorFinancePage'));
const VendorPayoutDetailsPage = lazy(() => import('@/pages/vendor/VendorFinance/VendorPayoutDetailsPage'));
const VendorAnalyticsPage = lazy(() => import('@/pages/vendor/VendorAnalytics/VendorAnalyticsPage'));
const VendorStorePage = lazy(() => import('@/pages/vendor/VendorStore/VendorStorePage'));
const VendorNotificationsPage = lazy(() => import('@/pages/vendor/VendorNotifications/VendorNotificationsPage'));
const ProductDeactivatedPage = lazy(() => import('@/pages/vendor/VendorNotifications/ProductDeactivatedPage'));
const ProductRemovedPage = lazy(() => import('@/pages/vendor/VendorNotifications/ProductRemovedPage'));
const VendorSettingsPage = lazy(() => import('@/pages/vendor/VendorSettings/VendorSettingsPage'));
const VendorSupportPage = lazy(() => import('@/pages/vendor/VendorSupport/VendorSupportPage'));
const CreateTicketPage = lazy(() => import('@/pages/vendor/VendorSupport/CreateTicketPage'));
const TicketDetailsPage = lazy(() => import('@/pages/vendor/VendorSupport/TicketDetailsPage'));

export const vendorRoutes = (
  <>
    <Route path="/vendor/login" element={<Navigate to="/admin/login" replace />} />
    <Route path="/vendor/register" element={<Navigate to="/admin/login" replace />} />
    <Route path="/vendor" element={<VendorLayout />}>
      <Route index element={<Navigate to="/vendor/dashboard" replace />} />
      <Route path="dashboard" element={<VendorOverviewPage />} />
      <Route path="orders" element={<VendorOrdersPage />} />
      <Route path="orders/:id" element={<VendorOrderDetailPage />} />
      <Route path="products" element={<VendorProductsPage />} />
      <Route path="products/new" element={<AddEditProductPage />} />
      <Route path="products/edit/:id" element={<AddEditProductPage />} />
      <Route path="inventory" element={<VendorInventoryPage />} />
      <Route path="finance" element={<VendorFinancePage />} />
      <Route path="finance/payouts/:id" element={<VendorPayoutDetailsPage />} />
      <Route path="analytics" element={<VendorAnalyticsPage />} />
      <Route path="store" element={<VendorStorePage />} />
      <Route path="notifications" element={<VendorNotificationsPage />} />
      <Route path="notifications/deactivated/:id" element={<ProductDeactivatedPage />} />
      <Route path="notifications/removed/:id" element={<ProductRemovedPage />} />
      <Route path="settings" element={<VendorSettingsPage />} />
      <Route path="support" element={<VendorSupportPage />} />
      <Route path="support/new" element={<CreateTicketPage />} />
      <Route path="support/create" element={<CreateTicketPage />} />
      <Route path="support/:id" element={<TicketDetailsPage />} />
      <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />
    </Route>
  </>
);

export default vendorRoutes;

