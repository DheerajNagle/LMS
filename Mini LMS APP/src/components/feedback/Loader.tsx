import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { clsx } from "clsx";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loader({
  message = "Loading...",
  fullScreen = false,
  className,
}: LoaderProps) {
  const containerStyle = clsx(
    "items-center justify-center p-6",
    fullScreen 
      ? "absolute inset-0 bg-slate-50/90 dark:bg-slate-950/90 z-50 flex-1" 
      : "w-full",
    className
  );

  return (
    <View 
      className={containerStyle}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-soft dark:shadow-soft-dark items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        {message && (
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 text-center tracking-wide uppercase">
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}
