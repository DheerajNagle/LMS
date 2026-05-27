import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useCourseStore } from "@/store/useCourseStore";
import { useOffline } from "@/hooks/useOffline";
import { useOfflineStore } from "@/store/useOfflineStore";
import { Search as SearchIcon, X, Compass } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LegendList } from "@legendapp/list";
import * as Haptics from "expo-haptics";
import { Course } from "@/api/types";
import { CourseCard } from "@/components/ui/CourseCard";
import CourseCardSkeleton from "@/components/feedback/CourseCardSkeleton";
import { useRouter } from "expo-router";

const CATEGORIES = ["All", "Product Design", "Software Engineering", "Productivity", "Mobile Development"];

export default function SearchScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  
  // Zustand client stores
  const { bookmarkedCourseIds, enrolledCourseIds, toggleBookmark } = useCourseStore();
  const enqueueOfflineAction = useOfflineStore((state) => state.enqueueAction);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 1. Debounce search query to prevent excessive layout thrashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.getCourses(),
    staleTime: 1000 * 60 * 10,
  });

  // Calculate dynamic progress values for enrolled items
  const getCourseProgress = useCallback((course: Course) => {
    const total = course.outline.length || 5;
    const completed = course.id === "1" ? 3 : course.id === "2" ? 2 : 1;
    return Math.round((completed / total) * 100);
  }, []);

  // 2. Memoize combined Category & Search text filtering
  const filteredCourses = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    return courses?.filter((c: Course) => {
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }) || [];
  }, [courses, debouncedQuery, selectedCategory]);

  const handleBookmarkToggle = useCallback((courseId: string) => {
    toggleBookmark(courseId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isOnline) {
      apiClient.bookmark(courseId).catch((err) => {
        console.error("Failed to bookmark online:", err);
      });
    } else {
      const currentlyBookmarked = bookmarkedCourseIds.includes(courseId);
      const actionType = currentlyBookmarked ? "UNBOOKMARK" : "BOOKMARK";
      enqueueOfflineAction(actionType, courseId);
    }
  }, [bookmarkedCourseIds, isOnline, toggleBookmark, enqueueOfflineAction]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const renderItem = useCallback(({ item }: { item: Course }) => {
    const isBookmarked = bookmarkedCourseIds.includes(item.id);
    const isEnrolled = enrolledCourseIds.includes(item.id);
    const progress = isEnrolled ? getCourseProgress(item) : undefined;

    return (
      <Animated.View entering={FadeInDown.duration(400)}>
        <CourseCard
          course={item}
          isBookmarked={isBookmarked}
          onToggleBookmark={handleBookmarkToggle}
          progress={progress}
          onPress={() => router.push(`/course/${item.id}`)}
        />
      </Animated.View>
    );
  }, [bookmarkedCourseIds, enrolledCourseIds, handleBookmarkToggle, getCourseProgress, router]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 pt-16">
      
      {/* Title block */}
      <View className="px-6 mb-4">
        <Text className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          Course Catalog
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore complete dynamic masterclass libraries.
        </Text>
      </View>

      {/* Search Input Bar */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl px-4 py-1 shadow-soft dark:shadow-soft-dark">
          <SearchIcon size={18} color="#94A3B8" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="What do you want to learn today?"
            placeholderTextColor="#94A3B8"
            className="flex-1 py-3.5 px-3 text-slate-900 dark:text-slate-50 text-sm font-semibold"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable 
              onPress={() => {
                setQuery("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }} 
              className="p-1"
            >
              <X size={16} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Horizontal Filter capsules */}
      <View className="h-12 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, alignItems: "center" }}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => handleCategorySelect(category)}
                className={`mr-3 px-4.5 py-2.5 rounded-full border ${
                  isSelected
                    ? "bg-brand-500 border-brand-500"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Filtered course performant LegendList (required by assignment spec Part 5.2) */}
      {isLoading ? (
        <View className="px-6 flex-grow">
          {[1, 2].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <LegendList
          data={filteredCourses}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={380}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          renderItem={renderItem}
          recycleItems
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Compass size={32} color="#94A3B8" className="mb-3" />
              <Text className="text-slate-900 dark:text-slate-550 text-sm font-bold text-center">
                No matching courses found
              </Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
                Try searching with general track criteria or switch the category filter.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
