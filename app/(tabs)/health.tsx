import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import i18n from "../../app/utils/i18n";
import LansiaText from "../../components/ui/LansiaText";

interface CustomTip {
  id: string;
  tip: string;
  showOnHome?: boolean;
}

export default function HealthPage() {
  const healthyTips = [
    { id: "h1", tip: i18n.translate("healthPage.healthy.tip1"), showOnHome: false },
    { id: "h2", tip: i18n.translate("healthPage.healthy.tip2"), showOnHome: false },
    { id: "h3", tip: i18n.translate("healthPage.healthy.tip3"), showOnHome: false },
    { id: "h4", tip: i18n.translate("healthPage.healthy.tip4"), showOnHome: false },
    { id: "h5", tip: i18n.translate("healthPage.healthy.tip5"), showOnHome: false },
  ];

  const sickTips = [
    { id: "s1", tip: i18n.translate("healthPage.sick.tip1"), showOnHome: false },
    { id: "s2", tip: i18n.translate("healthPage.sick.tip2"), showOnHome: false },
    { id: "s3", tip: i18n.translate("healthPage.sick.tip3"), showOnHome: false },
    { id: "s4", tip: i18n.translate("healthPage.sick.tip4"), showOnHome: false },
    { id: "s5", tip: i18n.translate("healthPage.sick.tip5"), showOnHome: false },
  ];

  const [condition, setCondition] = useState<"healthy" | "sick" | null>(null);
  const [defaultTips, setDefaultTips] = useState<{ healthy: typeof healthyTips; sick: typeof sickTips }>({
    healthy: healthyTips,
    sick: sickTips,
  });
  const [customTips, setCustomTips] = useState<{ healthy: CustomTip[]; sick: CustomTip[] }>({
    healthy: [],
    sick: [],
  });

  const [newTip, setNewTip] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Load data dari AsyncStorage
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("customTipsByCondition");
      if (saved) setCustomTips(JSON.parse(saved));

      const savedCondition = await AsyncStorage.getItem("healthCondition");
      if (savedCondition) setCondition(savedCondition as "healthy" | "sick");

      const savedDefaultTips = await AsyncStorage.getItem("defaultHealthTips");
      if (savedDefaultTips) setDefaultTips(JSON.parse(savedDefaultTips));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("customTipsByCondition", JSON.stringify(customTips));
  }, [customTips]);

  useEffect(() => {
    if (condition) {
      AsyncStorage.setItem("healthCondition", condition);
    }
  }, [condition]);

  useEffect(() => {
    AsyncStorage.setItem("defaultHealthTips", JSON.stringify(defaultTips));
  }, [defaultTips]);

  const addCustomTip = () => {
    if (newTip.trim() !== "" && condition) {
      const newCustom: CustomTip = {
        id: Date.now().toString(),
        tip: newTip,
        showOnHome: false,
      };
      setCustomTips((prev) => ({
        ...prev,
        [condition]: [...prev[condition], newCustom],
      }));
      setNewTip("");
      setIsAdding(false);
    }
  };

  const deleteCustomTip = (tipId: string) => {
    if (!condition) return;
    setCustomTips((prev) => ({
      ...prev,
      [condition]: prev[condition].filter((tip) => tip.id !== tipId),
    }));
  };

  const toggleDefaultTipHome = (tipId: string) => {
    if (!condition) return;
    setDefaultTips((prev) => ({
      ...prev,
      [condition]: prev[condition].map((tip) =>
        tip.id === tipId ? { ...tip, showOnHome: !tip.showOnHome } : tip
      ),
    }));
  };

  const toggleCustomTipHome = (tipId: string) => {
    if (!condition) return;
    setCustomTips((prev) => ({
      ...prev,
      [condition]: prev[condition].map((tip) =>
        tip.id === tipId ? { ...tip, showOnHome: !tip.showOnHome } : tip
      ),
    }));
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        {/* Pertanyaan kondisi */}
        {condition === null ? (
          <View>
            <LansiaText style={styles.title}>{i18n.translate("healthPage.askCondition")}</LansiaText>
            <View style={styles.switchContainer}>
              <Pressable
                style={[styles.typeButton, styles.typeActive]}
                onPress={() => setCondition("healthy")}
              >
                <LansiaText style={styles.typeText}>{i18n.translate("healthPage.healthyLabel")}</LansiaText>
              </Pressable>
              <Pressable
                style={[styles.typeButton, styles.typeActive]}
                onPress={() => setCondition("sick")}
              >
                <LansiaText style={styles.typeText}>{i18n.translate("healthPage.sickLabel")}</LansiaText>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {/* Tips utama sesuai kondisi */}
            <LansiaText style={styles.title}>
              {condition === "healthy"
                ? i18n.translate("healthPage.tipsHealthyTitle")
                : i18n.translate("healthPage.tipsSickTitle")}
            </LansiaText>
            {defaultTips[condition].map((tip) => (
              <View key={tip.id} style={styles.tipCard}>
                <View style={styles.tipContent}>
                  <LansiaText style={styles.tipText}>{tip.tip}</LansiaText>
                  <Pressable
                    style={[styles.homeToggle, tip.showOnHome && styles.homeToggleActive]}
                    onPress={() => toggleDefaultTipHome(tip.id)}
                  >
                    <LansiaText style={[styles.homeToggleText, tip.showOnHome && styles.homeToggleTextActive]}>
                      {tip.showOnHome
                        ? i18n.translate("healthPage.homeSelected")
                        : i18n.translate("healthPage.home")}
                    </LansiaText>
                  </Pressable>
                </View>
              </View>
            ))}

            {/* Tombol ganti kondisi */}
            <Pressable style={styles.changeButton} onPress={() => setCondition(null)}>
              <LansiaText style={styles.changeButtonText}>
                {i18n.translate("healthPage.changeCondition")}
              </LansiaText>
            </Pressable>

            {/* Daftar tips tambahan */}
            <LansiaText style={styles.title}>{i18n.translate("healthPage.additionalTips")}</LansiaText>
            {customTips[condition].map((item) => (
              <View key={item.id} style={styles.scheduleCard}>
                <View style={styles.tipContent}>
                  <LansiaText style={styles.scheduleText}>{item.tip}</LansiaText>

                  {/* Tombol toggle home */}
                  <Pressable
                    style={[styles.homeToggle, item.showOnHome && styles.homeToggleActive]}
                    onPress={() => toggleCustomTipHome(item.id)}
                  >
                    <LansiaText style={[styles.homeToggleText, item.showOnHome && styles.homeToggleTextActive]}>
                      {item.showOnHome
                        ? i18n.translate("healthPage.homeSelected")
                        : i18n.translate("healthPage.home")}
                    </LansiaText>
                  </Pressable>

                  {/* Tombol delete */}
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteCustomTip(item.id)}
                  >
                    <LansiaText style={styles.deleteButtonText}>
                      {i18n.translate("healthPage.delete") || "Delete"}
                    </LansiaText>
                  </Pressable>
                </View>
              </View>
            ))}

            {/* Input tambah tips */}
            {isAdding ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={i18n.translate("healthPage.inputPlaceholder")}
                  value={newTip}
                  onChangeText={setNewTip}
                  autoFocus
                />
                <Pressable style={styles.button} onPress={addCustomTip}>
                  <LansiaText style={styles.buttonText}>{i18n.translate("healthPage.save")}</LansiaText>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.addButton} onPress={() => setIsAdding(true)}>
                <LansiaText style={styles.addButtonText}>+ {i18n.translate("healthPage.addTip")}</LansiaText>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F2F2F7" },
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: "700", marginVertical: 20, color: "#1D1D1F" },
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
  tipContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  tipText: { fontSize: 16, color: "#333333", flex: 1, marginRight: 12 },
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
  scheduleText: { fontSize: 16, color: "#333333", flex: 1, marginRight: 12 },
  homeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "transparent",
  },
  homeToggleActive: {
    backgroundColor: "#007AFF",
  },
  homeToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  homeToggleTextActive: {
    color: "#FFFFFF",
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF3B30",
    backgroundColor: "transparent",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3B30",
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
  switchContainer: { flexDirection: "row", marginBottom: 8 },
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
  typeActive: { backgroundColor: "#007AFF" },
  typeText: { color: "#FFF", fontWeight: "600" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
  changeButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FF9500",
    alignItems: "center",
  },
  changeButtonText: { color: "#FFF", fontWeight: "600" },
  addButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#34C759",
    alignItems: "center",
  },
  addButtonText: { color: "#FFF", fontWeight: "700" },
});
