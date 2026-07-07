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
},

} as const;
