import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { icon: string; onPress: () => void };
}

export default function Header({ title, subtitle, onBack, rightAction }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: "#1A2240" }]}>
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={theme.text_color} />
        </TouchableOpacity>
      )}
      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: theme.text_color, fontWeight: theme.font_bold ? "800" : "700" }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.text_color + "88" }]}>{subtitle}</Text>
        )}
      </View>
      {rightAction && (
        <TouchableOpacity style={styles.rightBtn} onPress={rightAction.onPress}>
          <Ionicons name={rightAction.icon as any} size={22} color={theme.highlight_color} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn: { marginRight: 12, padding: 4 },
  titleBlock: { flex: 1 },
  title: { fontSize: 22 },
  subtitle: { fontSize: 12, marginTop: 2 },
  rightBtn: { marginLeft: 12, padding: 4 },
});
