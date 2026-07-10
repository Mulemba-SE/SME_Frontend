import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InputField } from "../../../components/ui/InputField";
import { invoicesApi } from "../../../api/invoices";
import { getApiErrorMessage, getApiFieldErrors } from "../../../api/auth";
import { formatKES } from "../../../lib/format";
import type { CreateInvoiceRequest, InvoiceCreateResponse } from "../../../types/invoice";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

// Types
interface LineItem {
  id: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
  tax: string;
}

interface FormState {
  customerNo: string;
  dueDate: string;
}

// Constants 

const initialForm: FormState = {
  customerNo: "",
  dueDate: "",
};

const initialLineItems: LineItem[] = [
  { id: crypto.randomUUID(), itemName: "", quantity: "0", unitPrice: "", tax: "0" },
];


const TIPS = [
  "Add at least one line item with a name, quantity, and unit price",
  "Set a due date to track overdue invoices automatically",
  "Tax is applied per item",
];

// Helpers

function calcLineTotal(qty: string, price: string): number {
  const q = parseFloat(qty) || 0;
  const p = parseFloat(price) || 0;
  return q * p;
}

function calcTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + calcLineTotal(item.quantity, item.unitPrice), 0);
}

function validate(form: FormState, items: LineItem[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const trimmedCustomerNo = form.customerNo.trim();
  if (!trimmedCustomerNo) {
    errors.customerNo = "Customer is required.";
  } else if (!/^\d+$/.test(trimmedCustomerNo)) {
    // Backend expects the numeric customer number (Long), not a UUID or free text.
    errors.customerNo = "Customer No must be a number.";
  }
  if (!form.dueDate) errors.dueDate = "Due date is required.";
  const hasValidItem = items.some(
    (i) => i.itemName.trim() && parseFloat(i.unitPrice) > 0
  );
  if (!hasValidItem) errors.lineItems = "Add at least one item with a name and price.";
  return errors;
}

//  Icons

function BellIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

// Line Items Table

function LineItemsTable({
  items,
  onChange,
  onAdd,
  onRemove,
  error,
}: {
  items: LineItem[];
  onChange: (id: string, field: keyof LineItem, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  error?: string;
}) {
  const total = calcTotal(items);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Items</h2>

{/* Header */}
      <div className="hidden sm:grid grid-cols-12 gap-3 mb-2 px-1">
        <p className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item Name</p>
        <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</p>
        <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit Price (KES)</p>
        <p className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tax</p>
        <p className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">{""}</p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => {
          const lineTotal = calcLineTotal(item.quantity, item.unitPrice);
          return (
            <div key={item.id} className="flex flex-col gap-1.5 pb-3 border-b border-gray-50 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                {/* Item Name */}
                <div className="col-span-12 sm:col-span-4">
                  <input
                    type="text"
                    placeholder={`Item ${idx + 1}`}
                    value={item.itemName}
                    onChange={(e) => onChange(item.id, "itemName", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none
                      placeholder:text-gray-400 text-gray-900 bg-white
                      focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => onChange(item.id, "quantity", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none
                      placeholder:text-gray-400 text-gray-900 bg-white
                      focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) => onChange(item.id, "unitPrice", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none
                      placeholder:text-gray-400 text-gray-900 bg-white
                      focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Tax */}
                <div className="col-span-3 sm:col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.tax}
                    onChange={(e) => onChange(item.id, "tax", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none
                      placeholder:text-gray-400 text-gray-900 bg-white
                      focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Remove */}
                <div className="col-span-1 flex items-center justify-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      aria-label="Remove item"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>

              {/* Line total — own row, so large amounts never collide with inputs */}
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">
                  Line total:{" "}
                  <span className="text-sm font-semibold text-gray-700">
                    {lineTotal > 0 ? formatKES(lineTotal) : "—"}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {/* Add item + total */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          <PlusIcon />
          Add line item
        </button>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Subtotal</p>
            <p className="text-base font-bold text-gray-900">{formatKES(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefilledCustomerNo = searchParams.get("customerNo") ?? "";

  const [form, setForm] = useState<FormState>({
    ...initialForm,
    customerNo: prefilledCustomerNo,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const total = calcTotal(lineItems);

  const createInvoice = useMutation<InvoiceCreateResponse, unknown, void>({
    mutationFn: () => {
      const payload: CreateInvoiceRequest = {
        customerNo: Number(form.customerNo.trim()),
        dueDate: form.dueDate,
        items: lineItems
          .filter((i) => i.itemName.trim() && parseFloat(i.unitPrice) > 0)
          .map((i) => ({
            itemName: i.itemName.trim(),
            unitPrice: parseFloat(i.unitPrice) || 0,
            quantity: parseInt(i.quantity, 10) || 1,
            tax: parseFloat(i.tax) || 0,
          })),
      };
      return invoicesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      navigate("/dashboard/invoices");
    },
  });

  // Form helpers

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setField(field, e.target.value);

  // Line item helpers

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    if (fieldErrors.lineItems) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n.lineItems; return n; });
    }
  };

  const addLineItem = () =>
    setLineItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), itemName: "", quantity: "1", unitPrice: "", tax: "0" },
    ]);

  const removeLineItem = (id: string) =>
    setLineItems((prev) => prev.filter((item) => item.id !== id));

  //  Submit

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validate(form, lineItems);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await createInvoice.mutateAsync();
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
      } else {
        setFormError(getApiErrorMessage(err, "Couldn't create the invoice. Please try again."));
      }
    }
  };

  // Render 

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
            <Link to="/dashboard/invoices" className="hover:text-gray-600 transition-colors">
              Invoices
            </Link>
            <span>›</span>
            <span className="text-gray-500">Create Invoice</span>
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
            to="/dashboard/invoices"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-blue-700 text-white px-4 text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Back to Invoices
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* ── Main column ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {formError && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {formError}
              </div>
            )}

            {/* Customer & Dates */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Invoice Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField
                    label="Customer No"
                    required
                    placeholder="Enter customer No"
                    value={form.customerNo}
                    onChange={handleChange("customerNo")}
                    error={fieldErrors.customerNo}
                    autoFocus
                  />
                </div>
                <InputField
                  label="Due Date"
                  required
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange("dueDate")}
                  error={fieldErrors.dueDate}
                />
              </div>
            </div>

            {/* Line Items */}
            <LineItemsTable
              items={lineItems}
              onChange={updateLineItem}
              onAdd={addLineItem}
              onRemove={removeLineItem}
              error={fieldErrors.lineItems}
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Link
                to="/dashboard/invoices"
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createInvoice.isPending}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                  disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createInvoice.isPending ? "Saving…" : "Save Invoice"}
              </button>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Summary card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoice Summary</h3>
              <div className="flex flex-col gap-3">
                {lineItems
                  .filter((i) => i.itemName.trim())
                  .map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2">
                      <span className="text-xs text-gray-600 leading-relaxed flex-1 min-w-0 truncate">
                        {item.itemName}
                      </span>
                      <span className="text-xs font-semibold text-gray-800 flex-shrink-0">
                        {calcLineTotal(item.quantity, item.unitPrice) > 0
                          ? formatKES(calcLineTotal(item.quantity, item.unitPrice))
                          : "—"}
                      </span>
                    </div>
                  ))}
                {lineItems.filter((i) => i.itemName.trim()).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No items added yet</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-base font-bold text-blue-600">{formatKES(total)}</span>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <InfoIcon />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Invoice Tips</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Accurate invoices help you get paid faster and keep records clean.
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
