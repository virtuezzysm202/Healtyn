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
    throw error; // Re-throw untuk handling di UI
  }
}

export async function updateSchedule(updatedSchedule: MedicineSchedule) {
  try {
    let schedules = await getAllSchedules();
    schedules = schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
}

export async function deleteSchedule(id: string) {
  try {
    const schedules = await getAllSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
}

// Utility functions tambahan yang berguna

export async function getScheduleById(id: string): Promise<MedicineSchedule | null> {
  try {
    const schedules = await getAllSchedules();
    return schedules.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Error getting schedule by id:', error);
    return null;
  }
}

export async function getActiveSchedules(): Promise<MedicineSchedule[]> {
  try {
    const schedules = await getAllSchedules();
    const now = new Date();
    return schedules.filter(schedule => {
      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);
      return now >= startDate && now <= endDate;
    });
  } catch (error) {
    console.error('Error getting active schedules:', error);
    return [];
  }
}

export async function getUpcomingSchedules(): Promise<MedicineSchedule[]> {
  try {
    const schedules = await getAllSchedules();
    const now = new Date();
    return schedules.filter(schedule => {
      const startDate = new Date(schedule.startDate);
      return now < startDate;
    });
  } catch (error) {
    console.error('Error getting upcoming schedules:', error);
    return [];
  }
}

export async function getCompletedSchedules(): Promise<MedicineSchedule[]> {
  try {
    const schedules = await getAllSchedules();
    const now = new Date();
    return schedules.filter(schedule => {
      const endDate = new Date(schedule.endDate);
      return now > endDate;
    });
  } catch (error) {
    console.error('Error getting completed schedules:', error);
    return [];
  }
}

export async function getSchedulesByMedicineType(type: string): Promise<MedicineSchedule[]> {
  try {
    const schedules = await getAllSchedules();
    return schedules.filter(schedule => schedule.medicineType === type);
  } catch (error) {
    console.error('Error getting schedules by type:', error);
    return [];
  }
}

export async function getSchedulesByDisease(disease: string): Promise<MedicineSchedule[]> {
  try {
    const schedules = await getAllSchedules();
    return schedules.filter(schedule => schedule.disease === disease);
  } catch (error) {
    console.error('Error getting schedules by disease:', error);
    return [];
  }
}

export async function getTodaysAlarms(): Promise<{schedule: MedicineSchedule, alarmTime: string}[]> {
  try {
    const activeSchedules = await getActiveSchedules();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todaysAlarms: {schedule: MedicineSchedule, alarmTime: string}[] = [];
    
    activeSchedules.forEach(schedule => {
      schedule.alarmTimes.forEach(alarmTime => {
        const alarm = new Date(alarmTime);
        if (alarm >= todayStart && alarm < todayEnd) {
          todaysAlarms.push({schedule, alarmTime});
        }
      });
    });

    // Sort by alarm time
    todaysAlarms.sort((a, b) => 
      new Date(a.alarmTime).getTime() - new Date(b.alarmTime).getTime()
    );

    return todaysAlarms;
  } catch (error) {
    console.error('Error getting today\'s alarms:', error);
    return [];
  }
}

export async function clearAllSchedules(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all schedules:', error);
    throw error;
  }
}

export async function exportSchedules(): Promise<string> {
  try {
    const schedules = await getAllSchedules();
    return JSON.stringify(schedules, null, 2);
  } catch (error) {
    console.error('Error exporting schedules:', error);
    throw error;
  }
}

export async function importSchedules(jsonData: string): Promise<void> {
  try {
    const schedules: MedicineSchedule[] = JSON.parse(jsonData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error importing schedules:', error);
    throw error;
  }
}