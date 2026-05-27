import React, { useState } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { clsx } from "clsx";

interface AvatarProps {
  source?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Avatar({ source, name, size = "md", className }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeDimensions = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    sm: "text-[10px]",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-2xl",
  };

  // Convert name to dynamic 2-character initials
  const getInitials = (fullName?: string) => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const showFallback = !source || hasError;

  return (
    <View
      className={clsx(
        "rounded-full bg-brand-50 dark:bg-brand-950/30 border border-slate-100 dark:border-slate-800 items-center justify-center overflow-hidden shadow-soft",
        sizeDimensions[size],
        className
      )}
      accessibilityRole="image"
      accessibilityLabel={`Avatar profile image of ${name || "User"}`}
    >
      {showFallback ? (
        <Text className={clsx("font-extrabold text-brand-500", textSizes[size])}>
          {getInitials(name)}
        </Text>
      ) : (
        <Image
          source={{ uri: source }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
}
