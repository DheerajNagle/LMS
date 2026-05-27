import { Platform } from "react-native";

let Notifications: any = null;
let isNotificationSupported = false;

try {
  Notifications = require("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  isNotificationSupported = true;
  console.log("[NotificationService] expo-notifications initialized successfully.");
} catch (e) {
  console.log("[NotificationService] expo-notifications failed to initialize. Using fallback stubs.");
}

const INACTIVE_REMINDER_ID = "inactive_user_reminder";

export const notificationService = {
  // 1. Request user permission bounds
  async requestPermissions(): Promise<boolean> {
    if (!isNotificationSupported) {
      console.log("[NotificationService] Stub: requestPermissions skipped.");
      return false;
    }
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("[NotificationService] Permission denied.");
        return false;
      }

      // Android custom notification channels setup
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#6366F1",
        });
      }

      return true;
    } catch (e) {
      console.error("[NotificationService] Permissions error:", e);
      return false;
    }
  },

  // 2. Schedule instant local milestone alerts
  async scheduleMilestoneNotification(message: string): Promise<void> {
    if (!isNotificationSupported) {
      console.log(`[NotificationService] Stub: scheduleMilestoneNotification for "${message}" skipped.`);
      return;
    }
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Milestone Reached! 🏆",
          body: message,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (e) {
      console.error("[NotificationService] Failed to schedule milestone:", e);
    }
  },

  // 3. Retention: Schedule inactive reminder 24 hours out
  async scheduleInactiveUserReminder(): Promise<void> {
    if (!isNotificationSupported) {
      console.log("[NotificationService] Stub: scheduleInactiveUserReminder skipped.");
      return;
    }
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    try {
      // Clean up previous reminder first to prevent multiple notifications
      await Notifications.cancelScheduledNotificationAsync(INACTIVE_REMINDER_ID);

      await Notifications.scheduleNotificationAsync({
        identifier: INACTIVE_REMINDER_ID,
        content: {
          title: "Resume Your Training! 🎓",
          body: "Ready to level up your engineering interface skills today? Open your masterclass tracks now.",
          sound: true,
        },
        trigger: {
          type: "timeInterval",
          seconds: 24 * 60 * 60, // 24 hours later
        } as any,
      });
      console.log("[NotificationService] Inactive user reminder scheduled successfully.");
    } catch (e) {
      console.error("[NotificationService] Failed to schedule inactive reminder:", e);
    }
  },

  // 4. Reset triggers
  async cancelAll(): Promise<void> {
    if (!isNotificationSupported) {
      console.log("[NotificationService] Stub: cancelAll skipped.");
      return;
    }
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error("[NotificationService] Failed to cancel notifications:", e);
    }
  }
};
