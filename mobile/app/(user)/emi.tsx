import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { loanApi } from "@/services/api";
import { format, isPast, isToday } from "date-fns";

const EMI_STATUS_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  paid:    { bg: "#27AE6022", text: "#27AE60", icon: "checkmark-circle" },
  pending: { bg: "#F39C1222", text: "#F39C12", icon: "time" },
  late:    { bg: "#E74C3C22", text: "#E74C3C", icon: "alert-circle" },
};

export default function UserEMI() {
  const { theme } = useTheme();
  const [loans, setLoans] = useState<any[]>([]);
  const [emiMap, setEmiMap] = useState<Record<number, any[]>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data: loansData } = await loanApi.myLoans();
      setLoans(loansData);
      const emiResults: Record<number, any[]> = {};
      await Promise.all(
        loansData.map(async (loan: any) => {
          const { data: emis } = await loanApi.emiSchedule(loan.id);
          emiResults[loan.id] = emis;
        })
      );
      setEmiMap(emiResults);
      // Auto-expand first active loan
      const first = loansData.find((l: any) => l.status === "active");
      if (first) setExpanded({ [first.id]: true });
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const toggleExpand = (id: number) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const getEmiStatus = (emi: any) => {
    if (emi.status === "paid") return "paid";
    if (isPast(new Date(emi.due_date)) && !isToday(new Date(emi.due_date))) return "late";
    return "pending";
  };

  const totalStats = (emis: any[]) => ({
    total: emis.length,
    paid: emis.filter(e => e.status === "paid").length,
    pending: emis.filter(e => e.status === "pending").length,
    late: emis.filter(e => getEmiStatus(e) === "late").length,
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg_color }}>
      <View className="px-6 pt-14 pb-4" style={{ backgroundColor: "#1A2240" }}>
        <Text className="text-2xl font-bold" style={{ color: theme.text_color }}>EMI Schedule</Text>
        <Text className="text-sm mt-1" style={{ color: theme.text_color + "88" }}>Track your repayment plan</Text>
      </View>

      {loading ? <ActivityIndicator color={theme.highlight_color} size="large" className="mt-20" /> : (
        <ScrollView className="px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.highlight_color} />}>
          {loans.length === 0 && (
            <View className="items-center py-16">
              <Ionicons name="calendar-outline" size={48} color={theme.text_color + "44"} />
              <Text className="mt-4" style={{ color: theme.text_color + "88" }}>No loans / EMIs yet</Text>
            </View>
          )}

          {loans.map((loan) => {
            const emis = emiMap[loan.id] || [];
            const stats = totalStats(emis);
            const isExpanded = expanded[loan.id];
            const progress = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

            return (
              <View key={loan.id} className="rounded-3xl mb-4 overflow-hidden" style={{ backgroundColor: "#1A2240" }}>
                {/* Loan Header */}
                <TouchableOpacity className="p-4" onPress={() => toggleExpand(loan.id)}>
                  <View className="flex-row justify-between items-center mb-3">
                    <View>
                      <Text className="font-bold text-base" style={{ color: theme.text_color }}>Loan #{loan.id}</Text>
                      <Text className="text-xs mt-0.5" style={{ color: theme.text_color + "77" }}>
                        ₹{loan.principal?.toLocaleString()} principal
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="px-2 py-1 rounded-full" style={{ backgroundColor: loan.status === "active" ? "#27AE6022" : "#8892B022" }}>
                        <Text className="text-xs" style={{ color: loan.status === "active" ? "#27AE60" : "#8892B0" }}>{loan.status}</Text>
                      </View>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={theme.text_color + "88"} />
                    </View>
                  </View>
                  {/* Stats chips */}
                  <View className="flex-row gap-2 mb-3">
                    {[
                      { label: "Total", value: stats.total, color: theme.text_color + "88" },
                      { label: "Paid", value: stats.paid, color: "#27AE60" },
                      { label: "Pending", value: stats.pending, color: "#F39C12" },
                      { label: "Late", value: stats.late, color: "#E74C3C" },
                    ].map(({ label, value, color }) => (
                      <View key={label} className="flex-1 rounded-xl p-2 items-center" style={{ backgroundColor: "#232E4A" }}>
                        <Text className="font-bold text-base" style={{ color }}>{value}</Text>
                        <Text className="text-xs" style={{ color: theme.text_color + "55" }}>{label}</Text>
                      </View>
                    ))}
                  </View>
                  {/* Progress */}
                  <View className="rounded-full h-2" style={{ backgroundColor: "#232E4A" }}>
                    <View className="rounded-full h-2" style={{ width: `${progress}%`, backgroundColor: "#27AE60" }} />
                  </View>
                  <Text className="text-xs mt-1" style={{ color: theme.text_color + "55" }}>{progress.toFixed(0)}% completed</Text>
                </TouchableOpacity>

                {/* EMI List */}
                {isExpanded && emis.map((emi, idx) => {
                  const status = emi.status === "paid" ? "paid" : getEmiStatus(emi);
                  const style = EMI_STATUS_STYLE[status];
                  return (
                    <View key={emi.id} className="mx-4 mb-3 rounded-2xl p-4"
                      style={{ backgroundColor: "#232E4A", borderLeftWidth: 3, borderLeftColor: style.text }}>
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                          <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: style.bg }}>
                            <Ionicons name={style.icon as any} size={16} color={style.text} />
                          </View>
                          <View>
                            <Text className="font-bold text-sm" style={{ color: theme.text_color }}>EMI {idx + 1}</Text>
                            <Text className="text-xs mt-0.5" style={{ color: theme.text_color + "77" }}>
                              Due: {format(new Date(emi.due_date), "dd MMM yyyy")}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="font-bold text-base" style={{ color: theme.text_color }}>₹{emi.amount?.toFixed(2)}</Text>
                          <View className="px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: style.bg }}>
                            <Text className="text-xs font-bold" style={{ color: style.text }}>{status}</Text>
                          </View>
                        </View>
                      </View>
                      {emi.paid_at && (
                        <Text className="text-xs mt-2" style={{ color: "#27AE6099" }}>
                          Paid: {format(new Date(emi.paid_at), "dd MMM yyyy")}
                        </Text>
                      )}
                      {emi.penalty_amount > 0 && (
                        <Text className="text-xs mt-1" style={{ color: "#E74C3C" }}>
                          Penalty: ₹{emi.penalty_amount}
                        </Text>
                      )}
                    </View>
                  );
                })}
                {isExpanded && <View className="h-4" />}
              </View>
            );
          })}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}
