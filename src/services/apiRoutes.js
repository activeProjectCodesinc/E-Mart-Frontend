export const apiRoutes = {
  auth: {
    login: '/auth/login',
    adminLogin: '/auth/admin/login',
    refresh: '/auth/refresh',
    adminRefresh: '/auth/admin/refresh',
    adminVerify2fa: '/auth/admin/2fa/verify',
    admin2faStatus: '/auth/admin/2fa/status',
    admin2faSetup: '/auth/admin/2fa/setup',
    admin2faEnable: '/auth/admin/2fa/enable',
    admin2faDisable: '/auth/admin/2fa/disable',
    changePassword: '/auth/password/change',
    logout: '/auth/logout',
  },
  user: {
    me: '/me',
    updateProfile: '/me',
    notificationPreferences: '/me/notification-preferences',
  },
  admin: {
    dashboard: '/admin/dashboard',
    storeDashboard: '/admin/store/dashboard',
    products: {
      base: '/admin/products',
      detail: (id) => `/admin/products/${id}`,
      status: (id) => `/admin/products/${id}/status`,
      images: (id) => `/admin/products/${id}/images`,
      deleteImage: (id, imageId) => `/admin/products/${id}/images/${imageId}`,
      export: '/admin/products/export',
    },
    orders: {
      base: '/admin/orders',
      detail: (id) => `/admin/orders/${id}`,
      status: (id) => `/admin/orders/${id}/status`,
      cancel: (id) => `/admin/orders/${id}/cancel`,
    },
    inventory: {
      base: '/admin/inventory',
      adjust: '/admin/inventory/adjust',
      movements: '/admin/inventory/movements',
      importPreview: '/admin/inventory/import/preview',
      importCommit: '/admin/inventory/import/commit',
    },
    store: {
      management: '/admin/store/management',
      customers: {
        base: '/admin/store/customers',
        export: '/admin/store/customers/export',
        detail: (id) => `/admin/store/customers/${id}`,
        notes: (id) => `/admin/store/customers/${id}/notes`,
        deleteNote: (id, noteId) => `/admin/store/customers/${id}/notes/${noteId}`,
      },
      promotions: {
        deals: {
          base: '/admin/store/promotions/deals',
          detail: (id) => `/admin/store/promotions/deals/${id}`,
          publish: (id) => `/admin/store/promotions/deals/${id}/publish`,
        },
        coupons: {
          base: '/admin/store/promotions/coupons',
          detail: (id) => `/admin/store/promotions/coupons/${id}`,
          toggle: (id) => `/admin/store/promotions/coupons/${id}/toggle`,
        },
        banners: {
          base: '/admin/store/promotions/banners',
          detail: (id) => `/admin/store/promotions/banners/${id}`,
          toggle: (id) => `/admin/store/promotions/banners/${id}/toggle`,
          upload: '/files/upload?purpose=banner',
        },
      },
      pos: {
        products: '/admin/store/pos/products',
        order: '/admin/store/pos/order',
      },
    },
    customers: {
      base: '/admin/customers',
      detail: (id) => `/admin/customers/${id}`,
    },
    settings: '/admin/settings',
    supportContact: '/admin/settings/support',
  },
  categories: {
    tree: '/categories',
    detail: (id) => `/categories/${id}`,
  },
  files: {
    upload: '/files/upload',
  },
  store: {
    settings: '/vendor/store',
    updateSettings: '/vendor/store',
    logo: '/vendor/store/logo',
    banner: '/vendor/store/banner',
  },
};

export default apiRoutes;
