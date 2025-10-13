
import { z } from 'zod';

// Common error messages
const ERROR_MESSAGES = {
  required: 'Campo obrigatório',
  email: 'Email inválido',
  password: {
    min: 'A senha deve ter pelo menos 6 caracteres',
    mismatch: 'As senhas não coincidem',
  },
  name: 'Nome inválido',
};

// Login Form Schema
export const loginSchema = z.object({
  email: z.string().min(1, { message: ERROR_MESSAGES.required }).email({ message: ERROR_MESSAGES.email }),
  password: z.string().min(1, { message: ERROR_MESSAGES.required }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Reset Password Email Form Schema
export const resetPasswordEmailSchema = z.object({
  email: z.string().min(1, { message: ERROR_MESSAGES.required }).email({ message: ERROR_MESSAGES.email }),
});

export type ResetPasswordEmailFormData = z.infer<typeof resetPasswordEmailSchema>;

// Reset/Set Password Form Schema
export const passwordSchema = z.object({
  password: z.string().min(6, { message: ERROR_MESSAGES.password.min }),
  confirmPassword: z.string().min(1, { message: ERROR_MESSAGES.required }),
}).refine(data => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.password.mismatch,
  path: ['confirmPassword'], // Show error on confirmPassword field
});

export type PasswordFormData = z.infer<typeof passwordSchema>;

// Member Form Schema
export const memberSchema = z.object({
  name: z.string().min(1, { message: ERROR_MESSAGES.required }),
  email: z.string().min(1, { message: ERROR_MESSAGES.required }).email({ message: ERROR_MESSAGES.email }),
  role: z.string().min(1, { message: ERROR_MESSAGES.required }),
});

export type MemberFormData = z.infer<typeof memberSchema>;

// Email Update Schema
export const emailUpdateSchema = z.object({
  email: z.string().min(1, { message: ERROR_MESSAGES.required }).email({ message: ERROR_MESSAGES.email }),
});

export type EmailUpdateFormData = z.infer<typeof emailUpdateSchema>;

/**
 * Utility function to handle validation with Zod schemas
 * 
 * @param schema The Zod schema to validate against
 * @param data Data to validate
 * @returns Result with success flag, data and errors
 */
export function validateForm<T, U extends Record<string, unknown>>(schema: z.ZodType<T>, data: U): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a more usable format with field names as keys
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path.length > 0) {
          const fieldName = err.path[0].toString();
          fieldErrors[fieldName] = err.message;
        }
      });
      return { success: false, errors: fieldErrors };
    }
    return { success: false, errors: { _form: 'Erro de validação desconhecido' } };
  }
} 