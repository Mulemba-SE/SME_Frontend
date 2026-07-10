import axios from "axios";
import type {
  ReportsFilterParams,
  ReportsSummary,
  RevenuePoint,
  PaymentMethodBreakdown,
  TopCustomer,
} from "../types/report";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

function normalizeSummary(raw: Partial<ReportsSummary> & Record<string, unknown>): ReportsSummary {
  return {
    totalRevenue: Number(raw.totalRevenue ?? 0),
    revenueChangePct: Number(raw.revenueChangePct ?? 0),
    totalPayments: Number(raw.totalPayments ?? 0),
    paymentsChangePct: Number(raw.paymentsChangePct ?? 0),
    totalInvoices: Number(raw.totalInvoices ?? 0),
    invoicesChangePct: Number(raw.invoicesChangePct ?? 0),
    outstandingAmount: Number(raw.outstandingAmount ?? 0),
    outstandingChangePct: Number(raw.outstandingChangePct ?? 0),
  };
}

export const reportsApi = {
  summary: async (params: ReportsFilterParams): Promise<ReportsSummary> => {
    const res = await api.get<Partial<ReportsSummary>>("/reports/summary", {
      params: { from: params.from, to: params.to },
    });
    return normalizeSummary(res.data ?? {});
  },

  revenue: async (params: ReportsFilterParams): Promise<RevenuePoint[]> => {
    const res = await api.get<RevenuePoint[]>("/reports/revenue", {
      params: {
        from: params.from,
        to: params.to,
        granularity: params.granularity ?? "DAILY",
      },
    });
    return (res.data ?? []).map((p) => ({
      bucketDate: p.bucketDate,
      amount: Number(p.amount),
    }));
  },

  paymentsByMethod: async (params: ReportsFilterParams): Promise<PaymentMethodBreakdown[]> => {
    const res = await api.get<PaymentMethodBreakdown[]>("/reports/payments-by-method", {
      params: { from: params.from, to: params.to },
    });
    return (res.data ?? []).map((p) => ({
      method: p.method,
      amount: Number(p.amount),
      percentage: Number(p.percentage),
    }));
  },

  topCustomers: async (params: ReportsFilterParams, limit = 5): Promise<TopCustomer[]> => {
    const res = await api.get<TopCustomer[]>("/reports/top-customers", {
      params: { from: params.from, to: params.to, limit },
    });
    return (res.data ?? []).map((c) => ({
      customerNo: Number(c.customerNo),
      invoiceCount: Number(c.invoiceCount),
      paidAmount: Number(c.paidAmount),
      outstandingAmount: Number(c.outstandingAmount),
      lastPaymentDate: c.lastPaymentDate ?? null,
    }));
  },
};