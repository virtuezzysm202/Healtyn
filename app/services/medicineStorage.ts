import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'medicineSchedules';

export interface MedicineSchedule {
  id: string;
  medicineName: string;
  medicineType: string;
  disease: string;
  medicineForm: string;
  dosageAmount: string;
  dosageUnit: string;
  spoonSize?: string;
  notes: string;
  usageTime: string;
  timesPerDay: number;
  alarmTimes: string[]; // Simpan tanggal sebagai ISO string untuk JSON
  mustFinish: boolean;
  startDate: string;    // ISO string
  endDate: string;      // ISO string
  medicineImage?: string;
}

export async function getAllSchedules(): Promise<MedicineSchedule[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading schedules:', error);
    return [];
  }
}

export async function saveSchedule(schedule: MedicineSchedule) {
  try {
    const schedules = await getAllSchedules();
    schedules.push(schedule);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error saving schedule:', error);
  }
}

export async function updateSchedule(updatedSchedule: MedicineSchedule) {
  try {
    let schedules = await getAllSchedules();
    schedules = schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error updating schedule:', error);
  }
}

export async function deleteSchedule(id: string) {
  try {
    const schedules = await getAllSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting schedule:', error);
  }
}
