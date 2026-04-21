import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  color?: string;
  bgColor?: string;
}

export default function StatusBadge({ label, color = "#27AE60", bgColor }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor || color + "22" }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 11, fontWeight: "700" },
});
