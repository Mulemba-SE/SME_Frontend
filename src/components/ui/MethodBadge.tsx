import { methodLabel, isKnownPaymentMethod } from "../../lib/paymentMethod";
import type { PaymentMethod } from "../../types/payment";

const METHOD_BADGE_CLASSES: Record<PaymentMethod, string> = {
  M_PESA: "bg-emerald-100 text-emerald-700",
  BANK: "bg-blue-100 text-blue-700",
  CASH: "bg-gray-100 text-gray-700",
};

export function MethodBadge({ method }: { method: string }) {
  const classes = isKnownPaymentMethod(method) ? METHOD_BADGE_CLASSES[method] : "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
      {methodLabel(method)}
    </span>
  );
}
