import { configureStore } from '@reduxjs/toolkit';
import vendorRegisterReducer from '@/features/vendor/vendorRegisterSlice';
import adminVendorReducer from '@/features/admin/adminVendorSlice';

export const store = configureStore({
  reducer: {
    vendorRegister: vendorRegisterReducer,
    adminVendors: adminVendorReducer,
  },
});




