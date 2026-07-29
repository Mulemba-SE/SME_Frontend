import { api } from "./client";
import { API } from "./endpoints";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentDetail,
  PaymentListItem,
  PaymentsFilterParams,
  PaymentStats,
  PaymentStatus,
  PaymentMethod,
} from "../types/payment";

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    value === "BANK" ||
    value === "CASH" ||
    value === "M_PESA"
  );
}

function normalizePayment(
  raw: Partial<PaymentListItem> & Record<string, unknown>
): PaymentListItem {
  return {
    id: typeof raw.id === "string" ? raw.id : "",
    paymentNo: raw.paymentNo != null ? Number(raw.paymentNo) : 0,
    customerNo: raw.customerNo != null ? Number(raw.customerNo) : 0,
    invoiceNo: raw.invoiceNo != null ? Number(raw.invoiceNo) : 0,
    amount: raw.amount != null ? Number(raw.amount) : 0,

    paymentMethod: isPaymentMethod(raw.paymentMethod)
      ? raw.paymentMethod
      : "CASH",

    transactionRef:
      typeof raw.transactionRef === "string"
        ? raw.transactionRef
        : "",

    notes:
      typeof raw.notes === "string"
        ? raw.notes
        : undefined,

    paymentAt:
      typeof raw.paymentAt === "string"
        ? raw.paymentAt
        : "",

    status:
      typeof raw.status === "string"
        ? (raw.status as PaymentStatus)
        : "pending",
  };
}

function normalizePaymentDetail(
  raw: Partial<PaymentDetail> & Record<string, unknown>
): PaymentDetail {
  return {
    paymentNo: raw.paymentNo != null ? Number(raw.paymentNo) : 0,
    customerNo: raw.customerNo != null ? Number(raw.customerNo) : 0,

    firstName:
      typeof raw.firstName === "string"
        ? raw.firstName
        : undefined,

    lastName:
      typeof raw.lastName === "string"
        ? raw.lastName
        : undefined,

    email:
      typeof raw.email === "string"
        ? raw.email
        : undefined,

    phoneNumber:
      typeof raw.phoneNumber === "string"
        ? raw.phoneNumber
        : undefined,

    invoiceNo: raw.invoiceNo != null ? Number(raw.invoiceNo) : 0,

    invoiceStatus:
      typeof raw.invoiceStatus === "string"
        ? raw.invoiceStatus
        : "draft",

    invoiceCreatedAt:
      typeof raw.invoiceCreatedAt === "string"
        ? raw.invoiceCreatedAt
        : undefined,

    invoiceDueDate:
      typeof raw.invoiceDueDate === "string"
        ? raw.invoiceDueDate
        : undefined,

    invoiceTotal:
      raw.invoiceTotal != null
        ? Number(raw.invoiceTotal)
        : 0,

    invoiceBalance:
      raw.invoiceBalance != null
        ? Number(raw.invoiceBalance)
        : 0,

    amount:
      raw.amount != null
        ? Number(raw.amount)
        : 0,

    paymentMethod: isPaymentMethod(raw.paymentMethod)
      ? raw.paymentMethod
      : "CASH",

    transactionRef:
      typeof raw.transactionRef === "string"
        ? raw.transactionRef
        : "",

    notes:
      typeof raw.notes === "string"
        ? raw.notes
        : undefined,

    status:
      typeof raw.status === "string"
        ? (raw.status as PaymentStatus)
        : "pending",

    paymentAt:
      typeof raw.paymentAt === "string"
        ? raw.paymentAt
        : "",

    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : undefined,

    confirmedAt:
      typeof raw.confirmedAt === "string"
        ? raw.confirmedAt
        : undefined,

    confirmedByFirstName:
      typeof raw.confirmedByFirstName === "string"
        ? raw.confirmedByFirstName
        : undefined,

    confirmedByLastName:
      typeof raw.confirmedByLastName === "string"
        ? raw.confirmedByLastName
        : undefined,

    failedAt:
      typeof raw.failedAt === "string"
        ? raw.failedAt
        : undefined,

    failedByFirstName:
      typeof raw.failedByFirstName === "string"
        ? raw.failedByFirstName
        : undefined,

    failedByLastName:
      typeof raw.failedByLastName === "string"
        ? raw.failedByLastName
        : undefined,
  };
}

export const paymentsApi = {
list: async (params: PaymentsFilterParams): Promise<PaymentListItem[]> => {
  const apiPage = Math.max(0, (params.page ?? 1) - 1);
  const endpoint = params.mine ? API.PAYMENTS.MINE : API.PAYMENTS.LIST;

  const res = await api.get<Partial<PaymentListItem>[]>(endpoint, {
    params: {
      paymentNo: params.paymentNo || undefined,
      invoiceNo: params.invoiceNo || undefined,
      customerNo: params.customerNo || undefined,
      status: params.status === "all" ? undefined : params.status,
      page: apiPage,
      size: params.limit,
    },
  });

  return (res.data ?? []).map(normalizePayment);
},

  stats: async (params?: { mine?: boolean }): Promise<PaymentStats> => {
    const res = await api.get<PaymentStats>(API.PAYMENTS.STATS, {
      params: { mine: params?.mine || undefined },
    });

    return res.data;
  },

  detail: async (
    paymentNo: number,
    mine?: boolean
  ): Promise<PaymentDetail> => {
    if (mine) {
      const res = await api.get<Partial<PaymentDetail> & Record<string, unknown>>(
        `${API.PAYMENTS.MINE}/${paymentNo}`
      );
      return normalizePaymentDetail(res.data ?? {});
    }

    const res = await api.get<Partial<PaymentDetail> & Record<string, unknown>>(
      API.PAYMENTS.DETAIL,
      {
        params: { paymentNo },
      }
    );

    return normalizePaymentDetail(res.data ?? {});
  },

 create: async (
  input: CreatePaymentRequest
): Promise<CreatePaymentResponse> => {
  const res = await api.post<CreatePaymentResponse>(
    API.PAYMENTS.LIST,
    {
      customerNo: input.customerNo,
      invoiceNo: input.invoiceNo,
      amount: input.amount,
      transaction_ref: input.transaction_ref || undefined,
      payment_method: input.payment_method,
      notes: input.notes || undefined,
    }
  );

  return res.data;
},

  confirm: async (
    paymentNo: number
  ): Promise<PaymentListItem> => {
    const res = await api.patch<
      Partial<PaymentListItem>
    >(`${API.PAYMENTS.LIST}/${paymentNo}/confirm`);

    return normalizePayment(res.data);
  },

  fail: async (
    paymentNo: number
  ): Promise<PaymentListItem> => {
    const res = await api.patch<
      Partial<PaymentListItem>
    >(`${API.PAYMENTS.LIST}/${paymentNo}/fail`);

    return normalizePayment(res.data);
  },
};
