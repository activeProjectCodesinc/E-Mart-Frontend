import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { vendorRoutes } from './vendor.routes';
import { adminRoutes } from './admin.routes';
import Toaster from '@/components/common/Toaster';
import { useAuthInit } from '@/hooks/useAuthInit';

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const AppRoutes = () => {
  const { isInitializing } = useAuthInit();

  if (isInitializing) {
    return <RouteLoader />;
  }

  return (
    <BrowserRouter>
      <Toaster />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          {vendorRoutes}
          {adminRoutes}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
