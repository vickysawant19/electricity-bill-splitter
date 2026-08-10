import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MainMeterAccount, User, MainMeterBill, Reading, ThemeType } from '../types';
import { StorageService } from '../services/storage';

interface DbContextValue {
  selectedMainMeterId: string;
  selectedMonth: string;
  mainMeters: MainMeterAccount[];
  users: User[];
  mainBills: MainMeterBill[];
  readings: Reading[];
  themeMode: ThemeType;
  isLoading: boolean;
  
  // Setters
  setSelectedMainMeterId: (id: string) => void;
  setSelectedMonth: (month: string) => void;
  setThemeMode: (mode: ThemeType) => void;
  toggleTheme: () => void;

  // Actions
  addMainMeter: (name: string) => Promise<void>;
  updateMainMeter: (id: string, name: string) => Promise<void>;
  deleteMainMeter: (id: string) => Promise<void>;

  addTenant: (name: string, meterNumber: string) => Promise<void>;
  updateTenant: (id: string, name: string, meterNumber: string) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;

  saveMainBillField: (
    mainMeterId: string,
    month: string,
    field: keyof Omit<MainMeterBill, 'id' | 'mainMeterId' | 'month'>,
    value: number
  ) => Promise<void>;

  saveReadingField: (
    userId: string,
    month: string,
    field: keyof Omit<Reading, 'id' | 'userId' | 'month'>,
    value: number
  ) => Promise<void>;

  refreshData: () => Promise<void>;
}

const DbContext = createContext<DbContextValue | undefined>(undefined);

export const DbContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMainMeterId, setSelectedMainMeterIdState] = useState<string>('mm_1');
  const [selectedMonth, setSelectedMonthState] = useState<string>('2024-07');
  const [mainMeters, setMainMeters] = useState<MainMeterAccount[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [mainBills, setMainBills] = useState<MainMeterBill[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [themeMode, setThemeModeState] = useState<ThemeType>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await StorageService.initStorage();

    const [metersData, usersData, billsData, readingsData, selId, theme] = await Promise.all([
      StorageService.getMainMeters(),
      StorageService.getUsers(),
      StorageService.getMainBills(),
      StorageService.getReadings(),
      StorageService.getSelectedMeterId(),
      StorageService.getThemeMode(),
    ]);

    setMainMeters(metersData);
    setUsers(usersData);
    setMainBills(billsData);
    setReadings(readingsData);
    setThemeModeState(theme);

    if (metersData.length > 0) {
      const validSelId = metersData.some((m) => m.id === selId) ? selId : metersData[0].id;
      setSelectedMainMeterIdState(validSelId);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const setSelectedMainMeterId = (id: string) => {
    setSelectedMainMeterIdState(id);
    StorageService.setSelectedMeterId(id);
  };

  const setSelectedMonth = (month: string) => {
    setSelectedMonthState(month);
  };

  const setThemeMode = (mode: ThemeType) => {
    setThemeModeState(mode);
    StorageService.setThemeMode(mode);
  };

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  };

  // Main Meter CRUD
  const addMainMeter = async (name: string) => {
    const newMeter: MainMeterAccount = {
      id: `mm_${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...mainMeters, newMeter];
    setMainMeters(updated);
    await StorageService.saveMainMeters(updated);
    setSelectedMainMeterId(newMeter.id);
  };

  const updateMainMeter = async (id: string, name: string) => {
    const updated = mainMeters.map((m) => (m.id === id ? { ...m, name: name.trim() } : m));
    setMainMeters(updated);
    await StorageService.saveMainMeters(updated);
  };

  const deleteMainMeter = async (id: string) => {
    // Cascade delete sub-meters, bills, readings
    const updatedMeters = mainMeters.filter((m) => m.id !== id);
    const tenantIdsToDelete = users.filter((u) => u.mainMeterId === id).map((u) => u.id);
    const updatedUsers = users.filter((u) => u.mainMeterId !== id);
    const updatedBills = mainBills.filter((b) => b.mainMeterId !== id);
    const updatedReadings = readings.filter((r) => !tenantIdsToDelete.includes(r.userId));

    setMainMeters(updatedMeters);
    setUsers(updatedUsers);
    setMainBills(updatedBills);
    setReadings(updatedReadings);

    await StorageService.saveMainMeters(updatedMeters);
    await StorageService.saveUsers(updatedUsers);
    await StorageService.saveMainBills(updatedBills);
    await StorageService.saveReadings(updatedReadings);

    if (selectedMainMeterId === id && updatedMeters.length > 0) {
      setSelectedMainMeterId(updatedMeters[0].id);
    }
  };

  // Tenant CRUD
  const addTenant = async (name: string, meterNumber: string) => {
    if (!selectedMainMeterId) return;
    const newTenant: User = {
      id: `u_${Date.now()}`,
      mainMeterId: selectedMainMeterId,
      name: name.trim(),
      meterNumber: meterNumber.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newTenant];
    setUsers(updated);
    await StorageService.saveUsers(updated);
  };

  const updateTenant = async (id: string, name: string, meterNumber: string) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, name: name.trim(), meterNumber: meterNumber.trim() } : u
    );
    setUsers(updated);
    await StorageService.saveUsers(updated);
  };

  const deleteTenant = async (id: string) => {
    const updatedUsers = users.filter((u) => u.id !== id);
    const updatedReadings = readings.filter((r) => r.userId !== id);

    setUsers(updatedUsers);
    setReadings(updatedReadings);

    await StorageService.saveUsers(updatedUsers);
    await StorageService.saveReadings(updatedReadings);
  };

  // Real-time bill inputs
  const saveMainBillField = async (
    mainMeterId: string,
    month: string,
    field: keyof Omit<MainMeterBill, 'id' | 'mainMeterId' | 'month'>,
    value: number
  ) => {
    const existingIdx = mainBills.findIndex(
      (b) => b.mainMeterId === mainMeterId && b.month === month
    );

    let updatedBills = [...mainBills];
    if (existingIdx >= 0) {
      updatedBills[existingIdx] = {
        ...updatedBills[existingIdx],
        [field]: value,
      };
    } else {
      const newBill: MainMeterBill = {
        id: `mb_${Date.now()}`,
        mainMeterId,
        month,
        totalBillAmount: field === 'totalBillAmount' ? value : 0,
        mainMeterPreviousReading: field === 'mainMeterPreviousReading' ? value : 0,
        mainMeterCurrentReading: field === 'mainMeterCurrentReading' ? value : 0,
      };
      updatedBills.push(newBill);
    }

    setMainBills(updatedBills);
    await StorageService.saveMainBills(updatedBills);
  };

  const saveReadingField = async (
    userId: string,
    month: string,
    field: keyof Omit<Reading, 'id' | 'userId' | 'month'>,
    value: number
  ) => {
    const existingIdx = readings.findIndex(
      (r) => r.userId === userId && r.month === month
    );

    let updatedReadings = [...readings];
    if (existingIdx >= 0) {
      updatedReadings[existingIdx] = {
        ...updatedReadings[existingIdx],
        [field]: value,
      };
    } else {
      const newReading: Reading = {
        id: `r_${Date.now()}`,
        userId,
        month,
        previousReading: field === 'previousReading' ? value : 0,
        currentReading: field === 'currentReading' ? value : 0,
      };
      updatedReadings.push(newReading);
    }

    setReadings(updatedReadings);
    await StorageService.saveReadings(updatedReadings);
  };

  return (
    <DbContext.Provider
      value={{
        selectedMainMeterId,
        selectedMonth,
        mainMeters,
        users,
        mainBills,
        readings,
        themeMode,
        isLoading,
        setSelectedMainMeterId,
        setSelectedMonth,
        setThemeMode,
        toggleTheme,
        addMainMeter,
        updateMainMeter,
        deleteMainMeter,
        addTenant,
        updateTenant,
        deleteTenant,
        saveMainBillField,
        saveReadingField,
        refreshData: loadAllData,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDbContext = (): DbContextValue => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDbContext must be used within a DbContextProvider');
  }
  return context;
};
