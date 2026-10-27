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
