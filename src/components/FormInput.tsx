import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
  as?: 'input' | 'textarea' | 'select';
  children?: React.ReactNode;
  rows?: number;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  disabled?: boolean;
  autoComplete?: string;
}

export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  error,
  className = '',
  as = 'input',
  children,
  rows = 4,
  ...rest
}: FormInputProps) {
  const baseClass = `w-full px-4 py-3 text-sm text-gray-800 bg-gray-50 border ${
    error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-200'
  } rounded-xl outline-none focus:ring-2 focus:border-blue-400 transition-all placeholder:text-gray-400 ${className}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          required={required}
          rows={rows}
          className={`${baseClass} resize-none`}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
          required={required}
          className={baseClass}
          {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          required={required}
          className={baseClass}
          {...rest}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

