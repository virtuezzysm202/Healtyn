import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import i18n from "../app/utils/i18n";

type PickerItem = {
  label: string;
  value: string;
};

type Props = {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  label?: string;
};

export default function AdaptivePicker({ selectedValue, onValueChange, items, label }: Props) {
  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        {label && (
          <label htmlFor="adaptive-picker" style={{ display: "block", marginBottom: 4 }}>
            {label}
          </label>
        )}
        <select
          id="adaptive-picker"
          title={label || i18n.translate("common.select")}
          value={selectedValue}
          onChange={(e) => onValueChange(e.target.value)}
          style={styles.webSelect as React.CSSProperties}
        >
          <option value="">{i18n.translate("common.select")}</option>
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  // Android & iOS
  return (
    <View style={styles.nativeContainer}>
      {label && <Text style={styles.nativeLabel}>{label}</Text>}
      <Picker
        selectedValue={selectedValue}
        onValueChange={(value) => onValueChange(value)}
        style={styles.nativePicker}
      >
        <Picker.Item label={i18n.translate("common.select")} value="" />
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: { width: "100%" },
  webSelect: {
    height: 40,
    fontSize: 16,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
  },
  nativeContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  nativeLabel: { fontWeight: "600", fontSize: 14, marginBottom: 4, color: "#333" },
  nativePicker: { height: 50, width: "100%" },
});
