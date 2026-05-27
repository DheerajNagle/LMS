import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Star, Clock, Bookmark } from "lucide-react-native";
import { Course } from "@/api/types";
import Avatar from "./Avatar";
import Card from "./Card";
import * as Haptics from "expo-haptics";

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  progress?: number;
  onPress?: () => void;
}

// Memoized using React.memo to ensure 60 FPS scrolling in FlashList!
export const CourseCard = React.memo(function CourseCard({
  course,
  isBookmarked,
  onToggleBookmark,
  progress,
  onPress,
}: CourseCardProps) {

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  const handleBookmarkPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggleBookmark(course.id);
  };

  return (
    <View className="relative mb-5">
      <Card 
        onPress={handleCardPress} 
        className="shadow-soft dark:shadow-soft-dark active:opacity-95"
      >
        {/* Cover Image & Category Badge */}
        <View className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            source={{ uri: course.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={250}
          />
          
          {/* Floating Category Tag */}
          <View className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full border border-slate-100/10 shadow-soft">
            <Text className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              {course.category}
            </Text>
          </View>
        </View>

      {/* Course Info */}
      <Card.Body className="p-5">
        <Text className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-1.5">
          {course.level}
        </Text>

        <Text className="text-base font-extrabold text-slate-900 dark:text-slate-50 mb-2 leading-snug">
          {course.title}
        </Text>

        <Text 
          numberOfLines={2} 
          className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed"
        >
          {course.subtitle}
        </Text>

        {progress !== undefined && (
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Course Progress</Text>
              <Text className="text-[10px] font-extrabold text-brand-500">{progress}% Done</Text>
            </View>
            <View className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <View style={{ width: `${progress}%` }} className="h-full bg-brand-500 rounded-full" />
            </View>
          </View>
        )}

        {/* Specs Row */}
        <View className="flex-row items-center border-b border-slate-50 dark:border-slate-850 pb-4 mb-4">
          <View className="flex-row items-center mr-4">
            <Star size={13} color="#EAB308" fill="#EAB308" className="mr-1" />
            <Text className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {course.rating}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Clock size={13} color="#94A3B8" className="mr-1" />
            <Text className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {course.duration}
            </Text>
          </View>
        </View>

        {/* Instructor Card Row */}
        <View className="flex-row items-center">
          <Avatar
            source={course.instructor.avatar}
            name={course.instructor.name}
            size="sm"
            className="mr-3"
          />
          <View className="flex-1">
            <Text className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
              {course.instructor.name}
            </Text>
            <Text className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {course.instructor.role}
            </Text>
          </View>
        </View>

      </Card.Body>
      </Card>

      {/* Floating Bookmark Button - sibling of Card to prevent touch events propagation issue */}
      <TouchableOpacity
        onPress={handleBookmarkPress}
        activeOpacity={0.8}
        style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
        className="w-9 h-9 bg-white/90 dark:bg-slate-900/90 rounded-full items-center justify-center shadow-soft"
      >
        <Bookmark
          size={15}
          color={isBookmarked ? "#6366F1" : "#94A3B8"}
          fill={isBookmarked ? "#6366F1" : "transparent"}
        />
      </TouchableOpacity>
    </View>
  );
});
