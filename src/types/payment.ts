export interface Payment {
    id: string;
    paymentId: string;
    customerName: string;
    customerEmail: string;
    invoiceNumber: string;
    invoiceId: string;
    paymentDate: string;
    amount: number;
    method: string;
    status: "paid" | "pending" | "overdue";
    reference: string; 
}