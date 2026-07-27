import { api } from "./client";
import { API } from "./endpoints";
import type {
  ReportsFilterParams,
  ReportsSummary,
  RevenuePoint,
  PaymentMethodBreakdown,
  TopCustomer,
  OverdueSummary,
} from "../types/report";

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
    const res = await api.get<Partial<ReportsSummary>>(API.REPORTS.SUMMARY, {
      params: { from: params.from, to: params.to },
    });
    return normalizeSummary(res.data ?? {});
  },

  overdueSummary: async (): Promise<OverdueSummary> => {
    const res = await api.get<OverdueSummary>(API.REPORTS.OVERDUE_SUMMARY);
    return {
      overdueAmount: Number(res.data?.overdueAmount ?? 0),
    };
  },

  revenue: async (params: ReportsFilterParams): Promise<RevenuePoint[]> => {
    const res = await api.get<RevenuePoint[]>(API.REPORTS.REVENUE, {
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
    const res = await api.get<PaymentMethodBreakdown[]>(API.REPORTS.PAYMENTS_BY_METHOD, {
      params: { from: params.from, to: params.to },
    });
    return (res.data ?? []).map((p) => ({
      method: p.method,
      amount: Number(p.amount),
      percentage: Number(p.percentage),
    }));
  },

  topCustomers: async (params: ReportsFilterParams, limit = 5): Promise<TopCustomer[]> => {
    const res = await api.get<TopCustomer[]>(API.REPORTS.TOP_CUSTOMERS, {
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

  exportReport: async (params: ReportsFilterParams): Promise<void> => {
    const res = await api.get<Blob>(API.REPORTS.EXPORT, {
      params: {
        from: params.from,
        to: params.to,
        granularity: params.granularity ?? "DAILY",
      },
      responseType: "blob",
    });

    const disposition = res.headers["content-disposition"] as string | undefined;
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] ?? `ImaraBill_Report_${params.from}_to_${params.to}.pdf`;

    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};