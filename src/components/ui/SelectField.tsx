import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
}

export function SelectField({
  label,
  error,
  placeholder,
  options,
  className = "",
  required,
  ...props
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          {...props}
          required={required}
          className={`w-full appearance-none px-3 py-2.5 text-sm border rounded-lg outline-none transition-all
            bg-white text-gray-900
            border-gray-300
            focus:border-blue-600 focus:ring-2 focus:ring-blue-100
            ${!props.value ? "text-gray-400" : ""}
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}
            ${className}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
