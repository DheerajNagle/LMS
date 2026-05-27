import React, { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useCourseStore } from "@/store/useCourseStore";
import { useOffline } from "@/hooks/useOffline";
import { useOfflineStore } from "@/store/useOfflineStore";
import { useAuth } from "@/hooks/useAuth";
import { Compass, Flame, Clock, Play, BookOpen } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CourseCard } from "@/components/ui/CourseCard";
import CourseCardSkeleton from "@/components/feedback/CourseCardSkeleton";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/feedback/EmptyState";
import { Course } from "@/api/types";
import { Image } from "expo-image";

const CATEGORIES = ["All", "Product Design", "Software Engineering", "Productivity", "Mobile Development"];

export default function CatalogScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { user } = useAuth();
  
  // Zustand client stores
  const { bookmarkedCourseIds, enrolledCourseIds, toggleBookmark } = useCourseStore();
  const enqueueOfflineAction = useOfflineStore((state) => state.enqueueAction);

  // Filter category state
  const [selectedCategory, setSelectedCategory] = useState("All");

  // React Query server status caching
  const { data: courses, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.getCourses(),
    staleTime: 1000 * 60 * 10,
  });

  // Calculate dynamic greeting message based on local time
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Filter courses active for user's continue learning row
  const enrolledCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c: Course) => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds]);

  // Generate dynamic simulated progress status for enrolled courses
  const getCourseProgress = useCallback((course: Course) => {
    const total = course.outline.length || 5;
    // Dynamic completion simulation based on id
    const completed = course.id === "1" ? 3 : course.id === "2" ? 2 : 1;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  }, []);

  // Memoized Toggle handler to prevent child re-renders
  const handleBookmarkToggle = useCallback((courseId: string) => {
    const currentlyBookmarked = bookmarkedCourseIds.includes(courseId);
    toggleBookmark(courseId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isOnline) {
      apiClient.bookmark(courseId).catch((err) => {
        console.error("Failed to bookmark online:", err);
      });
    } else {
      const actionType = currentlyBookmarked ? "UNBOOKMARK" : "BOOKMARK";
      enqueueOfflineAction(actionType, courseId);
    }
  }, [bookmarkedCourseIds, isOnline, toggleBookmark, enqueueOfflineAction]);

  // Memoize filtered items list for featured section
  const filteredCourses = useMemo(() => {
    return courses?.filter((course: Course) => {
      if (selectedCategory === "All") return true;
      return course.category === selectedCategory;
    }) || [];
  }, [courses, selectedCategory]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 pt-14">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#6366F1"
          />
        }
      >
        
        {/* 1. Profile Greetings & Avatar Header */}
        <View className="px-6 py-4 flex-row justify-between items-center mb-2">
          <View className="flex-1 mr-4">
            <Text className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {greeting}, {user?.name || "Learner"}!
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Ready to master fine digital alignments today?
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/profile");
            }}
            activeOpacity={0.8}
          >
            <Avatar
              source={user?.avatar}
              name={user?.name || "Student"}
              size="md"
            />
          </TouchableOpacity>
        </View>

        {/* 2. Interactive Performance Progress Overview Grid */}
        <View className="px-6 mb-4 flex-row justify-between">
          <View className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl mr-2 flex-row items-center shadow-soft dark:shadow-soft-dark">
            <View className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl items-center justify-center mr-3">
              <Flame size={20} color="#F59E0B" fill="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Streak</Text>
              <Text className="text-sm font-black text-slate-900 dark:text-slate-50 mt-0.5">5 Days 🔥</Text>
            </View>
          </View>

          <View className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl ml-2 flex-row items-center shadow-soft dark:shadow-soft-dark">
            <View className="w-10 h-10 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl items-center justify-center mr-3">
              <Clock size={20} color="#6366F1" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Study Time</Text>
              <Text className="text-sm font-black text-slate-900 dark:text-slate-50 mt-0.5">12.5 hrs ⚡</Text>
            </View>
          </View>
        </View>

        {/* Overall Curriculum Milestone Widget */}
        <View className="px-6 mb-6">
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-soft dark:shadow-soft-dark flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-[9px] font-extrabold text-brand-500 uppercase tracking-widest mb-0.5">
                Overall Milestone
              </Text>
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-2">
                Core Digital Curriculum Progress
              </Text>
              <View className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <View style={{ width: "64%" }} className="h-full bg-brand-500 rounded-full" />
              </View>
            </View>
            <View className="items-end ml-2">
              <Text className="text-lg font-black text-brand-500">64%</Text>
              <Text className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">3/5 Completed</Text>
            </View>
          </View>
        </View>

        {/* 3. Continue Learning Active Track Section */}
        <View className="mb-6">
          <View className="px-6 mb-3 flex-row justify-between items-center">
            <Text className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Continue Learning
            </Text>
            {enrolledCourses.length > 0 && (
              <Text className="text-xs font-bold text-brand-500">
                {enrolledCourses.length} active class{enrolledCourses.length > 1 ? "es" : ""}
              </Text>
            )}
          </View>

          {enrolledCourses.length === 0 ? (
            <View className="mx-6 p-6 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl items-center justify-center">
              <BookOpen size={24} color="#94A3B8" className="mb-2" />
              <Text className="text-xs font-bold text-slate-800 dark:text-slate-200 text-center mb-1">
                No active classes enrolled
              </Text>
              <Text className="text-[10px] text-slate-400 dark:text-slate-500 text-center mb-3">
                Enroll in a masterclass details page to begin study.
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/search");
                }}
                className="bg-brand-500 px-4 py-2.5 rounded-xl shadow-soft"
              >
                <Text className="text-white text-xs font-bold">Discover Catalog</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
            >
              {enrolledCourses.map((course: Course) => {
                const progress = getCourseProgress(course);
                return (
                  <View
                    key={course.id}
                    className="mr-4 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-soft dark:shadow-soft-dark flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1 mr-3">
                      <Image
                        source={{ uri: course.image }}
                        style={{ width: 44, height: 44, borderRadius: 10, marginRight: 12 }}
                        contentFit="cover"
                      />
                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-xs font-bold text-slate-900 dark:text-slate-50 mb-1">
                          {course.title}
                        </Text>
                        <Text className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mb-1.5">
                          Completed {progress.completed} of {progress.total} lessons
                        </Text>
                        <View className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <View style={{ width: `${progress.percent}%` }} className="h-full bg-brand-500 rounded-full" />
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push(`/player/${course.id}`);
                      }}
                      className="w-8 h-8 bg-brand-500 rounded-full items-center justify-center shadow-soft"
                    >
                      <Play size={10} color="#FFFFFF" fill="#FFFFFF" className="ml-0.5" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* 4. Category Horizontal Pill capsules */}
        <View className="h-12 mb-6">
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

        {/* 5. Featured Masterclasses List Section */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Featured Masterclasses
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text className="text-xs font-bold text-brand-500">See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View className="flex-grow">
              {[1, 2].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </View>
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              icon={<Compass size={24} color="#94A3B8" />}
              title="No courses found"
              description="We couldn't find any courses matching the selected learning track."
              actionLabel="Show All Courses"
              onAction={() => handleCategorySelect("All")}
            />
          ) : (
            <View>
              {filteredCourses.map((item: Course) => {
                const isBookmarked = bookmarkedCourseIds.includes(item.id);
                return (
                  <Animated.View key={item.id} entering={FadeInDown.duration(400)}>
                    <CourseCard
                      course={item}
                      isBookmarked={isBookmarked}
                      onToggleBookmark={handleBookmarkToggle}
                      onPress={() => router.push(`/course/${item.id}`)}
                    />
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
