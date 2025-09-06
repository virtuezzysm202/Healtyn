import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileOnline() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Online</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18, 
    fontWeight: "700",
    color: "#1a202c",
    textAlign: "center",
    flex: 1, 
    marginRight: 40, 
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});