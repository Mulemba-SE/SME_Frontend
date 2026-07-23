import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth";
import { InputField } from "../../components/ui/InputField";

function validateNewPassword(v: string) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(v)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(v)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(v)) return "Password must contain at least one number.";
  return "";
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setFormError("Reset token is missing. Please use the link from your email.");
    }
  }, [token]);

  const updateField = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const newPasswordError = validateNewPassword(form.newPassword);
    const confirmPasswordError = form.confirmPassword !== form.newPassword ? "Passwords do not match." : "";
    setErrors({ newPassword: newPasswordError, confirmPassword: confirmPasswordError });
    if (newPasswordError || confirmPasswordError) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: form.newPassword });
      navigate("/auth", { replace: true });
    } catch (err) {
      setFormError("Unable to reset your password. Please try again or request a new link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FF] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter a new password for your account.
          </p>
        </div>

        {formError && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <InputField
            label="New Password"
            isPassword
            value={form.newPassword}
            onChange={updateField("newPassword")}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <InputField
            label="Confirm New Password"
            isPassword
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isLoading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
