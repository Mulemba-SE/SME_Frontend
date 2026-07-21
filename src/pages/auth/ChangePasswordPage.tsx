import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { InputField } from "../../components/ui/InputField";
import { useAuth } from "../../hooks/useAuth";

function validateNewPassword(v: string) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(v)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(v)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(v)) return "Password must contain at least one number.";
  return "";
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword, isLoading } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const forced = Boolean(user?.mustChangePassword);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const currentErr = forced ? "" : form.currentPassword ? "" : "Current password is required.";
    const newErr = validateNewPassword(form.newPassword);
    const confirmErr =
      form.confirmPassword !== form.newPassword ? "Passwords do not match." : "";

    if (currentErr || newErr || confirmErr) {
      setErrors({ currentPassword: currentErr, newPassword: newErr, confirmPassword: confirmErr });
      return;
    }

    const result = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setFormError(result.error || "Could not change password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FF] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            {forced ? "Set a new password" : "Change your password"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {forced
              ? "You're using a temporary password. Set a new one to continue to your dashboard."
              : "Update the password you use to sign in."}
          </p>
        </div>

        {formError && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!forced && (
            <InputField
              label="Current Password"
              isPassword
              required
              placeholder="Enter your current password"
              value={form.currentPassword}
              onChange={set("currentPassword")}
              error={errors.currentPassword}
              autoComplete="current-password"
            />
          )}
          <InputField
            label="New Password"
            isPassword
            required
            placeholder="Enter a new password"
            value={form.newPassword}
            onChange={set("newPassword")}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <InputField
            label="Confirm New Password"
            isPassword
            required
            placeholder="Re-enter your new password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isLoading ? "Saving…" : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
