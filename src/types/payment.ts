export type PaymentStatus = "pending" | "confirmed" | "failed";

export type PaymentMethod = "BANK" | "CASH" | "M_PESA";

export interface PaymentListItem {
  id: string;
  paymentNo: number;
  customerNo: number;
  invoiceNo: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  notes?: string | null;
  paymentAt: string;
  status: PaymentStatus;
}

export interface PaymentsFilterParams {
  search?: string;
  status?: PaymentStatus | "all";
  paymentNo?: number;
  customerNo?: number;
  invoiceNo?: number;
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
  paymentMethod: PaymentMethod;
  notes?: string | null;
  status: PaymentStatus;
  paymentAt: string;
}

export interface PaymentDetail {
  paymentNo: number;
  customerNo: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  invoiceNo: number;
  invoiceStatus: string;
  invoiceCreatedAt?: string | null;
  invoiceDueDate?: string | null;
  invoiceTotal: number;
  invoiceBalance: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  notes?: string | null;
  status: PaymentStatus;
  paymentAt: string;
  createdAt?: string | null;
  confirmedAt?: string | null;
  confirmedByFirstName?: string | null;
  confirmedByLastName?: string | null;
  failedAt?: string | null;
  failedByFirstName?: string | null;
  failedByLastName?: string | null;
}