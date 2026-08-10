export interface MainMeterAccount {
  id: string;
  name: string;
  createdAt?: string;
}

export interface User {
  id: string;
  mainMeterId: string;
  name: string;
  meterNumber: string;
  createdAt?: string;
}

export interface MainMeterBill {
  id: string;
  mainMeterId: string;
  month: string; // Format: "YYYY-MM" (e.g. "2024-07")
  totalBillAmount: number;
  mainMeterCurrentReading: number;
  mainMeterPreviousReading: number;
}

export interface Reading {
  id: string;
  userId: string;
  month: string; // Format: "YYYY-MM"
  currentReading: number;
  previousReading: number;
}

export interface TenantBillDetails {
  tenant: User;
  reading?: Reading;
  previousReadingUsed: number;
  currentReadingUsed: number;
  isAutoCarriedForwardPrev: boolean;
  unitsConsumed: number;
  calculatedBillAmount: number;
}

export type ThemeType = 'dark' | 'light';

export interface MonthSummary {
  month: string;
  totalSubMeterUnits: number;
  costPerUnit: number;
  totalMainBillAmount: number;
  tenantBills: TenantBillDetails[];
}

