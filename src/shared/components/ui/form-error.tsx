import React from 'react';

interface FormErrorProps {
  message?: string;
}

/**
 * Component to display form validation errors
 * The component uses a fixed height to prevent layout shifts when errors appear/disappear
 */
export function FormError({ message }: FormErrorProps) {
  return (
    <div className="form-error h-5" aria-live="polite">
      {message && (
        <p className="form-error-message">
          {message}
        </p>
      )}
    </div>
  );
} 