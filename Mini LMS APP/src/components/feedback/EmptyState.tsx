import React from "react";
import { View, Text } from "react-native";
import Button from "../ui/Button";
import { clsx } from "clsx";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View 
      className={clsx("flex-1 items-center justify-center py-12 px-6", className)}
      accessibilityRole="summary"
    >
      {/* Icon frame */}
      <View className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl items-center justify-center mb-5 shadow-soft dark:shadow-soft-dark border border-slate-100/50 dark:border-slate-800/50">
        {icon}
      </View>

      {/* Headings */}
      <Text className="text-lg font-extrabold text-slate-900 dark:text-slate-50 text-center mb-1.5 leading-snug">
        {title}
      </Text>
      
      <Text className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6 leading-relaxed max-w-[260px]">
        {description}
      </Text>

      {/* Call to Action Button */}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          className="px-6 py-2.5 rounded-xl"
        />
      )}
    </View>
  );
}
