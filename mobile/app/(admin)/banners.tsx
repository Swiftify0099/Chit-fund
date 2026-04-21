import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  Alert, ActivityIndicator, Image, Modal, TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { themeApi, BASE_URL } from "@/services/api";

export default function AdminBanners() {
  const { theme } = useTheme();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", client_name: "", cost_per_view: "0" });
  const [image, setImage] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await themeApi.listBanners();
      setBanners(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const uploadBanner = async () => {
    if (!form.title || !image) { Alert.alert("Error", "Title and image are required"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("client_name", form.client_name);
      formData.append("cost_per_view", form.cost_per_view);
      formData.append("file", { uri: image.uri, type: "image/jpeg", name: "banner.jpg" } as any);
      const { default: axios } = await import("axios");
      const { default: SecureStore } = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("access_token");
      await axios.post(`${BASE_URL}/themes/banners/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      setForm({ title: "", client_name: "", cost_per_view: "0" });
      setImage(null);
      load();
      Alert.alert("Success", "Banner uploaded successfully");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Upload failed");
    } finally { setSaving(false); }
  };

  const toggleBanner = async (id: number) => {
    try { await themeApi.toggleBanner(id); load(); }
    catch { Alert.alert("Error", "Failed to toggle banner"); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg_color }}>
      <View className="px-6 pt-14 pb-4" style={{ backgroundColor: "#1A2240" }}>
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold" style={{ color: theme.text_color }}>Banners</Text>
          <TouchableOpacity
            className="flex-row items-center px-4 py-2 rounded-xl"
            style={{ backgroundColor: theme.highlight_color }}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white font-bold ml-1 text-sm">Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator color={theme.highlight_color} size="large" className="mt-20" /> : (
        <ScrollView className="px-4 pt-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.highlight_color} />}>
          {banners.map((b) => (
            <View key={b.id} className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: "#1A2240" }}>
              <Image source={{ uri: `${BASE_URL}${b.image_url}` }} className="w-full h-44" resizeMode="cover" />
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="font-bold text-base" style={{ color: theme.text_color }}>{b.title}</Text>
                    {b.client_name && <Text className="text-xs mt-0.5" style={{ color: theme.text_color + "88" }}>{b.client_name}</Text>}
                  </View>
                  <View className="px-2 py-1 rounded-full" style={{ backgroundColor: b.is_active ? "#27AE6022" : "#E74C3C22" }}>
                    <Text className="text-xs" style={{ color: b.is_active ? "#27AE60" : "#E74C3C" }}>{b.is_active ? "Active" : "Inactive"}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-xs" style={{ color: theme.text_color + "77" }}>Views: {b.total_views} • Charge: ₹{b.total_charge?.toFixed(2)}</Text>
                    <Text className="text-xs mt-0.5" style={{ color: theme.text_color + "55" }}>₹{b.cost_per_view}/view</Text>
                  </View>
                  <TouchableOpacity className="px-4 py-2 rounded-xl" style={{ backgroundColor: b.is_active ? "#E74C3C22" : "#27AE6022" }} onPress={() => toggleBanner(b.id)}>
                    <Text className="text-xs font-bold" style={{ color: b.is_active ? "#E74C3C" : "#27AE60" }}>{b.is_active ? "Deactivate" : "Activate"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {banners.length === 0 && (
            <View className="items-center py-16">
              <Ionicons name="image-outline" size={48} color={theme.text_color + "44"} />
              <Text className="mt-4" style={{ color: theme.text_color + "88" }}>No banners yet</Text>
            </View>
          )}
          <View className="h-8" />
        </ScrollView>
      )}

      {/* Upload Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "#00000088" }}>
          <ScrollView className="rounded-t-3xl p-6" style={{ backgroundColor: "#1A2240", maxHeight: "85%" }}>
            <Text className="text-xl font-bold mb-6" style={{ color: theme.text_color }}>Upload Banner</Text>
            <TouchableOpacity className="rounded-2xl items-center justify-center mb-4 overflow-hidden" style={{ height: 160, backgroundColor: "#232E4A", borderWidth: 2, borderColor: theme.highlight_color + "44", borderStyle: "dashed" }} onPress={pickImage}>
              {image ? <Image source={{ uri: image.uri }} className="w-full h-full" resizeMode="cover" />
                : <><Ionicons name="cloud-upload-outline" size={36} color={theme.highlight_color} /><Text className="mt-2 text-sm" style={{ color: theme.text_color + "88" }}>Tap to select image (max 10MB)</Text></>}
            </TouchableOpacity>
            {[
              { label: "Banner Title *", key: "title", placeholder: "e.g. Summer Sale" },
              { label: "Client Name", key: "client_name", placeholder: "Advertiser name" },
              { label: "Cost per View (₹)", key: "cost_per_view", placeholder: "0.50", keyboardType: "numeric" },
            ].map(({ label, key, placeholder, keyboardType }: any) => (
              <View key={key} className="mb-4">
                <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>{label}</Text>
                <TextInput className="rounded-xl px-4 h-12 text-sm" style={{ backgroundColor: "#232E4A", color: theme.text_color }} placeholder={placeholder} placeholderTextColor={theme.text_color + "44"} keyboardType={keyboardType} value={(form as any)[key]} onChangeText={(v) => setForm(f => ({ ...f, [key]: v }))} />
              </View>
            ))}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: "#232E4A" }} onPress={() => setShowModal(false)}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: theme.highlight_color }} onPress={uploadBanner} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Upload</Text>}
              </TouchableOpacity>
            </View>
            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
