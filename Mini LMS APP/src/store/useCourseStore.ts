import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "./mmkv-storage";

interface CourseState {
  bookmarkedCourseIds: string[];
  enrolledCourseIds: string[];
  toggleBookmark: (courseId: string) => void;
  enrollInCourse: (courseId: string) => void;
  setBookmarked: (courseIds: string[]) => void;
  setEnrolled: (courseIds: string[]) => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      bookmarkedCourseIds: [],
      enrolledCourseIds: [],

      toggleBookmark: (courseId) => set((state) => {
        const isBookmarked = state.bookmarkedCourseIds.includes(courseId);
        const bookmarkedCourseIds = isBookmarked
          ? state.bookmarkedCourseIds.filter((id) => id !== courseId)
          : [...state.bookmarkedCourseIds, courseId];
        return { bookmarkedCourseIds };
      }),

      enrollInCourse: (courseId) => set((state) => {
        if (state.enrolledCourseIds.includes(courseId)) return state;
        return { enrolledCourseIds: [...state.enrolledCourseIds, courseId] };
      }),

      setBookmarked: (bookmarkedCourseIds) => set({ bookmarkedCourseIds }),
      setEnrolled: (enrolledCourseIds) => set({ enrolledCourseIds }),
    }),
    {
      name: "course-status-store",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
