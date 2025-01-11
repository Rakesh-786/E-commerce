export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  PRODUCTS: {
    BASE: '/products',
    FEATURED: '/products?featured=true',
    BY_CATEGORY: (category: string) => `/products?category=${category}`,
    BY_ID: (id: string) => `/products/${id}`,
    SEARCH: (query: string) => `/products?search=${query}`
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile'
  },
  MERCHANTS: {
    BASE: '/merchants',
    BY_ID: (id: string) => `/merchants/${id}`,
    VERIFY: (id: string) => `/merchants/${id}/verify`
  },
  BANNERS: {
    BASE: '/banners',
    BY_POSITION: (position: string) => `/banners?position=${position}`,
    BY_ID: (id: string) => `/banners/${id}`
  },
  UPLOAD: {
    PRODUCT_IMAGES: (productId: string) => `/upload/product/${productId}/images`,
    BANNER: '/upload/banner',
    AVATAR: '/upload/avatar'
  },
  CUSTOMER: {
    PROFILE: '/customer/profile',
    ORDERS: '/customer/orders'
  },
  MERCHANT: {
    PROFILE: '/merchant/profile',
    BUSINESS_INFO: '/merchant/business-info',
    DASHBOARD: '/merchant/dashboard/stats',
    PRODUCTS: '/merchant/products'
  },
  ADMIN: {
    USERS: '/admin/users',
    DASHBOARD: '/admin/dashboard',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    USER_STATUS: (id: string) => `/admin/users/${id}/status`,
    VERIFY_MERCHANT: (id: string) => `/admin/users/${id}/verify-merchant`
  }
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
} as const;
