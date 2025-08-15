import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import LansiaText from "../../components/ui/LansiaText";


interface Schedule {
  id: string;
  activity: string;
  time: string;
  type: "water" | "workout";
}

export default function HealthPage() {
  const tips = [
    "💧 Minum air putih minimal 8 gelas sehari",
    "😷 Gunakan masker saat berada di luar rumah",
    "🥗 Konsumsi makanan bergizi dan seimbang",
    "🏃‍♂️ Lakukan olahraga ringan secara rutin",
    "🛌 Cukup tidur dan istirahat yang cukup",
  ];

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activity, setActivity] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"water" | "workout">("water");

  // Load jadwal dari AsyncStorage
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("healthSchedules");
      if (saved) setSchedules(JSON.parse(saved));
    })();
  }, []);

  // Simpan jadwal ke AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem("healthSchedules", JSON.stringify(schedules));
  }, [schedules]);

  const addSchedule = () => {
    if (activity.trim() !== "" && time.trim() !== "") {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        activity,
        time,
        type,
      };
      setSchedules([...schedules, newSchedule]);
      setActivity("");
      setTime("");
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        {/* Bagian Tips */}
        <LansiaText style={styles.title}>Tips Kesehatan</LansiaText>
        {tips.map((tip, idx) => (
          <View key={idx} style={styles.tipCard}>
            <LansiaText style={styles.tipText}>{tip}</LansiaText>
          </View>
        ))}

        {/* Bagian Jadwal Minum Air & Workout */}
        <LansiaText style={styles.title}>Jadwal Kesehatan</LansiaText>
        {schedules.map((item) => (
          <View key={item.id} style={styles.scheduleCard}>
            <LansiaText style={styles.scheduleText}>
              {item.type === "water" ? "💧" : "🏋️‍♂️"} {item.time} - {item.activity}
            </LansiaText>
          </View>
        ))}
      </ScrollView>

      {/* Input tambah jadwal */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Kegiatan (contoh: Minum Air, Jogging)"
          value={activity}
          onChangeText={setActivity}
        />
        <TextInput
          style={styles.input}
          placeholder="Jam (contoh: 09:00)"
          value={time}
          onChangeText={setTime}
        />

        {/* Pilihan jenis jadwal */}
        <View style={styles.switchContainer}>
          <Pressable
            style={[styles.typeButton, type === "water" && styles.typeActive]}
            onPress={() => setType("water")}
          >
            <LansiaText style={styles.typeText}>Air Putih</LansiaText>
          </Pressable>
          <Pressable
            style={[styles.typeButton, type === "workout" && styles.typeActive]}
            onPress={() => setType("workout")}
          >
            <LansiaText style={styles.typeText}>Workout</LansiaText>
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={addSchedule}>
          <LansiaText style={styles.buttonText}>Tambah Jadwal</LansiaText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 20,
    color: "#1D1D1F",
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tipText: {
    fontSize: 16,
    color: "#333333",
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleText: {
    fontSize: 16,
    color: "#333333",
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: "#F9F9F9",
  },
  switchContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  typeActive: {
    backgroundColor: "#007AFF",
  },
  typeText: {
    color: "#1D1D1F",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
