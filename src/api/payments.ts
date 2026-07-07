import axios from "axios";
import { API } from "./endpoints";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentListItem,
  PaymentsFilterParams,
  PaymentStats,
  PaymentStatus,
} from "../types/payment";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

function normalizePayment(raw: Partial<PaymentListItem> & Record<string, unknown>): PaymentListItem {
  return {
    id: typeof raw.id === "string" ? raw.id : "",
    customerNo: raw.customerNo != null ? Number(raw.customerNo) : 0,
    invoiceNo: raw.invoiceNo != null ? Number(raw.invoiceNo) : 0,
    amount: raw.amount != null ? Number(raw.amount) : 0,
    paymentMethod: typeof raw.paymentMethod === "string" ? raw.paymentMethod : "",
    transactionRef: typeof raw.transactionRef === "string" ? raw.transactionRef : "",
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    paymentAt: typeof raw.paymentAt === "string" ? raw.paymentAt : "",
    status: typeof raw.status === "string" ? (raw.status as PaymentStatus) : "pending",
  };
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const errorCode = data?.errorCode;
    const fieldErrors = data?.errors as Record<string, string> | undefined;

    if (errorCode === "VALIDATION_ERROR" && fieldErrors) {
      const firstMessage = Object.values(fieldErrors)[0] ?? "Please check the form for errors.";
      return Promise.reject(Object.assign(new Error(firstMessage), { errorCode, isApiError: true, fieldErrors }));
    }

    const serverMessage = data?.message;
    if (serverMessage) {
      return Promise.reject(Object.assign(new Error(serverMessage), { errorCode, isApiError: true }));
    }

    return Promise.reject(error);
  }
);

export const paymentsApi = {
  list: async (params: PaymentsFilterParams): Promise<PaymentListItem[]> => {
    const apiPage = Math.max(0, (params.page ?? 1) - 1);
    const res = await api.get<Partial<PaymentListItem>[]>(API.PAYMENTS.LIST, {
      params: {
        search: params.search || undefined,
        status: params.status === "all" ? undefined : params.status,
        page: apiPage,
        size: params.limit,
      },
    });
    return (res.data ?? []).map(normalizePayment);
  },

  stats: async (): Promise<PaymentStats> => {
    const res = await api.get<PaymentStats>(API.PAYMENTS.STATS);
    return res.data;
  },

  create: async (input: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const res = await api.post<CreatePaymentResponse>(API.PAYMENTS.LIST, null, {
      params: {
        customerNo: input.customerNo,
        invoiceNo: input.invoiceNo,
        amount: input.amount,
        transaction_ref: input.transaction_ref || undefined,
        payment_method: input.payment_method,
        notes: input.notes || undefined,
      },
    });
    return res.data;
  },

  confirm: async (id: string): Promise<PaymentListItem> => {
    const res = await api.patch<Partial<PaymentListItem>>(`${API.PAYMENTS.LIST}/${id}/confirm`);
    return normalizePayment(res.data);
  },

  fail: async (id: string): Promise<PaymentListItem> => {
    const res = await api.patch<Partial<PaymentListItem>>(`${API.PAYMENTS.LIST}/${id}/fail`);
    return normalizePayment(res.data);
  },
};