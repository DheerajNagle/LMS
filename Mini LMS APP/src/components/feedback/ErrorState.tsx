import React from "react";
import { View, Text } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import Button from "../ui/Button";
import { clsx } from "clsx";

interface ErrorStateProps {
  title?: string;
  errorMsg?: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  errorMsg = "We encountered a network issue. Please check your connection and try again.",
  actionLabel = "Retry Request",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <View 
      className={clsx("flex-1 items-center justify-center py-12 px-6", className)}
      accessibilityRole="alert"
    >
      {/* Icon Frame */}
      <View className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl items-center justify-center mb-5 shadow-soft">
        <AlertTriangle size={24} color="#F43F5E" />
      </View>

      {/* Texts */}
      <Text className="text-lg font-extrabold text-slate-900 dark:text-slate-50 text-center mb-1.5 leading-snug">
        {title}
      </Text>
      
      <Text className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed max-w-[260px]">
        {errorMsg}
      </Text>

      {/* Retry Button */}
      {onRetry && (
        <Button
          title={actionLabel}
          onPress={onRetry}
          variant="outline"
          size="sm"
          className="border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-6 py-2.5 rounded-xl"
        />
      )}
    </View>
  );
}
