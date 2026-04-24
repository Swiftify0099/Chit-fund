import { useEffect, useRef } from "react";
import * as Device from "expo-device";
 import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";
import { userApi } from "@/services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Android Emulators support FCM, so we only restrict iOS Simulators
  if (!Device.isDevice && Platform.OS === "ios") {
    console.log("Push notifications only work on physical devices for iOS");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6C63FF",
    });
  }

  try {
    // Get Device push token (Native FCM token for Firebase directly)
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    return token;
  } catch (error) {
    console.log("Error getting push token:", error);
    return null;
  }
}

export function useNotifications(isAuthenticated: boolean) {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        try {
          await userApi.updateFcmToken(token);
        } catch (e) {
          console.log("FCM token update failed:", e);
        }
      }
    });

    // Listen for received notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
      
      // Display an alert so the notification is visible in the foreground
      const { title, body } = notification.request.content;
      if (title || body) {
        Alert.alert(title || "New Notification", body || "");
      }
    });

    // Listen for user tapping notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);
}
