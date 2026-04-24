import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { notificationApi, themeApi, adminApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const NOTIF_TYPES = ["announcement", "emi_reminder", "payment_due", "loan_approved", "loan_rejected"];

export default function AdminSettings() {
  const { logout } = useAuth();
  const { theme, themes, loadAllThemes, activateTheme } = useTheme();
  const [notifModal, setNotifModal] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: "", body: "", target: "all", user_id: "", type: "announcement" });
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { loadAllThemes(); }, []);

  const sendNotification = async () => {
    if (!notifForm.title || !notifForm.body) { Alert.alert("Error", "Title and body required"); return; }
    setSending(true);
    try {
      await notificationApi.send({
        ...notifForm,
        user_id: notifForm.user_id ? parseInt(notifForm.user_id) : undefined,
      });
      setNotifModal(false);
      setNotifForm({ title: "", body: "", target: "all", user_id: "", type: "announcement" });
      Alert.alert("Sent", "Notification sent successfully");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Failed to send");
    } finally { setSending(false); }
  };

  const openNotifModal = async () => {
    setNotifModal(true);
    try {
      const res = await adminApi.listUsers();
      setUsers(res.data);
    } catch (e) {
      console.log("Failed to load users for notification modal", e);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg_color }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-6 flex-row justify-between items-center" style={{ backgroundColor: "#1A2240" }}>
        <View>
          <Text className="text-2xl font-bold" style={{ color: theme.text_color }}>Settings</Text>
          <Text className="text-sm mt-1" style={{ color: theme.text_color + "88" }}>Theme, Notifications & More</Text>
        </View>
        <TouchableOpacity
          className="px-4 py-2 rounded-xl bg-red-500"
          onPress={() => {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: logout }
            ]);
          }}
        >
          <Text className="font-bold text-white">Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 pt-4">
        {/* Notifications Section */}
        <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#1A2240" }}>
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="font-bold text-base" style={{ color: theme.text_color }}>Push Notifications</Text>
              <Text className="text-xs mt-1" style={{ color: theme.text_color + "77" }}>Send FCM to users</Text>
            </View>
            <TouchableOpacity className="px-4 py-2 rounded-xl flex-row items-center" style={{ backgroundColor: theme.highlight_color }} onPress={openNotifModal}>
              <Ionicons name="notifications" size={16} color="#fff" />
              <Text className="text-white font-bold ml-2 text-sm">Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View className="flex-row justify-between items-center mb-3 px-1 mt-4">
          <Text className="text-lg font-bold" style={{ color: theme.text_color }}>Color Theme</Text>
          {themes.length === 0 && (
            <TouchableOpacity
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: theme.highlight_color }}
              onPress={async () => {
                try {
                  await themeApi.seedDefaults();
                  Alert.alert("Success", "10 Premium default themes seeded!");
                  loadAllThemes();
                } catch (e) {
                  Alert.alert("Error", "Failed to seed themes.");
                }
              }}
            >
              <Text className="text-xs font-bold text-white">✨ Seed Themes</Text>
            </TouchableOpacity>
          )}
        </View>

        {themes.length === 0 && (
          <View className="rounded-2xl p-4 mb-4 items-center" style={{ backgroundColor: "#1A2240" }}>
            <Text className="text-sm text-center" style={{ color: theme.text_color + "88" }}>
              No themes found. Tap the 'Seed Themes' button above to load professional defaults.
            </Text>
          </View>
        )}
        {themes.map((t) => (
          <TouchableOpacity
            key={t.id}
            className="rounded-2xl p-4 mb-3 flex-row items-center justify-between"
            style={{
              backgroundColor: t.bg_color || "#1A2240",
              borderWidth: 2,
              borderColor: t.is_active ? t.highlight_color : "transparent",
              shadowColor: t.highlight_color || "#000",
              shadowOpacity: t.is_active ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: t.is_active ? 8 : 2,
            }}
            onPress={() => activateTheme(t.id)}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-12 h-12 rounded-full mr-4 border-2 shadow-sm"
                style={{ backgroundColor: t.highlight_color || '#ccc', borderColor: t.text_color || '#000' }}
              />
              <View className="flex-1">
                <Text className="font-bold text-base" style={{ color: t.text_color || '#000' }}>
                  {t.name}
                </Text>
                <Text className="text-xs mt-0.5 font-medium" style={{ color: t.text_color ? t.text_color + "cc" : '#666' }}>
                  Bg: {t.bg_color} • Accent: {t.highlight_color}
                </Text>
              </View>
            </View>
            {t.is_active ? (
              <View className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: (t.highlight_color || '#000') + "22" }}>
                <Text className="font-bold text-xs" style={{ color: t.highlight_color || '#000' }}>Active</Text>
              </View>
            ) : (
              <Ionicons name="checkmark-circle-outline" size={24} color={t.text_color + "44"} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View className="h-12" />

      {/* Send Notification Modal */}
      <Modal visible={notifModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "#00000088" }}>
          <ScrollView className="rounded-t-3xl p-6" style={{ backgroundColor: "#1A2240", maxHeight: "90%" }}>
            <Text className="text-xl font-bold mb-6" style={{ color: theme.text_color }}>Send Notification</Text>
            {/* Target Toggle */}
            <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Target</Text>
            <View className="flex-row rounded-xl p-1 mb-4" style={{ backgroundColor: "#232E4A" }}>
              {["all", "user"].map((t) => (
                <TouchableOpacity key={t} className="flex-1 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: notifForm.target === t ? theme.highlight_color : "transparent" }} onPress={() => setNotifForm(f => ({ ...f, target: t }))}>
                  <Text className="text-sm font-bold capitalize" style={{ color: notifForm.target === t ? "#fff" : theme.text_color + "88" }}>{t === "all" ? "All Users" : "Single User"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {notifForm.target === "user" && (
              <View className="mb-4">
                <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Select User</Text>
                <View className="max-h-48 rounded-xl overflow-hidden" style={{ backgroundColor: "#232E4A" }}>
                  <ScrollView nestedScrollEnabled>
                    {users.map(u => (
                      <TouchableOpacity 
                        key={u.id} 
                        className="p-3 border-b border-gray-700 flex-row justify-between items-center"
                        style={{ backgroundColor: notifForm.user_id === u.id.toString() ? theme.highlight_color + "44" : "transparent" }}
                        onPress={() => setNotifForm(f => ({ ...f, user_id: u.id.toString() }))}
                      >
                        <Text style={{ color: theme.text_color }}>{u.phone} {u.name ? `(${u.name})` : ""}</Text>
                        {notifForm.user_id === u.id.toString() && <Ionicons name="checkmark" color={theme.highlight_color} size={16} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
            {/* Type */}
            <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {NOTIF_TYPES.map((t) => (
                <TouchableOpacity key={t} className="mr-2 px-3 py-2 rounded-xl" style={{ backgroundColor: notifForm.type === t ? theme.highlight_color : "#232E4A" }} onPress={() => setNotifForm(f => ({ ...f, type: t }))}>
                  <Text className="text-xs font-bold" style={{ color: notifForm.type === t ? "#fff" : theme.text_color + "88" }}>{t.replace(/_/g, " ")}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {[
              { label: "Title *", key: "title", placeholder: "Notification title" },
              { label: "Body *", key: "body", placeholder: "Notification message...", multiline: true },
            ].map(({ label, key, placeholder, multiline }: any) => (
              <View key={key} className="mb-4">
                <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>{label}</Text>
                <TextInput className="rounded-xl px-4 text-sm" style={{ backgroundColor: "#232E4A", color: theme.text_color, height: multiline ? 80 : 48, textAlignVertical: multiline ? "top" : "center", paddingTop: multiline ? 12 : 0 }} placeholder={placeholder} placeholderTextColor={theme.text_color + "44"} multiline={multiline} value={(notifForm as any)[key]} onChangeText={(v) => setNotifForm(f => ({ ...f, [key]: v }))} />
              </View>
            ))}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#232E4A" }} onPress={() => setNotifModal(false)}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: theme.highlight_color }} onPress={sendNotification} disabled={sending}>
                {sending ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Send Now</Text>}
              </TouchableOpacity>
            </View>
            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}
