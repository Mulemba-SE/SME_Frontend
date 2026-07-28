import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setupApi } from "../../api/setup";
import { useAuthStore } from "../../store/authStore";
import { getApiErrorMessage, getApiFieldErrors } from "../../api/client";
import { InputField } from "../../components/ui/InputField";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address.";
}
function validatePassword(v: string) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(v)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(v)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(v)) return "Password must contain at least one number.";
  return "";
}
function validatePhone(v: string) {
  if (!v) return "Phone number is required.";
  const phoneRegex = /^(?:\+254|254|0)?(7\d{8})$/;
  return phoneRegex.test(v) ? "" : "Enter a valid Kenyan phone number (e.g. 0712345678 or +254712345678)";
}
function validateRequired(v: string, label: string) {
  return v.trim() ? "" : `${label} is required.`;
}

export default function SetupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      firstName: validateRequired(form.firstName, "First name"),
      lastName: validateRequired(form.lastName, "Last name"),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      phoneNumber: validatePhone(form.phoneNumber),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await setupApi.createFirstManager(form);
      setAuth({
        email: form.email,
        firstName: res.firstName,
        roles: res.roles,
        mustChangePassword: res.mustChangePassword,
      });
      localStorage.setItem("imarabill_has_session", "1");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const fieldErrors = getApiFieldErrors(err);
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      } else {
        setError(getApiErrorMessage(err, "Could not complete setup. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-7 py-7 w-full max-w-[460px]">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <span className="text-gray-900 font-semibold text-2xl tracking-tight">ImaraBill</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Set up your business</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                You're first here — create your Manager account to get started.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="First name"
                type="text"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                error={errors.firstName}
                autoComplete="given-name"
              />
              <InputField
                label="Last name"
                type="text"
                placeholder="Kamau"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                error={errors.lastName}
                autoComplete="family-name"
              />
            </div>

            <InputField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <InputField
              label="Password"
              isPassword
              placeholder="Min 8 chars, A-Z, a-z, 0-9"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />

            <InputField
              label="Phone Number"
              type="tel"
              placeholder="0712345678"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              error={errors.phoneNumber}
              autoComplete="phone"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors mt-1"
            >
              {isLoading ? "Setting up…" : "Create Manager account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}