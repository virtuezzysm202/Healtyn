import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import React from 'react'

type Props = {
  title: string
  onPress: () => void
  style?: ViewStyle // ✅ tambahkan ini
}

export default function LansiaButton({ title, onPress, style }: Props) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#003366', // default navy
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
})
