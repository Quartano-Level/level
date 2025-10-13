'use client'

import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { FormError } from '@/shared/components/ui/form-error';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showLabel?: boolean;
}

/**
 * Enhanced form input with integrated label and error handling
 * Uses a consistent height to prevent layout shifts when errors appear
 */
export function FormInput({
  label,
  error,
  id,
  name,
  showLabel = true,
  className,
  ...props
}: FormInputProps) {
  const inputId = id || name;
  const hasError = Boolean(error);
  
  return (
    <div className="space-y-1">
      {showLabel && label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      
      <Input
        id={inputId}
        name={name}
        className={`${className} transition-colors duration-200 ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        {...props}
      />
      
      <FormError message={error} />
    </div>
  );
} 