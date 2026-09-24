import { create } from 'zustand';
import { CoopState } from './storeTypes';
import { createMemberSlice } from './slices/memberSlice';
import { createEmployeeSlice } from './slices/employeeSlice';
import { createLoanSlice } from './slices/loanSlice';
import { createSavingsSlice } from './slices/savingsSlice';
import { createOperationsSlice } from './slices/operationsSlice';
import { createMotherGroupSlice } from './slices/motherGroupSlice';
import { createAccountingSlice } from './slices/accountingSlice';

import {
  EmployeeSyncStatus,
  INITIAL_NOTICES,
  INITIAL_LOAN_SCHEMES,
  INITIAL_GATEWAY_RAILS,
  INITIAL_SHARE_POOL,
  INITIAL_AGM_DETAILS,
  INITIAL_FIELD_OFFICERS,
  INITIAL_EMPLOYEES,
  INITIAL_COOP_SETTINGS,
} from './initialData';

export type { EmployeeSyncStatus, CoopState };
export {
  INITIAL_NOTICES,
  INITIAL_LOAN_SCHEMES,
  INITIAL_GATEWAY_RAILS,
  INITIAL_SHARE_POOL,
  INITIAL_AGM_DETAILS,
  INITIAL_FIELD_OFFICERS,
  INITIAL_EMPLOYEES,
  INITIAL_COOP_SETTINGS,
};

/**
 * Unified Unako SACCOS Core Store.
 * Modularized into domain-driven slices adhering to ECC immutability rules.
 */
export const useCoopStore = create<CoopState>()((...a) => ({
  ...createMemberSlice(...a),
  ...createEmployeeSlice(...a),
  ...createLoanSlice(...a),
  ...createSavingsSlice(...a),
  ...createOperationsSlice(...a),
  ...createMotherGroupSlice(...a),
  ...createAccountingSlice(...a),
}));
