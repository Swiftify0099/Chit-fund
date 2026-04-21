import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { adminApi, loanApi } from "@/services/api";

interface StatCard { label: string; value: string | number; icon: string; color: string }

function StatCard({ label, value, icon, color, textColor }: StatCard & { textColor: string }) {
  return (
    <View className="flex-1 rounded-2xl p-4 m-1" style={{ backgroundColor: "#1A2240" }}>
      <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: color + "22" }}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold mb-1" style={{ color: textColor }}>{value}</Text>
      <Text className="text-xs" style={{ color: textColor + "88" }}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({ users: 0, pending: 0, active: 0, rejected: 0 });
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [usersRes, pendingRes, activeRes] = await Promise.all([
        adminApi.listUsers(),
        loanApi.allRequests("pending"),
        loanApi.allRequests("approved"),
      ]);
      setStats({
        users: usersRes.data.length,
        pending: pendingRes.data.length,
        active: activeRes.data.length,
        rejected: 0,
      });
      setPendingLoans(pendingRes.data.slice(0, 5));
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg_color }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.highlight_color} />}
    >
      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: "#1A2240" }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm" style={{ color: theme.highlight_color }}>Admin Panel</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: theme.text_color }}>
              {theme.title || "Chit Fund"}
            </Text>
            <Text className="text-sm mt-1" style={{ color: theme.text_color + "88" }}>
              Welcome, {user?.name}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} className="p-3 rounded-xl" style={{ backgroundColor: "#E74C3C22" }}>
            <Ionicons name="log-out-outline" size={22} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.highlight_color} size="large" className="mt-20" />
      ) : (
        <View className="px-4 pt-4">
          {/* Stats Grid */}
          <Text className="text-lg font-bold mb-3 px-1" style={{ color: theme.text_color }}>Overview</Text>
          <View className="flex-row mb-2">
            <StatCard label="Total Users" value={stats.users} icon="people" color="#6C63FF" textColor={theme.text_color} />
            <StatCard label="Pending Loans" value={stats.pending} icon="time" color="#F39C12" textColor={theme.text_color} />
          </View>
          <View className="flex-row mb-6">
            <StatCard label="Active Loans" value={stats.active} icon="cash" color="#27AE60" textColor={theme.text_color} />
            <StatCard label="Disbursed" value="₹0" icon="trending-up" color="#2E86AB" textColor={theme.text_color} />
          </View>

          {/* Pending Loan Requests */}
          <Text className="text-lg font-bold mb-3 px-1" style={{ color: theme.text_color }}>Pending Requests</Text>
          {pendingLoans.length === 0 ? (
            <View className="rounded-2xl p-8 items-center" style={{ backgroundColor: "#1A2240" }}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#27AE60" />
              <Text className="mt-3 text-sm" style={{ color: theme.text_color + "88" }}>No pending requests</Text>
            </View>
          ) : (
            pendingLoans.map((req) => (
              <View key={req.id} className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#1A2240" }}>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-bold" style={{ color: theme.text_color }}>User #{req.user_id}</Text>
                    <Text className="text-xs mt-1" style={{ color: theme.text_color + "88" }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-lg" style={{ color: theme.highlight_color }}>
                      ₹{req.amount_requested.toLocaleString()}
                    </Text>
                    <View className="mt-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F39C1222" }}>
                      <Text className="text-xs" style={{ color: "#F39C12" }}>Pending</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
      <View className="h-8" />
    </ScrollView>
  );
}
