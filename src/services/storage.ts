import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainMeterAccount, User, MainMeterBill, Reading } from '../types';

const KEYS = {
  MAIN_METERS: '@electric_splitter_main_meters_v1',
  USERS: '@electric_splitter_users_v1',
  MAIN_BILLS: '@electric_splitter_main_bills_v1',
  READINGS: '@electric_splitter_readings_v1',
  SELECTED_METER_ID: '@electric_splitter_selected_meter_id_v1',
  THEME_MODE: '@electric_splitter_theme_mode_v1',
};

// Initial default seed data
const SEED_MAIN_METERS: MainMeterAccount[] = [
  { id: 'mm_1', name: 'Main Building', createdAt: new Date().toISOString() },
  { id: 'mm_2', name: 'Annex Complex', createdAt: new Date().toISOString() },
];

const SEED_USERS: User[] = [
  { id: 'u_1', mainMeterId: 'mm_1', name: 'Kedar', meterNumber: 'M-101', createdAt: new Date().toISOString() },
  { id: 'u_2', mainMeterId: 'mm_1', name: 'Rahul', meterNumber: 'M-102', createdAt: new Date().toISOString() },
  { id: 'u_3', mainMeterId: 'mm_1', name: 'Priya', meterNumber: 'M-103', createdAt: new Date().toISOString() },
  { id: 'u_4', mainMeterId: 'mm_2', name: 'Vikram (Shop 1)', meterNumber: 'S-201', createdAt: new Date().toISOString() },
  { id: 'u_5', mainMeterId: 'mm_2', name: 'Neha (Shop 2)', meterNumber: 'S-202', createdAt: new Date().toISOString() },
];

const SEED_MAIN_BILLS: MainMeterBill[] = [
  // 2024-05
  { id: 'mb_1', mainMeterId: 'mm_1', month: '2024-05', totalBillAmount: 3600, mainMeterPreviousReading: 12000, mainMeterCurrentReading: 12450 },
  // 2024-06
  { id: 'mb_2', mainMeterId: 'mm_1', month: '2024-06', totalBillAmount: 4200, mainMeterPreviousReading: 12450, mainMeterCurrentReading: 12980 },
  // 2024-07
  { id: 'mb_3', mainMeterId: 'mm_1', month: '2024-07', totalBillAmount: 4800, mainMeterPreviousReading: 12980, mainMeterCurrentReading: 13580 },
  
  // Annex Complex
  { id: 'mb_4', mainMeterId: 'mm_2', month: '2024-06', totalBillAmount: 2500, mainMeterPreviousReading: 4000, mainMeterCurrentReading: 4310 },
  { id: 'mb_5', mainMeterId: 'mm_2', month: '2024-07', totalBillAmount: 3100, mainMeterPreviousReading: 4310, mainMeterCurrentReading: 4700 },
];

const SEED_READINGS: Reading[] = [
  // 2024-05 (Month 1)
  { id: 'r_1_1', userId: 'u_1', month: '2024-05', previousReading: 1000, currentReading: 1120 }, // 120 units
  { id: 'r_1_2', userId: 'u_2', month: '2024-05', previousReading: 2100, currentReading: 2250 }, // 150 units
  { id: 'r_1_3', userId: 'u_3', month: '2024-05', previousReading: 3050, currentReading: 3230 }, // 180 units

  // 2024-06 (Month 2 - auto carry forward prev reading from May current)
  { id: 'r_2_1', userId: 'u_1', month: '2024-06', previousReading: 1120, currentReading: 1260 }, // 140 units
  { id: 'r_2_2', userId: 'u_2', month: '2024-06', previousReading: 2250, currentReading: 2430 }, // 180 units
  { id: 'r_2_3', userId: 'u_3', month: '2024-06', previousReading: 3230, currentReading: 3435 }, // 205 units

  // 2024-07 (Month 3)
  { id: 'r_3_1', userId: 'u_1', month: '2024-07', previousReading: 1260, currentReading: 1420 }, // 160 units
  { id: 'r_3_2', userId: 'u_2', month: '2024-07', previousReading: 2430, currentReading: 2640 }, // 210 units
  { id: 'r_3_3', userId: 'u_3', month: '2024-07', previousReading: 3435, currentReading: 3665 }, // 230 units

  // Annex Complex readings
  { id: 'r_4_1', userId: 'u_4', month: '2024-06', previousReading: 500, currentReading: 660 }, // 160 units
  { id: 'r_4_2', userId: 'u_5', month: '2024-06', previousReading: 800, currentReading: 950 }, // 150 units

  { id: 'r_5_1', userId: 'u_4', month: '2024-07', previousReading: 660, currentReading: 850 }, // 190 units
  { id: 'r_5_2', userId: 'u_5', month: '2024-07', previousReading: 950, currentReading: 1150 }, // 200 units
];

export const StorageService = {
  async initStorage(): Promise<void> {
    try {
      const existingMeters = await AsyncStorage.getItem(KEYS.MAIN_METERS);
      if (!existingMeters) {
        await AsyncStorage.setItem(KEYS.MAIN_METERS, JSON.stringify(SEED_MAIN_METERS));
        await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
        await AsyncStorage.setItem(KEYS.MAIN_BILLS, JSON.stringify(SEED_MAIN_BILLS));
        await AsyncStorage.setItem(KEYS.READINGS, JSON.stringify(SEED_READINGS));
        await AsyncStorage.setItem(KEYS.SELECTED_METER_ID, SEED_MAIN_METERS[0].id);
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  },

  // Main Meters CRUD
  async getMainMeters(): Promise<MainMeterAccount[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MAIN_METERS);
      return data ? JSON.parse(data) : SEED_MAIN_METERS;
    } catch (e) {
      return SEED_MAIN_METERS;
    }
  },

  async saveMainMeters(meters: MainMeterAccount[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.MAIN_METERS, JSON.stringify(meters));
  },

  // Users CRUD
  async getUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : SEED_USERS;
    } catch (e) {
      return SEED_USERS;
    }
  },

  async saveUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // Main Bills CRUD
  async getMainBills(): Promise<MainMeterBill[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MAIN_BILLS);
      return data ? JSON.parse(data) : SEED_MAIN_BILLS;
    } catch (e) {
      return SEED_MAIN_BILLS;
    }
  },

  async saveMainBills(bills: MainMeterBill[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.MAIN_BILLS, JSON.stringify(bills));
  },

  // Readings CRUD
  async getReadings(): Promise<Reading[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.READINGS);
      return data ? JSON.parse(data) : SEED_READINGS;
    } catch (e) {
      return SEED_READINGS;
    }
  },

  async saveReadings(readings: Reading[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.READINGS, JSON.stringify(readings));
  },

  // Selected Meter State
  async getSelectedMeterId(): Promise<string> {
    try {
      const id = await AsyncStorage.getItem(KEYS.SELECTED_METER_ID);
      return id || SEED_MAIN_METERS[0].id;
    } catch (e) {
      return SEED_MAIN_METERS[0].id;
    }
  },

  async setSelectedMeterId(id: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.SELECTED_METER_ID, id);
  },

  // Theme Preference
  async getThemeMode(): Promise<'dark' | 'light'> {
    try {
      const mode = await AsyncStorage.getItem(KEYS.THEME_MODE);
      return mode === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  },

  async setThemeMode(mode: 'dark' | 'light'): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME_MODE, mode);
  },
};
