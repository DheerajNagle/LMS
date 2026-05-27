import React from "react";
import { Pressable, Text, ActivityIndicator, GestureResponderEvent } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { clsx } from "clsx";

interface ButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  onPress,
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    scale.value = withSpring(0.96, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    if (disabled || isLoading) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(e);
  };

  // Variant classes (Linear + Airbnb inspired slate/indigo aesthetics)
  const variantStyles = {
    primary: "bg-brand-500 active:bg-brand-600 dark:bg-brand-500 dark:active:bg-brand-600 border-transparent",
    secondary: "bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700 border-transparent",
    outline: "bg-transparent border border-slate-200 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-900",
    ghost: "bg-transparent border-transparent active:bg-slate-100 dark:active:bg-slate-900/30",
  };

  const textStyles = {
    primary: "text-white font-bold",
    secondary: "text-slate-800 dark:text-slate-200 font-semibold",
    outline: "text-slate-700 dark:text-slate-300 font-semibold",
    ghost: "text-slate-600 dark:text-slate-400 font-semibold",
  };

  const sizeStyles = {
    sm: "px-3 py-2 rounded-lg text-xs",
    md: "px-5 py-3.5 rounded-xl text-sm",
    lg: "px-6 py-4.5 rounded-2xl text-base",
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={[animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: isLoading }}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      className={clsx(
        "flex-row items-center justify-center border",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50",
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === "primary" ? "#FFFFFF" : "#6366F1"} 
          size="small" 
          className="mr-2"
        />
      ) : leftIcon ? (
        <React.Fragment>
          {leftIcon}
          <View style={{ width: 8 }} />
        </React.Fragment>
      ) : null}

      <Text className={clsx(textStyles[variant], size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm")}>
        {title}
      </Text>

      {!isLoading && rightIcon && (
        <React.Fragment>
          <View style={{ width: 8 }} />
          {rightIcon}
        </React.Fragment>
      )}
    </AnimatedPressable>
  );
}

// Simple absolute inline Spacer helper inside Button
import { View } from "react-native";
