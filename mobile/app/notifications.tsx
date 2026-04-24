import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { notificationApi } from "@/services/api";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    try {
      const res = await notificationApi.list();
      setNotifications(res.data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View 
      className="p-4 mb-3 rounded-2xl mx-4" 
      style={{ backgroundColor: "#1A2240", shadowColor: theme.highlight_color, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 }}
    >
      <View className="flex-row items-center mb-1">
        <Ionicons name="notifications-circle" size={24} color={theme.highlight_color} />
        <Text className="font-bold text-base ml-2 flex-1" style={{ color: theme.text_color }}>{item.title}</Text>
      </View>
      <Text className="text-sm mt-1 ml-8" style={{ color: theme.text_color + "CC" }}>{item.body}</Text>
      <Text className="text-xs mt-2 ml-8 font-medium" style={{ color: theme.text_color + "66" }}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg_color }}>
      <View className="px-6 pt-14 pb-4 flex-row items-center justify-between" style={{ backgroundColor: "#1A2240" }}>
        <Text className="text-2xl font-bold" style={{ color: theme.text_color }}>Notifications</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.highlight_color} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={notifications}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifs} tintColor={theme.highlight_color} />}
          renderItem={renderItem}
          ListEmptyComponent={<Text className="text-center mt-10" style={{ color: theme.text_color + "88" }}>No notifications yet.</Text>}
        />
      )}
    </View>
  );
}