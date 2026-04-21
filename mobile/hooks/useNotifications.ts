import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { userApi } from "@/services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices");
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

  // Get Expo push token (for Expo notifications service)
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
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
    });

    // Listen for user tapping notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isAuthenticated]);
}
