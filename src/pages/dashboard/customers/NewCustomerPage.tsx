import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { InputField } from "../../../components/ui/InputField";
import { useCreateCustomer } from "../../../hooks/useCustomers";
import { getApiErrorMessage, getApiFieldErrors } from "../../../api/auth";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phone: string;
}

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: "+254",
  phone: "",
};

const PHONE_COUNTRY_CODES = [
  { value: "+254", label: "🇰🇪 +254" },
  { value: "+255", label: "🇹🇿 +255" },
  { value: "+256", label: "🇺🇬 +256" },
  { value: "+234", label: "🇳🇬 +234" },
  { value: "+27", label: "🇿🇦 +27" },
  { value: "+91", label: "🇮🇳 +91" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+1", label: "🇺🇸 +1" },
];

const TIPS = [
  "Add a valid email to send invoices directly",
  "Use the phone number for quick follow-ups",
  "Customer name should match their official records",
];

const PHONE_REGEX = /^7[0-9]{8}$/;

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.firstName.trim()) errors.firstName = "First name is required.";

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number";
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

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string) => {
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
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      set(field, e.target.value);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    set("phone", digitsOnly);
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
      await createCustomer.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phoneCountryCode: form.phoneCountryCode,
        phone: form.phone.trim() || undefined,
      });
      navigate("/dashboard/customers");
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
      } else {
        setFormError(getApiErrorMessage(err, "Couldn't create the customer. Please try again."));
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
            <Link to="/dashboard/customers" className="hover:text-gray-600 transition-colors">
              Customers
            </Link>
            <span>›</span>
            <span className="text-gray-500">Add Customer</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white"
          >
            <BellIcon />
          </button>

          <Link
            to="/dashboard/customers"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-blue-700 text-white px-4"
          >
            Back to Customers
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

            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Information</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  required
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  error={fieldErrors.firstName}
                  autoFocus
                />
                <InputField
                  label="Last Name"
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  error={fieldErrors.lastName}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange("email")}
                  error={fieldErrors.email}
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="flex">
                    <select
                      value={form.phoneCountryCode}
                      onChange={handleChange("phoneCountryCode")}
                      aria-label="Phone country code"
                      className="px-2.5 text-sm border border-r-0 border-gray-300 rounded-l-lg bg-white text-gray-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      {PHONE_COUNTRY_CODES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{9}"
                      placeholder="712345678"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      className={`flex-1 min-w-0 px-3 py-2.5 text-sm border rounded-r-lg outline-none transition-all
                        placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white
                        focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                        ${fieldErrors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Format: {form.phoneCountryCode} 712345678</p>
                  {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Link
                to="/dashboard/customers"
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createCustomer.isPending}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                  disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createCustomer.isPending ? "Saving…" : "Save Customer"}
              </button>
            </div>
          </div>

          {/* ── Tips sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 lg:sticky lg:top-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <InfoIcon />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Customer Tips</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Add accurate customer information to streamline invoicing and improve communication.
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
