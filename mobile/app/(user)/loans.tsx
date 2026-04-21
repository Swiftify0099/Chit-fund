import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { loanApi } from "@/services/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F39C12", approved: "#27AE60", rejected: "#E74C3C",
  active: "#6C63FF", completed: "#8892B0",
};

export default function UserLoans() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<"requests" | "loans">("loans");
  const [loans, setLoans] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [loansRes, reqRes] = await Promise.all([loanApi.myLoans(), loanApi.myRequests()]);
      setLoans(loansRes.data);
      setRequests(reqRes.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg_color }}>
      <View className="px-6 pt-14 pb-4" style={{ backgroundColor: "#1A2240" }}>
        <Text className="text-2xl font-bold mb-4" style={{ color: theme.text_color }}>My Loans</Text>
        <View className="flex-row rounded-xl p-1" style={{ backgroundColor: "#232E4A" }}>
          {(["loans", "requests"] as const).map((t) => (
            <TouchableOpacity key={t} className="flex-1 py-2 rounded-lg items-center"
              style={{ backgroundColor: tab === t ? theme.highlight_color : "transparent" }}
              onPress={() => setTab(t)}>
              <Text className="text-xs font-bold" style={{ color: tab === t ? "#fff" : theme.text_color + "88" }}>
                {t === "loans" ? "Active Loans" : "My Requests"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? <ActivityIndicator color={theme.highlight_color} size="large" className="mt-20" /> : (
        <ScrollView className="px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.highlight_color} />}>
          {tab === "loans" && (
            <>
              {loans.length === 0 && (
                <View className="items-center py-16">
                  <Ionicons name="wallet-outline" size={48} color={theme.text_color + "44"} />
                  <Text className="mt-4" style={{ color: theme.text_color + "88" }}>No loans yet</Text>
                </View>
              )}
              {loans.map((loan) => {
                const paidPercent = Math.min(((loan.principal - loan.remaining_amount) / loan.principal) * 100, 100);
                return (
                  <View key={loan.id} className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "#1A2240" }}>
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-bold text-base" style={{ color: theme.text_color }}>Loan #{loan.id}</Text>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[loan.status] + "22" }}>
                        <Text className="text-xs font-bold" style={{ color: STATUS_COLORS[loan.status] }}>{loan.status}</Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between mb-4">
                      <View>
                        <Text className="text-xs" style={{ color: theme.text_color + "77" }}>Principal</Text>
                        <Text className="font-bold text-xl" style={{ color: theme.text_color }}>₹{loan.principal?.toLocaleString()}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs" style={{ color: theme.text_color + "77" }}>Remaining</Text>
                        <Text className="font-bold text-xl" style={{ color: "#F39C12" }}>₹{loan.remaining_amount?.toLocaleString()}</Text>
                      </View>
                    </View>
                    {/* Repayment Progress */}
                    <Text className="text-xs mb-1" style={{ color: theme.text_color + "77" }}>Repayment Progress</Text>
                    <View className="rounded-full h-2 mb-1" style={{ backgroundColor: "#232E4A" }}>
                      <View className="rounded-full h-2" style={{ width: `${paidPercent}%`, backgroundColor: theme.highlight_color }} />
                    </View>
                    <Text className="text-xs" style={{ color: theme.text_color + "55" }}>{paidPercent.toFixed(1)}% repaid</Text>
                    <Text className="text-xs mt-2" style={{ color: theme.text_color + "55" }}>
                      Disbursed: {new Date(loan.disbursed_at).toLocaleDateString("en-IN")}
                    </Text>
                  </View>
                );
              })}
            </>
          )}

          {tab === "requests" && (
            <>
              {requests.length === 0 && (
                <View className="items-center py-16">
                  <Ionicons name="document-outline" size={48} color={theme.text_color + "44"} />
                  <Text className="mt-4" style={{ color: theme.text_color + "88" }}>No requests yet</Text>
                </View>
              )}
              {requests.map((req) => (
                <View key={req.id} className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#1A2240" }}>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-bold" style={{ color: theme.text_color }}>Request #{req.id}</Text>
                    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[req.status] + "22" }}>
                      <Text className="text-xs font-bold" style={{ color: STATUS_COLORS[req.status] }}>{req.status}</Text>
                    </View>
                  </View>
                  <Text className="text-3xl font-bold mb-2" style={{ color: theme.highlight_color }}>
                    ₹{req.amount_requested?.toLocaleString()}
                  </Text>
                  {req.note && <Text className="text-xs mb-1 italic" style={{ color: theme.text_color + "88" }}>"{req.note}"</Text>}
                  {req.repayment_months && (
                    <View className="flex-row items-center mt-2 gap-2">
                      <Ionicons name="calendar-outline" size={14} color="#27AE60" />
                      <Text className="text-xs" style={{ color: "#27AE60" }}>
                        {req.repayment_months} months • EMI: ₹{(req.amount_requested / req.repayment_months).toFixed(2)}/mo
                      </Text>
                    </View>
                  )}
                  {req.rejection_reason && (
                    <View className="flex-row items-center mt-2 gap-2">
                      <Ionicons name="close-circle-outline" size={14} color="#E74C3C" />
                      <Text className="text-xs flex-1" style={{ color: "#E74C3C" }}>{req.rejection_reason}</Text>
                    </View>
                  )}
                  <Text className="text-xs mt-2" style={{ color: theme.text_color + "55" }}>
                    {new Date(req.created_at).toLocaleDateString("en-IN")}
                  </Text>
                </View>
              ))}
            </>
          )}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}
