/**
 * NOTE: Push Notifications are disabled for Expo Go on Android.
 * The 'expo-notifications' package for remote push notifications was removed
 * from the standard Expo Go app on Android with SDK 53. This causes the app to crash.
 *
 * This file provides a dummy `useNotifications` hook to allow the app to run.
 * To re-enable push notifications, you must create a development build.
 * Learn more: https://docs.expo.dev/develop/development-builds/introduction/
 *
 * You can restore the original content of this file from git history when
 * you are ready to use a development build.
 */
export function useNotifications(isAuthenticated: boolean) {
  if (isAuthenticated && __DEV__) {
    console.log(
      "Push notifications are disabled in Expo Go on Android. Use a development build to test them."
    );
  }
  // This is a no-op to prevent crashing in Expo Go.
}
