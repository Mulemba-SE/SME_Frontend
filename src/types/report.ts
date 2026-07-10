export type ReportGranularity = "DAILY" | "WEEKLY" | "MONTHLY";

export interface ReportsFilterParams {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  granularity?: ReportGranularity;
}

export interface ReportsSummary {
  totalRevenue: number;
  revenueChangePct: number;
  totalPayments: number;
  paymentsChangePct: number;
  totalInvoices: number;
  invoicesChangePct: number;
  outstandingAmount: number;
  outstandingChangePct: number;
}

export interface RevenuePoint {
  bucketDate: string;
  amount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  percentage: number;
}

export interface TopCustomer {
  customerNo: number;
  invoiceCount: number;
  paidAmount: number;
  outstandingAmount: number;
  lastPaymentDate: string | null;
}