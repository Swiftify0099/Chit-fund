import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { loanApi } from "@/services/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F39C12", approved: "#27AE60", rejected: "#E74C3C", active: "#6C63FF", completed: "#8892B0",
};

export default function AdminLoans() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [months, setMonths] = useState("6");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await loanApi.allRequests(tab);
      setRequests(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { setLoading(true); load(); }, [tab]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const approve = async () => {
    if (!months || parseInt(months) < 1) { Alert.alert("Error", "Enter valid repayment months"); return; }
    setSaving(true);
    try {
      await loanApi.approveLoan(selectedReq.id, parseInt(months));
      setApproveModal(false);
      Alert.alert("Approved", `Loan approved. EMI generated for ${months} months.`);
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Approval failed");
    } finally { setSaving(false); }
  };

  const reject = async () => {
    if (!reason) { Alert.alert("Error", "Rejection reason required"); return; }
    setSaving(true);
    try {
      await loanApi.rejectLoan(selectedReq.id, reason);
      setRejectModal(false);
      setReason("");
      load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Rejection failed");
    } finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg_color }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-4" style={{ backgroundColor: "#1A2240" }}>
        <Text className="text-2xl font-bold mb-4" style={{ color: theme.text_color }}>Loan Requests</Text>
        {/* Tabs */}
        <View className="flex-row rounded-xl p-1" style={{ backgroundColor: "#232E4A" }}>
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              className="flex-1 py-2 rounded-lg items-center"
              style={{ backgroundColor: tab === t ? theme.highlight_color : "transparent" }}
              onPress={() => setTab(t)}
            >
              <Text className="text-xs font-bold capitalize" style={{ color: tab === t ? "#fff" : theme.text_color + "88" }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.highlight_color} size="large" className="mt-20" />
      ) : (
        <ScrollView
          className="px-4 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.highlight_color} />}
        >
          {requests.length === 0 && (
            <View className="items-center py-16">
              <Ionicons name="document-outline" size={48} color={theme.text_color + "44"} />
              <Text className="mt-4" style={{ color: theme.text_color + "88" }}>No {tab} requests</Text>
            </View>
          )}
          {requests.map((req) => (
            <View key={req.id} className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#1A2240" }}>
              {/* Top row */}
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="font-bold text-base" style={{ color: theme.text_color }}>Request #{req.id}</Text>
                  <Text className="text-xs mt-0.5" style={{ color: theme.text_color + "77" }}>User #{req.user_id}</Text>
                </View>
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[req.status] + "22" }}>
                  <Text className="text-xs font-bold" style={{ color: STATUS_COLORS[req.status] }}>{req.status}</Text>
                </View>
              </View>
              {/* Amount */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-3xl font-bold" style={{ color: theme.highlight_color }}>
                  ₹{req.amount_requested.toLocaleString()}
                </Text>
                <Text className="text-xs" style={{ color: theme.text_color + "77" }}>
                  {new Date(req.created_at).toLocaleDateString("en-IN")}
                </Text>
              </View>
              {req.note && (
                <Text className="text-xs mb-3 italic" style={{ color: theme.text_color + "88" }}>"{req.note}"</Text>
              )}
              {req.repayment_months && (
                <Text className="text-xs mb-2" style={{ color: "#27AE60" }}>✓ {req.repayment_months} months repayment</Text>
              )}
              {req.rejection_reason && (
                <Text className="text-xs mb-2" style={{ color: "#E74C3C" }}>✗ {req.rejection_reason}</Text>
              )}
              {/* Actions for pending */}
              {tab === "pending" && (
                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity
                    className="flex-1 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: "#27AE6022" }}
                    onPress={() => { setSelectedReq(req); setApproveModal(true); }}
                  >
                    <Text className="text-sm font-bold" style={{ color: "#27AE60" }}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: "#E74C3C22" }}
                    onPress={() => { setSelectedReq(req); setRejectModal(true); }}
                  >
                    <Text className="text-sm font-bold" style={{ color: "#E74C3C" }}>✗ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          <View className="h-8" />
        </ScrollView>
      )}

      {/* Approve Modal */}
      <Modal visible={approveModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "#00000088" }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: "#1A2240" }}>
            <Text className="text-xl font-bold mb-2" style={{ color: theme.text_color }}>Approve Loan</Text>
            <Text className="text-sm mb-6" style={{ color: theme.text_color + "88" }}>
              Amount: ₹{selectedReq?.amount_requested?.toLocaleString()}
            </Text>
            <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Repayment Period (months)</Text>
            <TextInput
              className="rounded-xl px-4 h-12 mb-4 text-sm"
              style={{ backgroundColor: "#232E4A", color: theme.text_color }}
              placeholder="e.g. 12"
              placeholderTextColor={theme.text_color + "44"}
              keyboardType="numeric"
              value={months}
              onChangeText={setMonths}
            />
            {months && selectedReq && (
              <View className="rounded-xl p-3 mb-4" style={{ backgroundColor: "#27AE6022" }}>
                <Text className="text-sm" style={{ color: "#27AE60" }}>
                  Monthly EMI: ₹{(selectedReq.amount_requested / parseInt(months || "1")).toFixed(2)}
                </Text>
              </View>
            )}
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#232E4A" }} onPress={() => setApproveModal(false)}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#27AE60" }} onPress={approve} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Confirm Approval</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={rejectModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "#00000088" }}>
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: "#1A2240" }}>
            <Text className="text-xl font-bold mb-6" style={{ color: theme.text_color }}>Reject Loan</Text>
            <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Rejection Reason *</Text>
            <TextInput
              className="rounded-xl px-4 py-3 mb-6 text-sm"
              style={{ backgroundColor: "#232E4A", color: theme.text_color, minHeight: 80, textAlignVertical: "top" }}
              placeholder="Explain why this loan is being rejected..."
              placeholderTextColor={theme.text_color + "44"}
              multiline
              value={reason}
              onChangeText={setReason}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#232E4A" }} onPress={() => setRejectModal(false)}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#E74C3C" }} onPress={reject} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Reject</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
