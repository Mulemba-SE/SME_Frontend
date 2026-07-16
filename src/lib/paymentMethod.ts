import type { PaymentMethod } from "../types/payment";

// Centralizes the enum -> label/color mapping. 
const METHOD_LABELS: Record<PaymentMethod, string> = {
  M_PESA: "M-Pesa",
  BANK: "Bank",
  CASH: "Cash",
};

const METHOD_CHART_COLORS: Record<PaymentMethod, string> = {
  M_PESA: "#2563eb",
  BANK: "#16a34a",
  CASH: "#f28305",
};

export function isKnownPaymentMethod(method: string): method is PaymentMethod {
  return method === "M_PESA" || method === "BANK" || method === "CASH";
}

export function methodLabel(method: string): string {
  return isKnownPaymentMethod(method) ? METHOD_LABELS[method] : method;
}

export function methodChartColor(method: string): string {
  return isKnownPaymentMethod(method) ? METHOD_CHART_COLORS[method] : "#9ca3af";
}
