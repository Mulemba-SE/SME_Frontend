export type PaymentStatus = "pending" | "confirmed" | "failed";

export interface PaymentListItem {
  id: string;
  customerNo: number;
  invoiceNo: number;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  notes?: string | null;
  paymentAt: string;
  status: PaymentStatus;
}

export interface PaymentsFilterParams {
  search?: string;
  status?: PaymentStatus | "all";
  page?: number;
  limit?: number;
}

export interface PaymentStats {
  pendingCount: number;
  pendingAmount: number;
  confirmedCount: number;
  confirmedAmount: number;
  failedCount: number;
  failedAmount: number;
}

export type PaymentMethod = "BANK" | "CASH" | "M_PESA";

export interface CreatePaymentRequest {
  customerNo: number;
  invoiceNo: number;
  amount: number;
  transaction_ref?: string;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface CreatePaymentResponse {
  id: string;
  customerNo: number;
  invoiceNo: number;
  amount: number;
  transactionRef: string;
  paymentMethod: string;
  notes?: string | null;
  status: PaymentStatus;
  paymentAt: string;
}
