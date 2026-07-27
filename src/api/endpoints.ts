export const API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    CHANGE_PASSWORD: "/auth/change-password",
    ONE_TIME_LOGIN: "/auth/one-time-login",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/me",
  },

  CUSTOMERS: {
    LIST: "/customer",
    STATS: "/customer/dashboard",
    DETAIL: "/customer",
  },

  INVOICES: {
    LIST: "/invoices",            
    MINE: "/invoices/mine",
    CREATE: "/invoices",
    STATS: "/invoices/dashboard",
    MINE_STATS: "/invoices/mine/dashboard",
    DETAIL: "/invoices/detailed-invoice",
    SEND_CONFIRMATION: "/invoices",
  },

  PAYMENTS: {
    LIST: "/payments",
    MINE: "/payments/mine",
    STATS: "/payments/dashboard",
    DETAIL: "/payments/detailed-payment",
  },

  ADMIN: {
    USERS: "/admin/users",
  },

  REPORTS: {
    SUMMARY: "/reports/summary",
    OVERDUE_SUMMARY: "/reports/overdue-summary",
    REVENUE: "/reports/revenue",
    PAYMENTS_BY_METHOD: "/reports/payments-by-method",
    TOP_CUSTOMERS: "/reports/top-customers",
    EXPORT: "/reports/export",
  },

} as const;