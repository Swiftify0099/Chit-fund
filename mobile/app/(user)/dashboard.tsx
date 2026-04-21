import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert, Dimensions, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { loanApi, themeApi } from "@/services/api";
import { BASE_URL } from "@/services/api";

const { width } = Dimensions.get("window");

interface DashboardData {
  user_id: number; name: string; num_shares: number;
  amount_per_share: number; multiplier: number;
  total_credit_limit: number; used_credit: number; available_credit: number;
  active_loans: any[];
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loanModal, setLoanModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);
  const bannerTimer = useRef<any>(null);

  const load = async () => {
    try {
      const [dashRes, bannersRes] = await Promise.all([
        loanApi.dashboard(),
        themeApi.listBanners(),
      ]);
      setData(dashRes.data);
      setBanners(bannersRes.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    load();
    // Banner rotation every 5 minutes
    bannerTimer.current = setInterval(() => {
      setBannerIdx(i => (i + 1) % Math.max(banners.length, 1));
    }, 5 * 60 * 1000);
    return () => clearInterval(bannerTimer.current);
  }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const applyLoan = async () => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { Alert.alert("Error", "Enter a valid amount"); return; }
    if (data && amt > data.available_credit) {
      Alert.alert("Error", `Exceeds available credit. Max: ₹${data.available_credit.toLocaleString()}`);
      return;
    }
    setApplying(true);
    try {
      await loanApi.applyLoan(amt, note);
      setLoanModal(false);
      setAmount(""); setNote("");
      Alert.alert("Applied!", "Your loan request has been submitted. Admin will review shortly.");
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Application failed");
    } finally { setApplying(false); }
  };

  const creditPercent = data ? Math.min((data.used_credit / Math.max(data.total_credit_limit, 1)) * 100, 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg_color }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.highlight_color} />}>

      {/* Header */}
      <View className="px-6 pt-14 pb-6" style={{ backgroundColor: "#1A2240" }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm" style={{ color: theme.highlight_color }}>
              {theme.subtitle || "Digital Bishi"}
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: theme.text_color }}>
              Namaste, {user?.name?.split(" ")[0]} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={logout} className="p-3 rounded-xl" style={{ backgroundColor: "#E74C3C22" }}>
            <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator color={theme.highlight_color} size="large" className="mt-20" /> : (
        <View className="px-4 pt-4">

          {/* Banner Carousel */}
          {banners.length > 0 && (
            <View className="rounded-2xl overflow-hidden mb-4" style={{ height: 160 }}>
              <Image
                source={{ uri: `${BASE_URL}${banners[bannerIdx % banners.length]?.image_url}` }}
                style={{ width: "100%", height: 160 }}
                resizeMode="cover"
              />
              <View style={{ position: "absolute", bottom: 8, right: 10, backgroundColor: "#00000099", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: "#fff", fontSize: 11 }}>{bannerIdx + 1}/{banners.length}</Text>
              </View>
            </View>
          )}

          {/* Credit Limit Card */}
          <View className="rounded-3xl p-5 mb-4"
            style={{ backgroundColor: theme.highlight_color, shadowColor: theme.highlight_color, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }}>
            <Text className="text-white text-sm mb-1 opacity-80">Total Credit Limit</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              ₹{data?.total_credit_limit.toLocaleString() || "0"}
            </Text>
            {/* Progress bar */}
            <View className="bg-white/20 rounded-full h-2 mb-2">
              <View className="bg-white rounded-full h-2" style={{ width: `${creditPercent}%` }} />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-white text-xs opacity-70">Used: ₹{data?.used_credit.toLocaleString()}</Text>
              <Text className="text-white text-xs opacity-70">Available: ₹{data?.available_credit.toLocaleString()}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-3 mb-4">
            {[
              { label: "Shares", value: data?.num_shares ?? 0, icon: "layers-outline", color: "#27AE60" },
              { label: "Per Share", value: `₹${data?.amount_per_share?.toLocaleString() ?? 0}`, icon: "cash-outline", color: "#F39C12" },
              { label: "Multiplier", value: `${data?.multiplier ?? 0}×`, icon: "trending-up-outline", color: "#2E86AB" },
            ].map(({ label, value, icon, color }) => (
              <View key={label} className="flex-1 rounded-2xl p-3" style={{ backgroundColor: "#1A2240" }}>
                <Ionicons name={icon as any} size={18} color={color} />
                <Text className="font-bold text-base mt-2" style={{ color: theme.text_color }}>{value}</Text>
                <Text className="text-xs mt-0.5" style={{ color: theme.text_color + "77" }}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Active Loans */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold" style={{ color: theme.text_color }}>Active Loans</Text>
            <Text className="text-sm font-bold" style={{ color: theme.highlight_color }}>
              {data?.active_loans.length || 0} loan{(data?.active_loans.length || 0) !== 1 ? "s" : ""}
            </Text>
          </View>

          {data?.active_loans.length === 0 && (
            <View className="rounded-2xl p-6 items-center mb-4" style={{ backgroundColor: "#1A2240" }}>
              <Ionicons name="checkmark-circle-outline" size={36} color="#27AE60" />
              <Text className="mt-2 text-sm" style={{ color: theme.text_color + "88" }}>No active loans</Text>
            </View>
          )}
          {data?.active_loans.map((loan) => (
            <View key={loan.id} className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#1A2240" }}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold" style={{ color: theme.text_color }}>Loan #{loan.id}</Text>
                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#27AE6022" }}>
                  <Text className="text-xs" style={{ color: "#27AE60" }}>Active</Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs" style={{ color: theme.text_color + "77" }}>Principal</Text>
                  <Text className="font-bold text-base" style={{ color: theme.text_color }}>₹{loan.principal?.toLocaleString()}</Text>
                </View>
                <View>
                  <Text className="text-xs" style={{ color: theme.text_color + "77" }}>Remaining</Text>
                  <Text className="font-bold text-base" style={{ color: "#F39C12" }}>₹{loan.remaining_amount?.toLocaleString()}</Text>
                </View>
                <View>
                  <Text className="text-xs" style={{ color: theme.text_color + "77" }}>Disbursed</Text>
                  <Text className="text-xs font-bold" style={{ color: theme.text_color }}>
                    {new Date(loan.disbursed_at).toLocaleDateString("en-IN")}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Apply for Loan CTA */}
          <TouchableOpacity
            className="rounded-2xl p-5 items-center mb-6 flex-row justify-center"
            style={{ backgroundColor: theme.highlight_color + "22", borderWidth: 1.5, borderColor: theme.highlight_color + "55", borderStyle: "dashed" }}
            onPress={() => setLoanModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.highlight_color} />
            <Text className="font-bold ml-2 text-base" style={{ color: theme.highlight_color }}>Apply for New Loan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loan Application Modal */}
      <Modal visible={loanModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "#00000088" }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: "#1A2240" }}>
            <Text className="text-xl font-bold mb-2" style={{ color: theme.text_color }}>Apply for Loan</Text>
            <Text className="text-sm mb-6" style={{ color: theme.text_color + "88" }}>
              Available: ₹{data?.available_credit?.toLocaleString() || "0"}
            </Text>
            <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Loan Amount (₹) *</Text>
            <TextInput
              className="rounded-xl px-4 h-14 text-xl font-bold mb-4"
              style={{ backgroundColor: "#232E4A", color: theme.text_color }}
              placeholder="0.00"
              placeholderTextColor={theme.text_color + "44"}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Note / Purpose</Text>
            <TextInput
              className="rounded-xl px-4 py-3 mb-6 text-sm"
              style={{ backgroundColor: "#232E4A", color: theme.text_color, height: 70, textAlignVertical: "top" }}
              placeholder="Purpose of loan (optional)..."
              placeholderTextColor={theme.text_color + "44"}
              multiline
              value={note}
              onChangeText={setNote}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#232E4A" }} onPress={() => setLoanModal(false)}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: theme.highlight_color }} onPress={applyLoan} disabled={applying}>
                {applying ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Submit Request</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
