/**
 * Zod validation schemas for authentication inputs.
 *
 * Validates login form data before it reaches Supabase Auth.
 */
import { z } from 'zod';

/** Login form schema shared by both member and staff login. */
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be 255 characters or less'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be 128 characters or less'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Validates login input and returns either the validated data or an error message.
 * Use this at form submission time before calling Supabase Auth.
 */
export const validateLoginInput = (
  input: unknown
): { success: true; data: LoginInput } | { success: false; error: string } => {
  const result = LoginSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Return the first human-readable issue.
  const firstIssue = result.error.issues[0];
  return {
    success: false,
    error: firstIssue?.message ?? 'Invalid login input.',
  };
};
