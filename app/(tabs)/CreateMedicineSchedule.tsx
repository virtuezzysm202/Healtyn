import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import i18n from "../../utils/i18n";


import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AdaptivePicker from "../../components/AdaptivePicker";

const { width } = Dimensions.get("window");

// Setup notifikasi handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface MedicineSchedule {
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
  alarmTimes: Date[];
  mustFinish: boolean;
  startDate: Date;
  endDate: Date;
  medicineImage?: string;
  doctorName?: string;
}

interface CreateMedicineScheduleProps {
  navigation: any;
}


export default function CreateMedicineSchedule({ navigation }: CreateMedicineScheduleProps) {
  const [medicineName, setMedicineName] = useState("");
  const [medicineType, setMedicineType] = useState("");
  const [disease, setDisease] = useState("");
  const [medicineForm, setMedicineForm] = useState("");
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState("");
  const [spoonSize, setSpoonSize] = useState("");
  const [notes, setNotes] = useState("");
  const [usageTime, setUsageTime] = useState("");
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [mustFinish, setMustFinish] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [otherMedicineType, setOtherMedicineType] = useState("");
  const [otherDisease, setOtherDisease] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const router = useRouter();

  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // Default 7 days from today
    return tomorrow;
  });
  const [medicineImage, setMedicineImage] = useState<string | null>(null);
  const [alarmTimes, setAlarmTimes] = useState([new Date()]);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const medicineTypes = [
    { label: i18n.translate("createMedicine.medicineTypes.antibiotics"), value: "antibiotik" },
    { label: i18n.translate("createMedicine.medicineTypes.analgesics"), value: "analgesik" },
    { label: i18n.translate("createMedicine.medicineTypes.antiInflammatory"), value: "antiinflamasi" },
    { label: i18n.translate("createMedicine.medicineTypes.antacids"), value: "antasada" },
    { label: i18n.translate("createMedicine.medicineTypes.vitamins"), value: "vitamin" },
    { label: i18n.translate("createMedicine.medicineTypes.supplements"), value: "suplemen" },
    { label: i18n.translate("createMedicine.medicineTypes.herbal"), value: "herbal" },
    { label: i18n.translate("createMedicine.medicineTypes.others"), value: "lainnya" },
  ];

  const diseases = [
    { label: i18n.translate("createMedicine.diseases.fever"), value: "demam" },
    { label: i18n.translate("createMedicine.diseases.cough"), value: "batuk" },
    { label: i18n.translate("createMedicine.diseases.flu"), value: "flu" },
    { label: i18n.translate("createMedicine.diseases.headache"), value: "sakit_kepala" },
    { label: i18n.translate("createMedicine.diseases.diarrhea"), value: "diare" },
    { label: i18n.translate("createMedicine.diseases.gastritis"), value: "maag" },
    { label: i18n.translate("createMedicine.diseases.hypertension"), value: "hipertensi" },
    { label: i18n.translate("createMedicine.diseases.diabetes"), value: "diabetes" },
    { label: i18n.translate("createMedicine.diseases.asthma"), value: "asma" },
    { label: i18n.translate("createMedicine.diseases.allergy"), value: "alergi" },
    { label: i18n.translate("createMedicine.diseases.others"), value: "lainnya" },
  ];

  const medicineForms = [
    { label: i18n.translate("createMedicine.medicineForms.tablet"), value: "tablet" },
    { label: i18n.translate("createMedicine.medicineForms.capsule"), value: "kapsul" },
    { label: i18n.translate("createMedicine.medicineForms.syrup"), value: "sirup" },
    { label: i18n.translate("createMedicine.medicineForms.drops"), value: "tetes" },
    { label: i18n.translate("createMedicine.medicineForms.ointment"), value: "salep" },
    { label: i18n.translate("createMedicine.medicineForms.inhaler"), value: "inhaler" },
    { label: i18n.translate("createMedicine.medicineForms.injection"), value: "injection" },
    { label: i18n.translate("createMedicine.medicineForms.powder"), value: "bubuk" },
  ];

  const spoonSizes = [
    { label: i18n.translate("createMedicine.spoonSizes.teaspoon"), value: "sendok_teh" },
    { label: i18n.translate("createMedicine.spoonSizes.tablespoon"), value: "sendok_makan" },
    { label: i18n.translate("createMedicine.spoonSizes.measuring"), value: "sendok_takar" },
  ];

  const resetForm = () => {
    setMedicineName("");
    setMedicineType("");
    setDisease("");
    setMedicineForm("");
    setDosageAmount("");
    setDosageUnit("");
    setSpoonSize("");
    setNotes("");
    setUsageTime("");
    setTimesPerDay(1);
    setMustFinish(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setMedicineImage(null);
    setAlarmTimes([new Date()]);
    setStartDate(new Date());
    setDoctorName("");
  };

  useEffect(() => {
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 7);
    setEndDate(newEndDate);
  }, []);

  const handleTimesPerDayChange = (times: number) => {
    setTimesPerDay(times);
    const newAlarmTimes: Date[] = [];
    for (let i = 0; i < times; i++) {
      const time = new Date();
      time.setHours(8 + i * 4, 0, 0, 0);
      newAlarmTimes.push(time);
    }
    setAlarmTimes(newAlarmTimes);
  };


  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      // Auto-adjust end date if it's before start date
      if (selectedDate > endDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(newEndDate.getDate() + 7);
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert(
          i18n.translate("createMedicine.alerts.error"), 
          i18n.translate("createMedicine.alerts.endDateError")
        );
      }
    }
  };

  const calculateDuration = () => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        i18n.translate("createMedicine.alerts.permissionRequired"), 
        i18n.translate("createMedicine.alerts.galleryPermission")
      );
      return;
    }
  
    Alert.alert(
      i18n.translate("createMedicine.photo.selectTitle"), 
      i18n.translate("createMedicine.photo.selectMessage"), 
      [
        { text: i18n.translate("createMedicine.photo.camera"), onPress: openCamera },
        { text: i18n.translate("createMedicine.photo.gallery"), onPress: openGallery },
        { text: i18n.translate("common.cancel"), style: "cancel" },
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        i18n.translate("createMedicine.alerts.permissionRequired"), 
        i18n.translate("createMedicine.alerts.galleryPermission")
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedicineImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedicineImage(result.assets[0].uri);
    }
  };

  const saveMedicineSchedule = async () => {
    const errorTitle = i18n.translate("createMedicine.alerts.error");
    
    if (!medicineName.trim()) return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.medicineNameRequired"));
    if (!medicineType.trim()) return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.medicineTypeRequired"));
    if (medicineType === "lainnya" && !otherMedicineType.trim()) {
      return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.otherMedicineTypeRequired"));
    }
    if (!disease.trim()) return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.diseaseRequired"));
    if (disease === "lainnya" && !otherDisease.trim()) {
      return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.otherDiseaseRequired"));
    }
    if (!medicineForm.trim()) return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.medicineFormRequired"));
    if (!dosageAmount.trim()) return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.dosageRequired"));
    if (!usageTime.trim()) return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.usageTimeRequired"));
    if (endDate <= startDate) {
      return Alert.alert(errorTitle, i18n.translate("createMedicine.alerts.validationErrors.endDateAfterStart"));
    }

    const newSchedule: MedicineSchedule = {
      id: Date.now().toString(),
      medicineName,
      medicineType: medicineType === "lainnya" ? otherMedicineType : medicineType,
      disease: disease === "lainnya" ? otherDisease : disease,
      medicineForm,
      dosageAmount,
      dosageUnit,
      spoonSize,
      notes,
      usageTime,
      timesPerDay,
      alarmTimes: [...alarmTimes],
      mustFinish,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      medicineImage: medicineImage || undefined,
      doctorName: doctorName.trim() || undefined,
    };
    

    try {
      const existingSchedules = await AsyncStorage.getItem("medicineSchedules");
      const schedules = existingSchedules ? JSON.parse(existingSchedules) : [];
      schedules.push(newSchedule);
      await AsyncStorage.setItem("medicineSchedules", JSON.stringify(schedules));
      await scheduleNotifications(newSchedule);

      Alert.alert(i18n.translate("createMedicine.alerts.success"), i18n.translate("createMedicine.alerts.successMessage"), [
        {
          text: i18n.translate("createMedicine.common.ok"),
          onPress: () => {
            resetForm();
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(i18n.translate("createMedicine.alerts.error"), i18n.translate("createMedicine.alerts.saveError"));
}
  };

  const scheduleNotifications = async (schedule: MedicineSchedule) => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        i18n.translate("createMedicine.alerts.permissionRequired"), 
        i18n.translate("createMedicine.alerts.notificationPermission")
      );
      return;
    }
  
    try {
      for (let i = 0; i < schedule.alarmTimes.length; i++) {
        const alarmTime = schedule.alarmTimes[i];
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: i18n.translate("createMedicine.notifications.title"),
            body: i18n.translate("createMedicine.notifications.body", {
              medicineName: schedule.medicineName,
              dosage: schedule.dosageAmount,
              unit: schedule.dosageUnit
            }),
            data: { medicineId: schedule.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: alarmTime.getHours(),
            minute: alarmTime.getMinutes(),
            repeats: true,
          },
        });
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  };
  
  const renderDosageInput = () => {
    if (medicineForm === "tablet" || medicineForm === "kapsul") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.dosage.tabletCapsule.label")}</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="medical" size={20} color="#007AFF" />
            <TextInput
              style={styles.input}
              placeholder={i18n.translate("createMedicine.dosage.tabletCapsule.placeholder")}
              keyboardType="numeric"
              value={dosageAmount}
              onChangeText={(text) => {
                setDosageAmount(text);
                setDosageUnit(medicineForm);
              }}
              placeholderTextColor="#C7C7CC"
            />
            <Text style={styles.unitText}>{medicineForm}</Text>
          </View>
        </View>
      );
    } else if (medicineForm === "sirup" || medicineForm === "tetes") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.dosage.tabletCapsule.label")}</Text>
          <View style={styles.dosageContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="water" size={20} color="#007AFF" />
              <TextInput
                style={styles.input}
                placeholder="Jumlah (contoh: 1, 2, 0.5)"
                keyboardType="numeric"
                value={dosageAmount}
                onChangeText={setDosageAmount}
                placeholderTextColor="#C7C7CC"
              />
            </View>

            <View style={styles.pickerWrapper}>
              <AdaptivePicker
                label={i18n.translate("createMedicine.spoonSizes.label")}
                selectedValue={spoonSize}
                onValueChange={(value) => {
                  setSpoonSize(value);
                  const selectedSpoon = spoonSizes.find((s) => s.value === value);
                  setDosageUnit(selectedSpoon?.label || "sendok");
                }}
                items={spoonSizes}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="flask" size={20} color="#007AFF" />
              <TextInput
                style={styles.input}
                placeholder={i18n.translate("createMedicine.dosage.syrupDrops.mlPlaceholder")}
                keyboardType="numeric"
                placeholderTextColor="#C7C7CC"
              />
              <Text style={styles.unitText}>{i18n.translate("createMedicine.common.ml")}</Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.section}>
            <Text style={styles.sectionLabel}>
    {i18n.translate("createMedicine.dosage.singleUse")}
  </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="medical" size={20} color="#007AFF" />
            <TextInput
              style={styles.input}
              placeholder={i18n.translate("createMedicine.dosage.general.placeholder")}
              value={dosageAmount}
              onChangeText={(text) => {
                setDosageAmount(text);
                setDosageUnit("");
              }}
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>
      );
    }
  };

  const renderTimesPerDaySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.frequency.label")}</Text>
      <View style={styles.frequencyContainer}>
        {[1, 2, 3, 4, 5, 6].map((times) => (
          <TouchableOpacity
            key={times}
            style={[
              styles.frequencyButton,
              timesPerDay === times && styles.frequencyButtonActive,
            ]}
            onPress={() => handleTimesPerDayChange(times)}
          >
            <Text
              style={[
                styles.frequencyButtonText,
                timesPerDay === times && styles.frequencyButtonTextActive,
              ]}
            >
              {times}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAlarmTimes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.alarmTimes.label", { count: timesPerDay.toString() })}</Text>
      {alarmTimes.slice(0, timesPerDay).map((time, index) => (
        <View key={index} style={styles.alarmTimeContainer}>
          <View style={styles.timeDisplayContainer}>
            <View style={styles.timeIcon}>
              <Ionicons name="time" size={18} color="#007AFF" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Text style={styles.timeSubtext}>
  {i18n.translate("createMedicine.alarmTimes.reminderNumber", { number: (index + 1).toString() })}
</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDatePickerSection = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.dates.startDate.label")}</Text>
        <TouchableOpacity
          style={styles.datePickerContainer}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#007AFF" />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Text style={styles.dateSubtext}>{i18n.translate("createMedicine.dates.startDate.tapToChange")}</Text>
            {/* HAPUS duplikasi text yang kedua */}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>
  
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.dates.endDate.label")}</Text>
        <TouchableOpacity
          style={styles.datePickerContainer}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#007AFF" />
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <Text style={styles.dateSubtext}>{i18n.translate("createMedicine.dates.endDate.tapToChange")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>
  
      <View style={styles.section}>
        <View style={styles.durationContainer}>
          <Ionicons name="time" size={20} color="#28a745" />
          <Text style={styles.durationText}>
            {i18n.translate("createMedicine.dates.duration", { days: calculateDuration().toString() })}
          </Text>
        </View>
      </View>
  
      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}
  
      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
          minimumDate={startDate}
        />
      )}
    </>
  );
  return (
    
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F5F5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.section}>
        <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.medicineName.label")}</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="medkit" size={20} color="#007AFF" />
            <TextInput
              style={styles.input}
              placeholder={i18n.translate("createMedicine.medicineName.placeholder")}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>

        <View style={styles.section}>
        <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.doctorName.label")}</Text>
        <View style={styles.inputContainer}>
        <Ionicons name="person" size={20} color="#007AFF" />
        <TextInput
            style={styles.input}
            placeholder={i18n.translate("createMedicine.doctorName.placeholder")}
            value={doctorName}
            onChangeText={setDoctorName}
            placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>
        

        <View style={styles.section}>
        <AdaptivePicker
            label={i18n.translate("createMedicine.medicineTypes.label")}
            selectedValue={medicineType}
            onValueChange={setMedicineType}
            items={medicineTypes}
          />
            {medicineType === "lainnya" && (
            <View style={styles.inputContainer}>
            <Ionicons name="create" size={20} color="#007AFF" />
            <TextInput
                style={styles.input}
                placeholder={i18n.translate("createMedicine.medicineTypes.otherPlaceholder")}
                value={otherMedicineType}
                onChangeText={setOtherMedicineType}
                placeholderTextColor="#C7C7CC"
          />
          </View>
          )}
        </View>


        <View style={styles.section}>
            <AdaptivePicker
              label={i18n.translate("createMedicine.diseases.label")}
              selectedValue={disease}
              onValueChange={setDisease}
              items={diseases}
            />
            {disease === "lainnya" && (
              <View style={styles.inputContainer}>
              <Ionicons name="create" size={20} color="#007AFF" />
              <TextInput
                  style={styles.input}
                  placeholder={i18n.translate("createMedicine.diseases.otherPlaceholder")}
                  value={otherDisease}
                  onChangeText={setOtherDisease}
                  placeholderTextColor="#C7C7CC"
            />
            </View>
            )}
          </View>

        <View style={styles.section}>
          <AdaptivePicker
            label={i18n.translate("createMedicine.medicineForms.label")}
            selectedValue={medicineForm}
            onValueChange={setMedicineForm}
            items={medicineForms}
          />
        </View>

        {renderDosageInput()}

        <View style={styles.section}>
        <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.usageTime.label")}</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="time" size={20} color="#007AFF" />
            <TextInput
              style={styles.input}
              placeholder={i18n.translate("createMedicine.usageTime.placeholder")}
              value={usageTime}
              onChangeText={setUsageTime}
              placeholderTextColor="#C7C7CC"
            />
          </View>
        </View>

        {renderTimesPerDaySelector()}

        {renderAlarmTimes()}

        {renderDatePickerSection()}

        <View style={styles.section}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={pickImage}>
  <Text style={styles.buttonPrimaryText}>{i18n.translate("createMedicine.photo.selectButton")}</Text>
</TouchableOpacity>
          {medicineImage && (
            <View style={{ marginTop: 10, alignItems: "center" }}>
              <Text style={{ color: "#333" }}>{i18n.translate("createMedicine.photo.selected")}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
        <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.notes.label")}</Text>
  <View style={styles.inputContainer}>
    <Ionicons name="create" size={20} color="#007AFF" />
    <TextInput
      style={styles.input}
      placeholder={i18n.translate("createMedicine.notes.placeholder")}
      value={notes}
      onChangeText={setNotes}
      placeholderTextColor="#C7C7CC"
      multiline
    />
  </View>
</View>

<View style={styles.section}>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
  <Text style={styles.sectionLabel}>{i18n.translate("createMedicine.mustFinish.label")}</Text>
    <Switch
      value={mustFinish}
      onValueChange={setMustFinish}
      trackColor={{ false: "#ccc", true: "#007AFF" }}
      thumbColor={mustFinish ? "#fff" : "#f4f3f4"}
    />
  </View>
</View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.buttonSuccess} onPress={saveMedicineSchedule}>
          <Text style={styles.buttonPrimaryText}>{i18n.translate("createMedicine.saveButton")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  

  
}

const styles = StyleSheet.create({
  section: { marginVertical: 12, paddingHorizontal: 16 },
  sectionLabel: { fontWeight: "600", fontSize: 16, marginBottom: 6, color: "#333" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  input: { flex: 1, marginLeft: 10, color: "#000", fontSize: 16 },
  unitText: { marginLeft: 10, fontWeight: "500", color: "#007AFF" },
  pickerWrapper: { marginTop: 8 },
  dosageContainer: { flexDirection: "column", gap: 8 },
  frequencyContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  frequencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  frequencyButtonActive: { backgroundColor: "#007AFF" },
  frequencyButtonText: { color: "#007AFF", fontWeight: "500" },
  frequencyButtonTextActive: { color: "#fff" },
  alarmTimeContainer: { flexDirection: "column", marginVertical: 6, paddingHorizontal: 16 },
  timeDisplayContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  timeIcon: { marginRight: 10 },
  timeInfo: { flexDirection: "column" },
  timeText: { fontSize: 16, fontWeight: "600" },
  timeSubtext: { fontSize: 12, color: "#777" },
  buttonPrimary: { backgroundColor: "#007AFF", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonSuccess: { backgroundColor: "#28a745", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 16 },

    datePickerContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      padding: 12,
      backgroundColor: "#fff",
      marginBottom: 8,
    },
    dateTextContainer: {
      flex: 1,
      marginLeft: 10,
    },
    dateText: {
      fontSize: 16,
      color: "#000",
      fontWeight: "500",
    },
    dateSubtext: {
      fontSize: 12,
      color: "#777",
      marginTop: 2,
    },
    durationContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E8F5E8",
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
    },
    durationText: {
      marginLeft: 8,
      fontSize: 14,
      color: "#28a745",
      fontWeight: "500",
    },
  });

