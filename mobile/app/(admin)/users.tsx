import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  TextInput, Modal, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { adminApi } from "@/services/api";

interface User { id: number; name: string; phone: string; email?: string; role: string; is_active: boolean }

export default function AdminUsers() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "user" });
  const [shares, setShares] = useState({ num_shares: "", amount_per_share: "", multiplier: "" });
  const [sharesModal, setSharesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await adminApi.listUsers();
      setUsers(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const createUser = async () => {
    if (!form.name || !form.phone || !form.password) {
      Alert.alert("Error", "Name, phone, and password are required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createUser({ ...form });
      setShowModal(false);
      setForm({ name: "", phone: "", email: "", password: "", role: "user" });
      await load();
      Alert.alert("Success", "User created successfully");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Failed to create user");
    } finally { setSaving(false); }
  };

  const assignShares = async () => {
    if (!selectedUser || !shares.num_shares || !shares.amount_per_share || !shares.multiplier) {
      Alert.alert("Error", "All share fields are required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.assignShares({
        user_id: selectedUser.id,
        num_shares: parseInt(shares.num_shares),
        amount_per_share: parseFloat(shares.amount_per_share),
        multiplier: parseFloat(shares.multiplier),
      });
      setSharesModal(false);
      Alert.alert("Success", `Shares assigned. Credit limit = ₹${(parseInt(shares.num_shares) * parseFloat(shares.amount_per_share) * parseFloat(shares.multiplier)).toLocaleString()}`);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Failed to assign shares");
    } finally { setSaving(false); }
  };

  const toggleUser = async (userId: number) => {
    try {
      await adminApi.toggleUser(userId);
      await load();
    } catch { Alert.alert("Error", "Failed to toggle user status"); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg_color }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-4" style={{ backgroundColor: "#1A2240" }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold" style={{ color: theme.text_color }}>Users</Text>
          <TouchableOpacity
            className="flex-row items-center px-4 py-2 rounded-xl"
            style={{ backgroundColor: theme.highlight_color }}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text className="text-white font-bold ml-2 text-sm">Add User</Text>
          </TouchableOpacity>
        </View>
        {/* Search */}
        <View className="flex-row items-center rounded-xl px-4 h-12" style={{ backgroundColor: "#232E4A" }}>
          <Ionicons name="search-outline" size={18} color={theme.highlight_color} />
          <TextInput
            className="flex-1 ml-3 text-sm"
            style={{ color: theme.text_color }}
            placeholder="Search by name or phone..."
            placeholderTextColor={theme.text_color + "55"}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.highlight_color} size="large" className="mt-20" />
      ) : (
        <ScrollView
          className="px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.highlight_color} />}
        >
          {filtered.map((u) => (
            <View key={u.id} className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#1A2240" }}>
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: theme.highlight_color + "22" }}>
                    <Text className="text-lg font-bold" style={{ color: theme.highlight_color }}>
                      {u.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-base" style={{ color: theme.text_color }}>{u.name}</Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.text_color + "88" }}>{u.phone}</Text>
                    <View className="flex-row mt-1 gap-2">
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: u.role === "admin" ? "#6C63FF22" : "#27AE6022" }}>
                        <Text className="text-xs" style={{ color: u.role === "admin" ? "#6C63FF" : "#27AE60" }}>{u.role}</Text>
                      </View>
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: u.is_active ? "#27AE6022" : "#E74C3C22" }}>
                        <Text className="text-xs" style={{ color: u.is_active ? "#27AE60" : "#E74C3C" }}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="p-2 rounded-xl" style={{ backgroundColor: "#6C63FF22" }}
                    onPress={() => { setSelectedUser(u); setSharesModal(true); }}
                  >
                    <Ionicons name="layers-outline" size={18} color="#6C63FF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: u.is_active ? "#E74C3C22" : "#27AE6022" }}
                    onPress={() => toggleUser(u.id)}
                  >
                    <Ionicons name={u.is_active ? "pause-outline" : "play-outline"} size={18} color={u.is_active ? "#E74C3C" : "#27AE60"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {filtered.length === 0 && (
            <View className="items-center py-16">
              <Ionicons name="people-outline" size={48} color={theme.text_color + "44"} />
              <Text className="mt-4" style={{ color: theme.text_color + "88" }}>No users found</Text>
            </View>
          )}
          <View className="h-8" />
        </ScrollView>
      )}

      {/* Create User Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "#00000088" }}>
          <ScrollView className="rounded-t-3xl p-6" style={{ backgroundColor: "#1A2240", maxHeight: "85%" }}>
            <Text className="text-xl font-bold mb-6" style={{ color: theme.text_color }}>Create New User</Text>
            {[
              { label: "Full Name *", key: "name", placeholder: "Enter full name" },
              { label: "Phone *", key: "phone", placeholder: "10-digit phone number", keyboardType: "phone-pad" },
              { label: "Email", key: "email", placeholder: "Email (optional)", keyboardType: "email-address" },
              { label: "Password *", key: "password", placeholder: "Min 6 characters", secure: true },
            ].map(({ label, key, placeholder, keyboardType, secure }: any) => (
              <View key={key} className="mb-4">
                <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>{label}</Text>
                <TextInput
                  className="rounded-xl px-4 h-12 text-sm"
                  style={{ backgroundColor: "#232E4A", color: theme.text_color }}
                  placeholder={placeholder}
                  placeholderTextColor={theme.text_color + "44"}
                  keyboardType={keyboardType || "default"}
                  secureTextEntry={secure}
                  value={(form as any)[key]}
                  onChangeText={(v) => setForm(f => ({ ...f, [key]: v }))}
                />
              </View>
            ))}
            {/* Role Toggle */}
            <View className="mb-6">
              <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Role</Text>
              <View className="flex-row gap-3">
                {["user", "admin"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    className="flex-1 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: form.role === role ? theme.highlight_color : "#232E4A" }}
                    onPress={() => setForm(f => ({ ...f, role }))}
                  >
                    <Text style={{ color: form.role === role ? "#fff" : theme.text_color + "88", fontWeight: "600" }}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#232E4A" }} onPress={() => setShowModal(false)}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: theme.highlight_color }} onPress={createUser} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Create</Text>}
              </TouchableOpacity>
            </View>
            <View className="h-6" />
          </ScrollView>
        </View>
      </Modal>

      {/* Assign Shares Modal */}
      <Modal visible={sharesModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "#00000088" }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: "#1A2240" }}>
            <Text className="text-xl font-bold mb-2" style={{ color: theme.text_color }}>Assign Shares</Text>
            <Text className="text-sm mb-6" style={{ color: theme.text_color + "88" }}>
              For: {selectedUser?.name}
            </Text>
            {[
              { label: "Number of Shares", key: "num_shares", placeholder: "e.g. 5" },
              { label: "Amount per Share (₹)", key: "amount_per_share", placeholder: "e.g. 10000" },
              { label: "Multiplier", key: "multiplier", placeholder: "e.g. 2.5" },
            ].map(({ label, key, placeholder }) => (
              <View key={key} className="mb-4">
                <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>{label}</Text>
                <TextInput
                  className="rounded-xl px-4 h-12 text-sm"
                  style={{ backgroundColor: "#232E4A", color: theme.text_color }}
                  placeholder={placeholder}
                  placeholderTextColor={theme.text_color + "44"}
                  keyboardType="numeric"
                  value={(shares as any)[key]}
                  onChangeText={(v) => setShares(s => ({ ...s, [key]: v }))}
                />
              </View>
            ))}
            {shares.num_shares && shares.amount_per_share && shares.multiplier && (
              <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: theme.highlight_color + "22" }}>
                <Text className="text-sm font-bold" style={{ color: theme.highlight_color }}>
                  Credit Limit = ₹{(parseInt(shares.num_shares || "0") * parseFloat(shares.amount_per_share || "0") * parseFloat(shares.multiplier || "0")).toLocaleString()}
                </Text>
              </View>
            )}
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#232E4A" }} onPress={() => setSharesModal(false)}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: theme.highlight_color }} onPress={assignShares} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Assign</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
