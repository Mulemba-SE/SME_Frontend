import axios from "axios";
import { API } from "./endpoints";
import type {
  InvoiceListItem,
  CreateInvoiceRequest,
  InvoiceCreateResponse,
  InvoicesFilterParams,
  InvoiceStats,
} from "../types/invoice";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});


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

export const invoicesApi = {

  list: async (params: InvoicesFilterParams): Promise<InvoiceListItem[]> => {
    const apiPage = Math.max(0, (params.page ?? 1) - 1);

    const queryParams = {
      firstName: params.firstName,
      lastName: params.lastName,
      customerNo: params.customerNo,
      invoiceNo: params.invoiceNo,
      status: params.status === "all" ? undefined : params.status,
      dueDateFrom: params.dueDateFrom,
      dueDateTo: params.dueDateTo,
      page: apiPage,
      size: params.limit,
    };

    const res = await api.get<InvoiceListItem[]>(API.INVOICES.LIST, { params: queryParams });
    return res.data;
  },

  create: async (input: CreateInvoiceRequest): Promise<InvoiceCreateResponse> => {
    const res = await api.post<InvoiceCreateResponse>(API.INVOICES.CREATE, input);
    return res.data;
  },

  
  stats: async (): Promise<InvoiceStats> => {
    const res = await api.get<InvoiceStats>(API.INVOICES.STATS);
    return res.data;
  },

};
