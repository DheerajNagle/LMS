import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { asyncStorageBacking } from "./async-storage";

export interface OfflineAction {
  id: string;
  type: "BOOKMARK" | "UNBOOKMARK" | "ENROLL";
  payload: {
    courseId: string;
  };
  timestamp: number;
}

interface OfflineState {
  queue: OfflineAction[];
  enqueueAction: (type: OfflineAction["type"], courseId: string) => void;
  dequeueAction: (id: string) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      queue: [],
      
      enqueueAction: (type, courseId) => set((state) => {
        // Prevent duplicate actions of same type on same course in the queue
        const exists = state.queue.some(
          (a) => a.type === type && a.payload.courseId === courseId
        );
        if (exists) return state;

        const newAction: OfflineAction = {
          id: `${type}_${courseId}_${Date.now()}`,
          type,
          payload: { courseId },
          timestamp: Date.now(),
        };

        return { queue: [...state.queue, newAction] };
      }),

      dequeueAction: (id) => set((state) => ({
        queue: state.queue.filter((action) => action.id !== id),
      })),

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: "offline-sync-queue",
      storage: createJSONStorage(() => asyncStorageBacking),
    }
  )
);
