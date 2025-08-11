import React from "react";
import { Platform, View, StyleSheet, Text } from "react-native";

type PickerItem = {
  label: string;
  value: string;
};

type Props = {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  label?: string; // untuk aksesibilitas
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
          title={label || "Select an option"}
          value={selectedValue}
          onChange={(e) => onValueChange(e.target.value)}
          style={styles.webSelect as React.CSSProperties}
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  return (
    <View style={styles.nativeFallback}>
      <Text>Pilihannya cuma tersedia di web untuk sekarang</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: "100%",
  },
  webSelect: {
    height: 40,
    fontSize: 16,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
  },
  nativeFallback: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
});
