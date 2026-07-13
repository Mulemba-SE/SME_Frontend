import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";
import type { ReportsFilterParams } from "../types/report";

const REPORTS_KEY = "reports";

export function useReportsSummary(params: ReportsFilterParams) {
  return useQuery({
    queryKey: [REPORTS_KEY, "summary", params],
    queryFn: () => reportsApi.summary(params),
    placeholderData: (previous) => previous,
  });
}

export function useRevenueChart(params: ReportsFilterParams) {
  return useQuery({
    queryKey: [REPORTS_KEY, "revenue", params],
    queryFn: () => reportsApi.revenue(params),
    placeholderData: (previous) => previous,
  });
}

export function usePaymentsByMethod(params: ReportsFilterParams) {
  return useQuery({
    queryKey: [REPORTS_KEY, "payments-by-method", params],
    queryFn: () => reportsApi.paymentsByMethod(params),
    placeholderData: (previous) => previous,
  });
}

export function useTopCustomers(params: ReportsFilterParams, limit = 5) {
  return useQuery({
    queryKey: [REPORTS_KEY, "top-customers", params, limit],
    queryFn: () => reportsApi.topCustomers(params, limit),
    placeholderData: (previous) => previous,
  });
}

export function useOverdueSummary() {
  return useQuery({
    queryKey: [REPORTS_KEY, "overdue-summary"],
    queryFn: () => reportsApi.overdueSummary(),
  });
}