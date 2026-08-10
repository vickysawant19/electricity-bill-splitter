import { Reading, MainMeterBill, User, TenantBillDetails, MonthSummary } from '../types';

export const parseNumericInput = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (amount: number): string => {
  const safeAmount = isNaN(amount) ? 0 : Math.max(0, amount);
  return `₹${safeAmount.toFixed(2)}`;
};

export const formatUnits = (units: number): string => {
  const safeUnits = isNaN(units) ? 0 : Math.max(0, units);
  return `${safeUnits.toFixed(1)} Units`;
};

export const getPreviousMonthStr = (currentMonthStr: string): string => {
  const [yearStr, monthStr] = currentMonthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month)) {
    const d = new Date();
    year = d.getFullYear();
    month = d.getMonth() + 1;
  }

  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }

  return `${year}-${month.toString().padStart(2, '0')}`;
};

export const getNextMonthStr = (currentMonthStr: string): string => {
  const [yearStr, monthStr] = currentMonthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month)) {
    const d = new Date();
    year = d.getFullYear();
    month = d.getMonth() + 1;
  }

  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }

  return `${year}-${month.toString().padStart(2, '0')}`;
};

export const getPastNMonths = (targetMonthStr: string, count: number = 5): string[] => {
  const months: string[] = [];
  let curr = targetMonthStr;

  for (let i = 0; i < count; i++) {
    months.unshift(curr);
    curr = getPreviousMonthStr(curr);
  }

  return months;
};

export const formatMonthLabel = (monthStr: string): string => {
  const [yearStr, monthStrNum] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStrNum, 10) - 1;

  if (isNaN(year) || isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) {
    return monthStr;
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return `${monthNames[monthIdx]} ${year}`;
};

export const resolveEffectiveTenantReading = (
  userId: string,
  month: string,
  allReadings: Reading[]
): {
  reading?: Reading;
  previousReading: number;
  currentReading: number;
  isAutoCarriedForwardPrev: boolean;
} => {
  const currentMonthReading = allReadings.find(
    (r) => r.userId === userId && r.month === month
  );

  let prevVal = currentMonthReading?.previousReading || 0;
  let currVal = currentMonthReading?.currentReading || 0;
  let isAutoCarriedForwardPrev = false;

  // Auto Carry-Forward Logic:
  // If Previous Reading is not explicitly set (> 0) in current month,
  // fetch Previous Month's Current Reading.
  if (!prevVal || prevVal === 0) {
    const prevMonthStr = getPreviousMonthStr(month);
    const prevMonthReading = allReadings.find(
      (r) => r.userId === userId && r.month === prevMonthStr
    );

    if (prevMonthReading && prevMonthReading.currentReading > 0) {
      prevVal = prevMonthReading.currentReading;
      isAutoCarriedForwardPrev = true;
    }
  }

  return {
    reading: currentMonthReading,
    previousReading: prevVal,
    currentReading: currVal,
    isAutoCarriedForwardPrev,
  };
};

export const resolveEffectiveMainMeterBill = (
  mainMeterId: string,
  month: string,
  allBills: MainMeterBill[]
): {
  bill?: MainMeterBill;
  totalBillAmount: number;
  previousReading: number;
  currentReading: number;
  isAutoCarriedForwardPrev: boolean;
} => {
  const currentMonthBill = allBills.find(
    (b) => b.mainMeterId === mainMeterId && b.month === month
  );

  let totalBillAmount = currentMonthBill?.totalBillAmount || 0;
  let prevVal = currentMonthBill?.mainMeterPreviousReading || 0;
  let currVal = currentMonthBill?.mainMeterCurrentReading || 0;
  let isAutoCarriedForwardPrev = false;

  if (!prevVal || prevVal === 0) {
    const prevMonthStr = getPreviousMonthStr(month);
    const prevMonthBill = allBills.find(
      (b) => b.mainMeterId === mainMeterId && b.month === prevMonthStr
    );

    if (prevMonthBill && prevMonthBill.mainMeterCurrentReading > 0) {
      prevVal = prevMonthBill.mainMeterCurrentReading;
      isAutoCarriedForwardPrev = true;
    }
  }

  return {
    bill: currentMonthBill,
    totalBillAmount,
    previousReading: prevVal,
    currentReading: currVal,
    isAutoCarriedForwardPrev,
  };
};

export const calculateMonthSummary = (
  mainMeterId: string,
  month: string,
  tenants: User[],
  allBills: MainMeterBill[],
  allReadings: Reading[]
): MonthSummary => {
  const activeTenants = tenants.filter((t) => t.mainMeterId === mainMeterId);
  const mainBill = resolveEffectiveMainMeterBill(mainMeterId, month, allBills);

  let totalSubMeterUnits = 0;
  const tenantDetailsList: Array<{
    tenant: User;
    reading?: Reading;
    previousReadingUsed: number;
    currentReadingUsed: number;
    isAutoCarriedForwardPrev: boolean;
    unitsConsumed: number;
  }> = [];

  for (const tenant of activeTenants) {
    const res = resolveEffectiveTenantReading(tenant.id, month, allReadings);
    const units = Math.max(0, res.currentReading - res.previousReading);

    totalSubMeterUnits += units;

    tenantDetailsList.push({
      tenant,
      reading: res.reading,
      previousReadingUsed: res.previousReading,
      currentReadingUsed: res.currentReading,
      isAutoCarriedForwardPrev: res.isAutoCarriedForwardPrev,
      unitsConsumed: units,
    });
  }

  const costPerUnit =
    totalSubMeterUnits > 0
      ? mainBill.totalBillAmount / totalSubMeterUnits
      : 0;

  const tenantBills: TenantBillDetails[] = tenantDetailsList.map((item) => ({
    ...item,
    calculatedBillAmount: item.unitsConsumed * costPerUnit,
  }));

  return {
    month,
    totalSubMeterUnits,
    costPerUnit,
    totalMainBillAmount: mainBill.totalBillAmount,
    tenantBills,
  };
};
