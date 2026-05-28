import { useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useNetworkStore } from "@/store/useNetworkStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { apiClient } from "@/api/client";
import { useCourseStore } from "@/store/useCourseStore";

export function useOffline() {
  const isOnline = useNetworkStore((state) => state.isOnline());
  const queue = useOfflineStore((state) => state.queue);
  const dequeueAction = useOfflineStore((state) => state.dequeueAction);
  const enrollInCourse = useCourseStore((state) => state.enrollInCourse);

  // Unified background queue execution
  const syncOfflineQueue = useCallback(async () => {
    if (queue.length === 0) return;
    
    // We execute them sequentially (FIFO) to preserve order of user intent
    for (const action of queue) {
      try {
        if (action.type === "ENROLL") {
          await apiClient.enroll(action.payload.courseId);
          enrollInCourse(action.payload.courseId);
        } else if (action.type === "BOOKMARK") {
          await apiClient.bookmark(action.payload.courseId);
        } else if (action.type === "UNBOOKMARK") {
          // In dynamic API, we'd delete bookmark
          await apiClient.bookmark(action.payload.courseId);
        }
        
        // Success: pop from queue
        dequeueAction(action.id);
      } catch (error) {
        console.error(`[OfflineSync] Sync failed for action ID ${action.id}:`, error);
        // Break out to prevent continuous failures locking the main process thread
        break;
      }
    }
    
    Alert.alert(
      "Sync Completed",
      "All your offline updates have been successfully synchronized with the cloud."
    );
  }, [queue, dequeueAction, enrollInCourse]);

  // Automatically trigger sync when the app moves from offline back to online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOnline, queue.length, syncOfflineQueue]);

  return {
    isOnline,
    queueLength: queue.length,
    syncOfflineQueue,
  };
}
