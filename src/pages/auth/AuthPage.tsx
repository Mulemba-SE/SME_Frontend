import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { InputField } from "../../components/ui/InputField";

type Tab = "login" | "register";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address.";
}
function validatePassword(v: string) {
  if (!v) return "Password is required.";

  if (v.length < 8)
    return "Password must be at least 8 characters.";

  if (!/[A-Z]/.test(v))
    return "Password must contain at least one uppercase letter.";

  if (!/[a-z]/.test(v))
    return "Password must contain at least one lowercase letter.";

  if (!/[0-9]/.test(v))
    return "Password must contain at least one number.";

  return "";
}
function validatePhone(v: string) {
  if (!v) return "Phone number is required.";

  const phoneRegex = /^(?:\+254|254|0)?(7\d{8})$/;

  return phoneRegex.test(v)
    ? ""
    : "Enter a valid Kenyan phone number (e.g. 0712345678 or +254712345678)";
}
function validateRequired(v: string, label: string) {
  return v.trim() ? "" : `${label} is required.`;
}

function LeftPanel() {
  return (
    <div className="flex flex-col justify-between bg-[#F8F8FF] px-10 py-7 relative overflow-hidden h-full w-full">
      
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-600/5" />
      <div className="absolute bottom-20 -left-12 w-48 h-48 rounded-full bg-blue-600/5" />

      <svg
        className="absolute bottom-0 left-0 w-full h-[150px] pointer-events-none"
        viewBox="0 0 1000 170"
        preserveAspectRatio="none"
      >
        <path d="M0,85 C250,25 750,150 1000,70 L1000,170 L0,170 Z" fill="#2563eb" />
      </svg>

      <div className="flex items-center gap-2 z-10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <span className="text-gray-900 font-semibold text-3xl tracking-tight">ImaraBill</span>
      </div>

      <div className="z-10 my-3">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
          Invoicing made{" "}
          <span className="text-blue-600">simple.</span>
          <br />
          Business made{" "}
          <span className="text-blue-600">better.</span>
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-xs">
          Create invoices, track payments, manage expenses and grow your business seamlessly.
        </p>

        <div className="flex flex-col gap-2.5">
          {[
            {
              icon: (
                <svg width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              ),
              title: "Create & Send Invoices",
              sub: "Professional invoices in seconds",
            },
            {
              icon: (
                <svg width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              ),
              title: "Track Payments",
              sub: "Get paid faster with easy tracking",
            },
            {
              icon: (
                <svg width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="1.8" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              ),
              title: "Business Insights",
              sub: "Make smarter decisions with reports",
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-gray-900 text-sm font-medium">{f.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="z-10 relative pb-1">
        <p className="text-blue-100 text-xs mb-1.5">Trusted by 10,000+ businesses</p>
        <div className="flex items-center gap-4 flex-wrap">
          {["TATA", "Wipro", "Deloitte", "Zoho", "Paytm"].map((name) => (
            <span key={name} className="text-white/70 text-xs font-semibold tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


function SocialButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const set = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passErr = validateRequired(form.password, "Password");
    setErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    const result = await login({ email: form.email, password: form.password });
    if (result.success) navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-0.5">Sign in to your account</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

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
        placeholder="Enter your password"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between -mt-1">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => set("remember", e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          Remember me
        </label>
        <button type="button" className="text-sm text-blue-600 font-medium hover:text-blue-700">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {isLoading ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SocialButton
          label="Google"
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
        />
        <SocialButton
          label="Microsoft"
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z" />
              <path fill="#7FBA00" d="M13 1h10v10H13z" />
              <path fill="#00A4EF" d="M1 13h10v10H1z" />
              <path fill="#FFB900" d="M13 13h10v10H13z" />
            </svg>
          }
        />
      </div>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-blue-600 font-medium hover:text-blue-700">
          Sign up
        </button>
      </p>
    </form>
  );
}

// Sign Up
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

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

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      firstName: validateRequired(form.firstName, "First name"),
      lastName: validateRequired(form.lastName, "Last name"),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      phoneNumber: validatePhone(form.phoneNumber),    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    const result = await register(form);
    if (result.success) {
      navigate("/dashboard");
    } else if (result.fieldErrors) {
      
      setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
        <p className="text-sm text-gray-500 mt-0.5">Start managing invoices today</p>
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
        {isLoading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-blue-600 font-medium hover:text-blue-700">
          Sign in
        </button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gray-50">
      {/* Left branding panel — hidden on mobile, shown on lg+ */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <LeftPanel />
      </div>

      {/* Mobile top bar — only visible on small screens */}
      <div className="flex lg:hidden items-center gap-2 px-5 py-4 bg-[#F8F8FF] border-b border-gray-200">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <span className="text-gray-900 font-semibold text-xl tracking-tight">ImaraBill</span>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 lg:py-0 lg:px-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-7 py-7 w-full max-w-[460px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="w-full max-w-sm mx-auto">

            <div className="flex border-b border-gray-200 mb-5 gap-5">
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {tab === "login" ? (
              <LoginForm onSwitch={() => setTab("register")} />
            ) : (
              <RegisterForm onSwitch={() => setTab("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
