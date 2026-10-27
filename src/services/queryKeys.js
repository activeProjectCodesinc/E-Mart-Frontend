export const QUERY_KEYS = {
  AUTH: {
    USER: ['auth', 'user'],
    PROFILE: ['auth', 'profile'],
  },
  ADMIN: {
    DASHBOARD: (params = {}) => ['admin', 'dashboard', params],
    PRODUCTS: {
      ALL: ['admin', 'products'],
      LIST: (filters = {}) => ['admin', 'products', 'list', filters],
      DETAIL: (id) => ['admin', 'products', 'detail', id],
    },
    ORDERS: {
      ALL: ['admin', 'orders'],
      LIST: (filters = {}) => ['admin', 'orders', 'list', filters],
      DETAIL: (id) => ['admin', 'orders', 'detail', id],
    },
    INVENTORY: {
      ALL: ['admin', 'inventory'],
      LIST: (filters = {}) => ['admin', 'inventory', 'list', filters],
      MOVEMENTS: (variantId) => ['admin', 'inventory', 'movements', variantId],
    },
    STORE: {
      PROFILE: ['admin', 'store', 'management'],
      CUSTOMERS: {
        ALL: ['admin', 'store', 'customers'],
        LIST: (filters = {}) => ['admin', 'store', 'customers', 'list', filters],
        DETAIL: (id) => ['admin', 'store', 'customers', 'detail', id],
      },
      POS: {
        ALL: ['admin', 'store', 'pos'],
        PRODUCTS: (params = {}) => ['admin', 'store', 'pos', 'products', params],
      },
      PROMOTIONS: {
        DEALS: {
          ALL: ['admin', 'store', 'promotions', 'deals'],
          LIST: (params = {}) => ['admin', 'store', 'promotions', 'deals', 'list', params],
          DETAIL: (id) => ['admin', 'store', 'promotions', 'deals', 'detail', id],
        },
        COUPONS: {
          ALL: ['admin', 'store', 'promotions', 'coupons'],
          LIST: (params = {}) => ['admin', 'store', 'promotions', 'coupons', 'list', params],
          DETAIL: (id) => ['admin', 'store', 'promotions', 'coupons', 'detail', id],
        },
        BANNERS: {
          ALL: ['admin', 'store', 'promotions', 'banners'],
          LIST: (params = {}) => ['admin', 'store', 'promotions', 'banners', 'list', params],
          DETAIL: (id) => ['admin', 'store', 'promotions', 'banners', 'detail', id],
        },
      },
      FINANCE: {
        ALL: ['admin', 'store', 'finance'],
        OVERVIEW: (params = {}) => ['admin', 'store', 'finance', 'overview', params],
        PAYOUTS: (params = {}) => ['admin', 'store', 'finance', 'payouts', params],
        PAYOUT_DETAIL: (id) => ['admin', 'store', 'finance', 'payouts', id],
      },
      ANALYTICS: {
        ALL: ['admin', 'store', 'analytics'],
        OVERVIEW: (params = {}) => ['admin', 'store', 'analytics', 'overview', params],
      },
      NOTIFICATIONS: {
        ALL: ['admin', 'store', 'notifications'],
        LIST: (params = {}) => ['admin', 'store', 'notifications', 'list', params],
        UNREAD_COUNT: ['admin', 'store', 'notifications', 'unread-count'],
      },
    },
  },
  CATEGORIES: {
    ALL: ['categories'],
    TREE: ['categories', 'tree'],
    DETAIL: (id) => ['categories', 'detail', id],
  },
  PRODUCTS: {
    ALL: ['products'],
    LIST: (filters = {}) => ['products', 'list', filters],
    DETAIL: (id) => ['products', 'detail', id],
  },
  ORDERS: {
    ALL: ['orders'],
    LIST: (filters = {}) => ['orders', 'list', filters],
    DETAIL: (id) => ['orders', 'detail', id],
  },
  VENDORS: {
    ALL: ['vendors'],
    DETAIL: (id) => ['vendors', 'detail', id],
  },
  CUSTOMERS: {
    ALL: ['customers'],
    LIST: (filters = {}) => ['customers', 'list', filters],
    DETAIL: (id) => ['customers', 'detail', id],
  },
  SETTINGS: {
    COMMISSION: ['settings', 'commission'],
    GENERAL: ['settings', 'general'],
    NOTIFICATIONS: ['settings', 'notifications'],
  },
};

export default QUERY_KEYS;
