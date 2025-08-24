'use client';

import { forwardRef } from 'react';

interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ id, name, type, placeholder, value, onChange, required = false, autoComplete }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full px-4 py-3 border border-[#000000]/54 rounded-lg bg-[#FEF4F4] text-[#000000]/54 placeholder-[#000000]/54 focus:outline-none focus:ring-2 focus:ring-[#000000]/54 focus:border-[#000000]/54 transition-all duration-200 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    );
  }
);

AuthInput.displayName = 'AuthInput';
