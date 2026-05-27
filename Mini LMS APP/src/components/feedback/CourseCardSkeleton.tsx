import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export default function CourseCardSkeleton() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    // Repeated pulse animation running fully on the native thread!
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1, // Infinite repeat loops
      true // Reverse direction
    );
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[pulseStyle]}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden mb-6 shadow-soft dark:shadow-soft-dark"
    >
      {/* Cover image skeleton placeholder */}
      <View className="w-full h-48 bg-slate-200 dark:bg-slate-800" />

      {/* Details skeleton container */}
      <View className="p-5">
        <View className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
        <View className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2" />
        <View className="w-4/5 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        
        {/* Specs Row */}
        <View className="flex-row items-center border-b border-slate-50 dark:border-slate-800/40 pb-4 mb-4">
          <View className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded mr-4" />
          <View className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </View>

        {/* Instructor skeleton */}
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 mr-3" />
          <View className="flex-1">
            <View className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded mb-1.5" />
            <View className="w-20 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
