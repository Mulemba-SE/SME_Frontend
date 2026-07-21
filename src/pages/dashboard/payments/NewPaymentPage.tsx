import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { InputField } from "../../../components/ui/InputField";
import { SelectField } from "../../../components/ui/SelectField";
import { getApiErrorMessage, getApiFieldErrors } from "../../../api/client";
import { formatKES } from "../../../lib/format";
import { useCreatePayment } from "../../../hooks/usePayments";
import type { PaymentMethod } from "../../../types/payment";

interface FormState {
  customerNo: string;
  invoiceNo: string;
  amount: string;
  paymentMethod: PaymentMethod | "";
  transactionRef: string;
  notes: string;
}

const PAYMENT_METHODS = [
  { value: "BANK", label: "Bank" },
  { value: "CASH", label: "Cash" },
  { value: "M_PESA", label: "M-Pesa" },
];

const TIPS = [
  "Use the exact invoice and customer numbers from the invoice record",
  "Record the amount received, not the invoice total unless it was paid in full",
  "Add a transaction reference for bank or M-Pesa payments",
];

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.customerNo.trim()) {
    errors.customerNo = "Customer No is required.";
  } else if (!/^\d+$/.test(form.customerNo.trim())) {
    errors.customerNo = "Customer No must be a number.";
  }

  if (!form.invoiceNo.trim()) {
    errors.invoiceNo = "Invoice No is required.";
  } else if (!/^\d+$/.test(form.invoiceNo.trim())) {
    errors.invoiceNo = "Invoice No must be a number.";
  }

  const amount = Number(form.amount);
  if (!form.amount.trim()) {
    errors.amount = "Amount is required.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }

  if (!form.paymentMethod) {
    errors.paymentMethod = "Payment method is required.";
  }

  return errors;
}

function BellIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-900 text-right break-words">{value}</span>
    </div>
  );
}

export default function NewPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createPayment = useCreatePayment();
  const isInvoiceLocked = Boolean(searchParams.get("invoiceNo"));
  const isCustomerLocked = Boolean(searchParams.get("customerNo"));

  const [form, setForm] = useState<FormState>({
    customerNo: searchParams.get("customerNo") ?? "",
    invoiceNo: searchParams.get("invoiceNo") ?? "",
    amount: searchParams.get("amount") ?? "",
    paymentMethod: "",
    transactionRef: "",
    notes: "",
  });

  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const amountPreview = useMemo(() => {
    const amount = Number(form.amount);
    return Number.isFinite(amount) && amount > 0 ? formatKES(amount) : "KES 0";
  }, [form.amount]);

  const methodLabel =
    PAYMENT_METHODS.find((method) => method.value === form.paymentMethod)?.label ?? "Not selected";

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setField(field, e.target.value);

  const handleNumberChange =
    (field: "customerNo" | "invoiceNo") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setField(field, e.target.value.replace(/\D/g, ""));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await createPayment.mutateAsync({
        customerNo: Number(form.customerNo.trim()),
        invoiceNo: Number(form.invoiceNo.trim()),
        amount: Number(form.amount),
        payment_method: form.paymentMethod as PaymentMethod,
        transaction_ref: form.transactionRef.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      navigate("/dashboard/payments");
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
      } else {
        setFormError(getApiErrorMessage(err, "Couldn't record the payment. Please try again."));
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
            <Link to="/dashboard/payments" className="hover:text-gray-600 transition-colors">
              Payments
            </Link>
            <span>&gt;</span>
            <span className="text-gray-500">Record Payment</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <BellIcon />
          </button>
          <Link
            to="/dashboard/payments"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-blue-700 text-white px-4 text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Back to Payments
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {formError && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {formError}
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {isCustomerLocked ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Customer No</label>
                  <div className="px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-medium">
                    {form.customerNo}
                  </div>
                </div>
              ) : (
                  <InputField
                    label="Customer No"
                    required
                    inputMode="numeric"
                    placeholder="Enter customer No"
                    value={form.customerNo}
                    onChange={handleNumberChange("customerNo")}
                    error={fieldErrors.customerNo}
                    autoFocus={!form.customerNo}
                  />
                )}
                {isInvoiceLocked ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Invoice No</label>
                    <div className="px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-medium">
                      {form.invoiceNo}
                    </div>
                  </div>
                ) : (
                  <InputField
                    label="Invoice No"
                    required
                    inputMode="numeric"
                    placeholder="Enter invoice No"
                    value={form.invoiceNo}
                    onChange={handleNumberChange("invoiceNo")}
                    error={fieldErrors.invoiceNo}
                    autoFocus={Boolean(form.customerNo) && !form.invoiceNo}
                  />
                )}
               
                <InputField
                  label="Amount"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange("amount")}
                  error={fieldErrors.amount}
                />
                <SelectField
                  label="Payment Method"
                  required
                  placeholder="Select method"
                  options={PAYMENT_METHODS}
                  value={form.paymentMethod}
                  onChange={handleChange("paymentMethod")}
                  error={fieldErrors.paymentMethod}
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="Transaction Reference"
                    placeholder="Receipt, bank, or M-Pesa reference"
                    value={form.transactionRef}
                    onChange={handleChange("transactionRef")}
                    error={fieldErrors.transactionRef}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Add payment notes"
                    value={form.notes}
                    onChange={handleChange("notes")}
                    className="w-full resize-none px-3 py-2.5 text-sm border rounded-lg outline-none transition-all placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link
                to="/dashboard/payments"
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createPayment.isPending}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createPayment.isPending ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="flex flex-col gap-3">
                <SummaryRow label="Invoice No" value={form.invoiceNo || "-"} />
                <SummaryRow label="Customer No" value={form.customerNo || "-"} />
                <SummaryRow label="Amount" value={amountPreview} />
                <SummaryRow label="Method" value={methodLabel} />
                <SummaryRow label="Reference" value={form.transactionRef.trim() || "-"} />
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <InfoIcon />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Payment Tips</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Clean payment records make reconciliation easier when invoice payment history is added.
              </p>
              <ul className="flex flex-col gap-3">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <span className="text-green-600">
                      <CheckIcon />
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
