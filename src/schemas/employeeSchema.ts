/**
 * Zod validation schemas for Employee entities.
 *
 * Validates all user input at the service boundary before sending to Supabase.
 */
import { z } from 'zod';

export const EMPLOYEE_STATUS = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'] as const;
export const EMPLOYEE_ACCESS_ROLE = [
  'SUPER_ADMIN',
  'BRANCH_MANAGER',
  'LOAN_OFFICER',
  'TELLER',
  'ACCOUNTANT',
  'FIELD_OFFICER',
] as const;

export const EmployeeStatusSchema = z.enum(EMPLOYEE_STATUS);
export const EmployeeAccessRoleSchema = z.enum(EMPLOYEE_ACCESS_ROLE);

/** Schema for creating a new employee (id is generated server-side). */
export const CreateEmployeeSchema = z.object({
  employeeNo: z
    .string()
    .trim()
    .min(1, 'Employee number is required')
    .max(20, 'Employee number must be 20 characters or less'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  nameNepali: z.string().trim().max(100).optional(),
  designation: z
    .string()
    .trim()
    .min(1, 'Designation is required')
    .max(100, 'Designation must be 100 characters or less'),
  designationNepali: z.string().trim().max(100).optional(),
  department: z
    .string()
    .trim()
    .min(1, 'Department is required')
    .max(100, 'Department must be 100 characters or less'),
  branch: z
    .string()
    .trim()
    .min(1, 'Branch is required')
    .max(100, 'Branch must be 100 characters or less'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number must be 20 characters or less'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less'),
  joinedDate: z.string().trim().min(1, 'Joined date is required'),
  status: EmployeeStatusSchema,
  accessRole: EmployeeAccessRoleSchema,
  assignedWards: z.array(z.string().trim()).default([]),
  avatarUrl: z.string().trim().default('/assets/kyc/avatar_officer.png'),
  notes: z.string().trim().max(1000, 'Notes must be 1000 characters or less').optional(),
});

/** Schema for partial updates (all fields optional). */
export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
