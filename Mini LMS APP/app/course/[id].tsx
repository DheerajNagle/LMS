import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useCourseStore } from "@/store/useCourseStore";
import { useOffline } from "@/hooks/useOffline";
import { useOfflineStore } from "@/store/useOfflineStore";
import { Image } from "expo-image";
import { ArrowLeft, Clock, Star, Users, CheckCircle2, Play, Bookmark, GraduationCap } from "lucide-react-native";
import { Course } from "@/api/types";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import ErrorState from "@/components/feedback/ErrorState";
import Loader from "@/components/feedback/Loader";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isOnline } = useOffline();
  
  // Zustand Stores
  const { bookmarkedCourseIds, enrolledCourseIds, toggleBookmark, enrollInCourse } = useCourseStore();
  const enqueueOfflineAction = useOfflineStore((state) => state.enqueueAction);

  // Fetch Current Course details
  const { data: course, isLoading, error, refetch } = useQuery({
    queryKey: ["course", id],
    queryFn: () => apiClient.getCourseById(id!),
    enabled: !!id,
  });

  // Fetch all courses to calculate related courses
  const { data: allCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.getCourses(),
    enabled: !!course,
  });

  const isBookmarked = bookmarkedCourseIds.includes(id!);
  const isEnrolled = enrolledCourseIds.includes(id!);

  // Related Courses: Courses in the same category (excluding current)
  const relatedCourses = useMemo(() => {
    if (!course || !allCourses) return [];
    return allCourses.filter((c: Course) => c.category === course.category && c.id !== course.id);
  }, [course, allCourses]);

  // Dynamic Progress simulator for Enrolled Users
  const courseProgress = useMemo(() => {
    if (!isEnrolled) return null;
    // Hardcoded high-fidelity mock progress for enrolled states
    return {
      completedLessons: 2,
      totalLessons: course?.outline.length || 5,
      percent: Math.round((2 / (course?.outline.length || 5)) * 100),
    };
  }, [isEnrolled, course]);

  // Core Enrollment Action
  const handleEnrollment = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isEnrolled) {
      router.push(`/player/${id}`);
      return;
    }

    if (isOnline) {
      try {
        await apiClient.enroll(id!);
        enrollInCourse(id!); // Sync local storage store
        queryClient.invalidateQueries({ queryKey: ["courses"] });
        
        Alert.alert(
          "Enrollment Successful",
          "You are now enrolled. Let's begin the masterclass!",
          [{ text: "Start Learning", onPress: () => router.push(`/player/${id}`) }]
        );
      } catch (err: any) {
        Alert.alert("Enrollment Failed", err.message || "Something went wrong.");
      }
    } else {
      // Offline: Perform Optimistic local enrollment & queue mutation
      enrollInCourse(id!); 
      enqueueOfflineAction("ENROLL", id!);
      
      Alert.alert(
        "Offline Enrollment",
        "We've enrolled you offline! Your course progress will sync silently when you reconnect.",
        [{ text: "Open Player", onPress: () => router.push(`/player/${id}`) }]
      );
    }
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark(id!);
    if (!isOnline) {
      const actionType = isBookmarked ? "UNBOOKMARK" : "BOOKMARK";
      enqueueOfflineAction(actionType, id!);
    } else {
      apiClient.bookmark(id!).catch(console.error);
    }
  };

  if (isLoading) {
    return <Loader message="Loading class specs..." fullScreen />;
  }

  if (error || !course) {
    return (
      <View className="flex-grow bg-slate-50 dark:bg-slate-950 px-6 justify-center">
        <ErrorState
          title="Failed to Load Course"
          errorMsg={error?.message || "We had trouble retrieving the course outline."}
          actionLabel="Retry Outline Load"
          onRetry={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      
      {/* Scrollable Detail Body */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        
        {/* Course Header Hero Banner */}
        <View className="relative w-full h-72">
          <Image
            source={{ uri: course.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-black/40" />
          
          {/* Back & Bookmark Buttons over banner overlay */}
          <View className="absolute top-14 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 rounded-full items-center justify-center shadow-soft"
            >
              <ArrowLeft size={18} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBookmark}
              className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 rounded-full items-center justify-center shadow-soft"
            >
              <Bookmark
                size={18}
                color={isBookmarked ? "#6366F1" : "#94A3B8"}
                fill={isBookmarked ? "#6366F1" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content details */}
        <View className="px-6 pt-6">
          <Animated.View entering={FadeInUp.duration(400)}>
            <Text className="text-brand-500 font-extrabold text-[10px] uppercase tracking-widest mb-1.5">
              {course.category} • {course.level}
            </Text>
            
            <Text className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-3 leading-snug">
              {course.title}
            </Text>

            {/* Course specs list */}
            <View className="flex-row items-center flex-wrap mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <View className="flex-row items-center mr-4 mb-2">
                <Star size={14} color="#EAB308" fill="#EAB308" className="mr-1" />
                <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {course.rating} ({course.ratingCount} reviews)
                </Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <Clock size={14} color="#64748B" className="mr-1" />
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {course.duration}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Users size={14} color="#64748B" className="mr-1" />
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {course.enrolledCount.toLocaleString()} enrolled
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Dynamic Progress Indicator Segment */}
          {courseProgress && (
            <Animated.View 
              entering={FadeInUp.duration(400).delay(100)}
              className="mb-6"
            >
              <Card className="bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/30 p-5 rounded-2xl">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <GraduationCap size={18} color="#6366F1" className="mr-2" />
                    <Text className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      Your Course Progress
                    </Text>
                  </View>
                  <Text className="text-xs font-extrabold text-brand-500">
                    {courseProgress.percent}% Done
                  </Text>
                </View>
                {/* Visual bar */}
                <View className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <View 
                    style={{ width: `${courseProgress.percent}%` }}
                    className="h-full bg-brand-500 rounded-full"
                  />
                </View>
                <Text className="text-[10px] font-semibold text-slate-400">
                  Completed {courseProgress.completedLessons} of {courseProgress.totalLessons} lessons.
                </Text>
              </Card>
            </Animated.View>
          )}

          {/* Description Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(150)} className="mb-6">
            <Text className="text-base font-bold text-slate-900 dark:text-slate-50 mb-2">
              About this course
            </Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {course.description}
            </Text>
          </Animated.View>

          {/* Instructor Profile Card */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} className="mb-6">
            <Text className="text-base font-bold text-slate-900 dark:text-slate-50 mb-3">
              Your Instructor
            </Text>
            <Card className="p-4 flex-row items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Avatar
                source={course.instructor.avatar}
                name={course.instructor.name}
                size="lg"
                className="mr-4"
              />
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                  {course.instructor.name}
                </Text>
                <Text className="text-xs font-semibold text-brand-500 mb-1">
                  {course.instructor.role}
                </Text>
                <Text className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  World-class designer delivering high-fidelity modular learning paths directly to developers.
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* Outline / Lesson Map Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(250)} className="mb-8">
            <Text className="text-base font-bold text-slate-900 dark:text-slate-50 mb-3">
              Course Outline
            </Text>
            {course.outline.map((lesson: string, idx: number) => (
              <View
                key={idx}
                className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl mb-3 shadow-soft dark:shadow-soft-dark"
              >
                <CheckCircle2
                  size={18}
                  color={isEnrolled ? (idx < 2 ? "#10B981" : "#D1D5DB") : "#E2E8F0"}
                  className="mr-3"
                />
                <Text className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1 leading-snug">
                  {lesson}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Related Courses Section */}
          {relatedCourses.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(300)}>
              <Text className="text-base font-bold text-slate-900 dark:text-slate-50 mb-4">
                More in {course.category}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
              >
                {relatedCourses.map((related: Course) => (
                  <TouchableOpacity
                    key={related.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.replace(`/course/${related.id}`);
                    }}
                    className="mr-4 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-soft dark:shadow-soft-dark"
                  >
                    <Image
                      source={{ uri: related.image }}
                      style={{ width: "100%", height: 120 }}
                      contentFit="cover"
                    />
                    <View className="p-4">
                      <Text className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mb-1">
                        {related.level}
                      </Text>
                      <Text 
                        numberOfLines={1}
                        className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mb-1"
                      >
                        {related.title}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Star size={11} color="#EAB308" fill="#EAB308" className="mr-1" />
                        <Text className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {related.rating}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}

        </View>
      </ScrollView>

      {/* Persistent CTA Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex-row items-center justify-between shadow-lg">
        <View>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Tuition Fee
          </Text>
          <Text className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
            Free Masterclass
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleEnrollment}
          className="bg-brand-500 flex-row items-center px-8 py-4 rounded-xl shadow-soft"
          activeOpacity={0.8}
        >
          {isEnrolled ? (
            <>
              <Play size={16} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-bold text-sm">Resume Learning</Text>
            </>
          ) : (
            <Text className="text-white font-bold text-sm">Enroll Now</Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}
