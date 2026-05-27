import React, { useCallback } from "react";
import { View, Text, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useCourseStore } from "@/store/useCourseStore";
import { Course } from "@/api/types";
import { useOffline } from "@/hooks/useOffline";
import { useOfflineStore } from "@/store/useOfflineStore";
import { Bookmark } from "lucide-react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { CourseCard } from "@/components/ui/CourseCard";
import EmptyState from "@/components/feedback/EmptyState";
import { LegendList } from "@legendapp/list";
import * as Haptics from "expo-haptics";

export default function BookmarksScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  
  // Zustand client stores
  const { bookmarkedCourseIds, toggleBookmark } = useCourseStore();
  const enqueueOfflineAction = useOfflineStore((state) => state.enqueueAction);

  const { data: courses, isRefetching, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.getCourses(),
    staleTime: 1000 * 60 * 10,
  });

  const bookmarkedCourses = courses?.filter((c: Course) => bookmarkedCourseIds.includes(c.id)) || [];

  const handleBookmarkToggle = useCallback((courseId: string) => {
    toggleBookmark(courseId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isOnline) {
      apiClient.bookmark(courseId).catch((err) => {
        console.error("Failed to unbookmark online:", err);
      });
    } else {
      enqueueOfflineAction("UNBOOKMARK", courseId);
    }
  }, [isOnline, toggleBookmark, enqueueOfflineAction]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <Animated.View 
        entering={FadeInDown.duration(300)}
        layout={Layout.springify()}
      >
        <CourseCard
          course={item}
          isBookmarked={true}
          onToggleBookmark={handleBookmarkToggle}
          onPress={() => router.push(`/course/${item.id}`)}
        />
      </Animated.View>
    );
  }, [handleBookmarkToggle, router]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 pt-16">
      
      {/* Title */}
      <View className="px-6 mb-6">
        <Text className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          Saved Courses
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your off-grid library is always ready and cached.
        </Text>
      </View>

      {/* Performant LegendList (required by assignment spec Part 5.2) */}
      <LegendList
        data={bookmarkedCourses}
        keyExtractor={(item: any) => item.id}
        estimatedItemSize={380}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        renderItem={renderItem}
        recycleItems
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#6366F1"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Bookmark size={24} color="#94A3B8" />}
            title="Saved list is empty"
            description="Bookmark elite digital guides to read them anytime, even in Airplane Mode!"
            actionLabel="Discover Masterclasses"
            onAction={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(tabs)");
            }}
          />
        }
      />
    </View>
  );
}

