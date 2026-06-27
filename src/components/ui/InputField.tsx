import { useState, type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function InputField({ label, error, isPassword = false, className = "", required, ...props }: InputFieldProps) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
<label className="text-sm font-medium text-gray-700">
  {label}
  {required && <span className="text-red-500 ml-0.5">*</span>}
</label>      
<div className="relative">
        <input
          {...props}
          required={required}
          type={isPassword ? (showPass ? "text" : "password") : props.type}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all            
            placeholder:text-gray-400 text-gray-900
            border-gray-300 bg-white
            focus:border-blue-600 focus:ring-2 focus:ring-blue-100
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}
            ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
