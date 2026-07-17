import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { InputField } from "../../../components/ui/InputField";
import { SelectField } from "../../../components/ui/SelectField";
import { useCreateAdminUser } from "../../../hooks/useAdminUsers";
import { getApiErrorMessage, getApiFieldErrors } from "../../../api/client";
import type { AssignableRole } from "../../../types/adminUser";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: AssignableRole | "";
}

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  role: "",
};

const ROLE_OPTIONS: { value: AssignableRole; label: string }[] = [
  { value: "STAFF", label: "Staff" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "MANAGER", label: "Manager" },
];

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (form.phoneNumber.trim() && !/^\+?[0-9]{7,15}$/.test(form.phoneNumber.trim())) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (!form.role) errors.role = "Select a role for this account.";

  return errors;
}

export default function NewUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateAdminUser();

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await createUser.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        role: form.role as AssignableRole,
      });
      navigate("/dashboard/team");
    } catch (err) {
      const apiFieldErrors = getApiFieldErrors(err);
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
      } else {
        setFormError(getApiErrorMessage(err, "Couldn't create the account. Please try again."));
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Team Member</h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
            <Link to="/dashboard/team" className="hover:text-gray-600 transition-colors">
              Team
            </Link>
            <span>›</span>
            <span className="text-gray-500">Add Team Member</span>
          </div>
        </div>

        <Link
          to="/dashboard/team"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-blue-700 text-white px-4"
        >
          Back to Team
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {formError && (
          <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {formError}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Account Details</h2>

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
              required
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange("email")}
              error={fieldErrors.email}
            />
            <InputField
              label="Phone Number"
              placeholder="+254712345678"
              value={form.phoneNumber}
              onChange={handleChange("phoneNumber")}
              error={fieldErrors.phoneNumber}
            />
            <SelectField
              label="Role"
              required
              placeholder="Select a role"
              value={form.role}
              onChange={handleChange("role")}
              error={fieldErrors.role}
              options={ROLE_OPTIONS}
            />
          </div>

          <p className="text-xs text-gray-500 mt-4">
            A temporary password will be generated automatically and emailed to this address, along with a login link.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Link
            to="/dashboard/team"
            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
              disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {createUser.isPending ? "Creating…" : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
