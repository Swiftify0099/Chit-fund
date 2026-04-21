import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  suffix?: string;
}

export default function StatCard({ label, value, icon, color, suffix }: Props) {
  const { theme } = useTheme();
  const accentColor = color || theme.highlight_color;
  return (
    <View style={[styles.card, { backgroundColor: "#1A2240" }]}>
      <View style={[styles.iconBox, { backgroundColor: accentColor + "22" }]}>
        <Ionicons name={icon as any} size={20} color={accentColor} />
      </View>
      <Text style={[styles.value, { color: theme.text_color }]}>
        {value}{suffix}
      </Text>
      <Text style={[styles.label, { color: theme.text_color + "77" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, padding: 14, margin: 4 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  value: { fontSize: 22, fontWeight: "bold", marginBottom: 2 },
  label: { fontSize: 11 },
});
