export const API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/me",                  
  },

  CUSTOMERS: {
    LIST: "/customer",
    CREATE: "/customer/register",
    STATS: "/customer/dashboard",
    DETAIL: "/customer",
  },

  INVOICES: {
    LIST: "/invoices",            
    CREATE: "/invoices",
    STATS: "/invoices/dashboard",
    DETAIL: "/invoices/detailed-invoice",
  },

  PAYMENTS: {
  LIST: "/payments",
  STATS: "/payments/dashboard",
  DETAIL: "/payments/detailed-payment",
},

  REPORTS: {
    SUMMARY: "/reports/summary",
    OVERDUE_SUMMARY: "/reports/overdue-summary",
    REVENUE: "/reports/revenue",
    PAYMENTS_BY_METHOD: "/reports/payments-by-method",
    TOP_CUSTOMERS: "/reports/top-customers",
  },

} as const;