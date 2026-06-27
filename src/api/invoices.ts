import axios from "axios";
import { API } from "./endpoints";
import { invoicesMockApi } from "./invoicesMock";
import type {
  Invoice,
  CreateInvoiceRequest,
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceStats,
} from "../types/invoice";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Reuses the same response interceptor shape as api/auth.ts and
// api/customers.ts so getApiErrorMessage / getApiFieldErrors work
// unchanged for invoice calls.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const errorCode = data?.errorCode;
    const fieldErrors = data?.errors as Record<string, string> | undefined;

    if (errorCode === "VALIDATION_ERROR" && fieldErrors) {
      const firstMessage = Object.values(fieldErrors)[0] ?? "Please check the form for errors.";
      const apiError = Object.assign(new Error(firstMessage), {
        errorCode,
        isApiError: true,
        fieldErrors,
      });
      return Promise.reject(apiError);
    }

    const serverMessage = data?.message;
    if (serverMessage) {
      const apiError = Object.assign(new Error(serverMessage), {
        errorCode,
        isApiError: true,
      });
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

const USE_MOCK = import.meta.env.VITE_USE_MOCK_INVOICES === "true";

export const invoicesApi = {
  list: async (params: InvoiceListParams): Promise<InvoiceListResponse> => {
    if (USE_MOCK) return invoicesMockApi.list(params);

    const res = await api.get<InvoiceListResponse>(API.INVOICES.LIST, { params });
    return res.data;
  },

  create: async (input: CreateInvoiceRequest): Promise<Invoice> => {
    if (USE_MOCK) return invoicesMockApi.create(input);

    const res = await api.post<Invoice>(API.INVOICES.CREATE, input);
    return res.data;
  },

  stats: async (): Promise<InvoiceStats> => {
    if (USE_MOCK) return invoicesMockApi.stats();

    const res = await api.get<InvoiceStats>(API.INVOICES.STATS);
    return res.data;
  },
};
