import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { deleteSchedule, getAllSchedules } from '../../services/medicineStorage';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "../../hooks/useTranslation";

const { width } = Dimensions.get("window");

interface MedicineSchedule {
  id: string;
  medicineName: string;
  doctorName?: string;
  medicineType: string;
  disease: string;
  medicineForm: string;
  dosageAmount: string;
  dosageUnit: string;
  spoonSize?: string;
  notes: string;
  usageTime: string;
  timesPerDay: number;
  alarmTimes: (string | Date)[]; 
  mustFinish: boolean;
  startDate: string | Date;      
  endDate: string | Date;        
  medicineImage?: string;
}

export default function MedicineScreen() {
  const router = useRouter();
  const { t } = useTranslation(); // Menggunakan useTranslation
  const [savedSchedules, setSavedSchedules] = useState<MedicineSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const navigateToCreateSchedule = () => {
    router.push('/(tabs)/CreateMedicineSchedule'); 
  };

  // Load schedules from AsyncStorage when screen is focused
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const schedules = await getAllSchedules(); // Gunakan function dari storage
      
      // Convert string dates back to Date objects untuk display
      const schedulesWithDates = schedules.map((item) => ({
        ...item,
        startDate: new Date(item.startDate),
        endDate: new Date(item.endDate),
        alarmTimes: item.alarmTimes.map((t: string) => new Date(t)),
      })) as MedicineSchedule[];
      
      setSavedSchedules(schedulesWithDates);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete schedule 
  const handleDeleteSchedule = (schedule: MedicineSchedule) => {
    const doctorInfo = schedule.doctorName ? ` (diresepkan oleh Dr. ${schedule.doctorName})` : '';
    
    Alert.alert(
      t('medicine.deleteTitle'),
      `${t('medicine.deleteMessage', { medicineName: schedule.medicineName, doctorInfo })}`,
      [
        {
          text: t('common.cancel'),
          style: "cancel",
        },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: () => confirmDeleteSchedule(schedule.id),
        },
      ]
    );
  };

  // Actually delete the schedule
  const confirmDeleteSchedule = async (scheduleId: string) => {
    try {
      console.log('Attempting to delete schedule:', scheduleId);
      setDeletingId(scheduleId);
      
      await deleteSchedule(scheduleId);
      console.log('Schedule deleted successfully');
      
      // Update local state
      setSavedSchedules(prevSchedules => {
        const filtered = prevSchedules.filter(schedule => schedule.id !== scheduleId);
        console.log('Updated schedules count:', filtered.length);
        return filtered;
      });
      
      Alert.alert(t('medicine.deleteSuccessTitle'), t('medicine.deleteSuccessMessage'));
    } catch (error) {
      console.error("Error deleting schedule:", error);
      Alert.alert(t('medicine.deleteErrorTitle'), t('medicine.deleteErrorMessage'));
    } finally {
      setDeletingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  const renderScheduleCard = ({ item }: { item: MedicineSchedule }) => {
    // Pastikan alarmTimes adalah Date objects
    const alarmTimes = item.alarmTimes.map(time => 
      time instanceof Date ? time : new Date(time)
    );
    
    const isDeleting = deletingId === item.id;
    
    return (
      <View style={styles.scheduleCard}>
        {item.medicineImage && (
          <Image source={{ uri: item.medicineImage }} style={styles.scheduleImage} />
        )}
        <View style={styles.scheduleContent}>
          <View style={styles.scheduleHeader}>
            <View style={styles.scheduleHeaderLeft}>
              <Text style={styles.scheduleName}>{item.medicineName}</Text>
              <Text style={styles.scheduleType}>
                {item.medicineType} • {item.disease}
              </Text>
              {item.doctorName && (
              <Text style={styles.scheduleDoctorName}>
                 Dr. {item.doctorName}
              </Text>
              )}
            </View>
            
            {/* Delete Button */}
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
              onPress={() => handleDeleteSchedule(item)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.scheduleDosage}>
            {item.dosageAmount} {item.dosageUnit} • {item.timesPerDay}x sehari
          </Text>
          <Text style={styles.scheduleTime}>{item.usageTime}</Text>
  
          <View style={styles.scheduleAlarms}>
            {alarmTimes.slice(0, item.timesPerDay).map((time, index) => (
              <View key={index} style={styles.alarmBadge}>
                <Text style={styles.alarmBadgeText}>
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            ))}
          </View>
  
          {item.mustFinish && (
            <View style={styles.mustFinishBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#34C759" />
              <Text style={styles.mustFinishText}>{t('medicine.mustFinish')}</Text>
            </View>
          )}
  
          <Text style={styles.scheduleDates}>
            {(item.startDate instanceof Date ? item.startDate : new Date(item.startDate)).toLocaleDateString("id-ID")} -{" "}
            {(item.endDate instanceof Date ? item.endDate : new Date(item.endDate)).toLocaleDateString("id-ID")}
          </Text>
  
          {item.notes && <Text style={styles.scheduleNotes}>{item.notes}</Text>}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="medical-outline" size={80} color="#C7C7CC" />
      </View>
      <Text style={styles.emptyStateTitle}>{t('medicine.emptyStateTitle')}</Text>
      <Text style={styles.emptyStateSubtitle}>
        {t('medicine.emptyStateSubtitle')}
      </Text>
      <TouchableOpacity style={styles.createButtonLarge} onPress={navigateToCreateSchedule}>
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.createButtonLargeText}>{t('medicine.createFirstSchedule')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('medicine.title')}</Text>
          <Text style={styles.subtitle}>{savedSchedules.length} {t('medicine.savedSchedules')}</Text>
        </View>

        {/* Create Button - Always visible */}
        <TouchableOpacity style={styles.createButton} onPress={navigateToCreateSchedule}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {savedSchedules.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedSchedules.length}</Text>
                <Text style={styles.statLabel}>{t('medicine.totalMedicine')}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {savedSchedules.filter((s) => s.mustFinish).length}
                </Text>
                <Text style={styles.statLabel}>{t('medicine.mustFinishCount')}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {savedSchedules.reduce((total, s) => total + s.timesPerDay, 0)}
                </Text>
                <Text style={styles.statLabel}>{t('medicine.alarmsPerDay')}</Text>
              </View>
            </View>

            {/* Schedule List */}
            <FlatList
              data={savedSchedules}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={renderScheduleCard}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#007AFF",
  },
  headerContent: {},
  title: { fontSize: 24, fontWeight: "700", color: "white" },
  subtitle: { fontSize: 14, color: "white", marginTop: 4 },
  createButton: {
    backgroundColor: "#005BBB",
    padding: 8,
    borderRadius: 8,
  },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  listContainer: { paddingBottom: 100 },
  scheduleCard: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  scheduleImage: {
    width: width * 0.25,
    height: 100,
  },
  scheduleContent: {
    flex: 1,
    padding: 12,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  scheduleHeaderLeft: {
    flex: 1,
  },
  scheduleName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  scheduleType: { fontSize: 14, color: "#666", marginBottom: 4 },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#FFEBEE",
    marginLeft: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  scheduleDoctorName: { 
    fontSize: 13, 
    color: "#34C759", 
    marginBottom: 4,
    fontWeight: "500"
  },
  scheduleDosage: { fontSize: 14, marginBottom: 4 },
  scheduleTime: { fontSize: 14, marginBottom: 4, color: "#007AFF" },
  scheduleAlarms: { flexDirection: "row", marginBottom: 8 },
  alarmBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  alarmBadgeText: { color: "white", fontWeight: "600", fontSize: 12 },
  mustFinishBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  mustFinishText: { marginLeft: 6, color: "#34C759", fontWeight: "600" },
  scheduleDates: { fontSize: 12, color: "#999", marginBottom: 4 },
  scheduleNotes: { fontSize: 12, color: "#444" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: { marginBottom: 24 },
  emptyStateTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  emptyStateSubtitle: { fontSize: 14, color: "#777", textAlign: "center", marginBottom: 24 },
  createButtonLarge: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  createButtonLargeText: { color: "white", fontWeight: "700", fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: "white",
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: "700", color: "#007AFF" },
  statLabel: { fontSize: 12, color: "#444", marginTop: 4 },
});
