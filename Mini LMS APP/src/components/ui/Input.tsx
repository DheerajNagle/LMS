import React, { useState } from "react";
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { clsx } from "clsx";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  className?: string;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  isPassword = false,
  className,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isSecure = isPassword && !showPassword;

  return (
    <View className={clsx("w-full mb-4", className)}>
      {/* Label */}
      {label && (
        <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </Text>
      )}

      {/* Field wrapper */}
      <View
        className={clsx(
          "flex-row items-center border rounded-xl px-3 bg-white dark:bg-slate-900 transition-colors",
          isFocused 
            ? "border-brand-500" 
            : error 
              ? "border-rose-500" 
              : "border-slate-200 dark:border-slate-800"
        )}
      >
        {/* Left Icon Slot */}
        {leftIcon && (
          <View className="mr-2">
            {leftIcon}
          </View>
        )}

        {/* Input */}
        <TextInput
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          placeholderTextColor="#94A3B8"
          accessibilityLabel={label}
          accessibilityHint={error || helperText}
          className="flex-1 py-3.5 text-slate-900 dark:text-slate-50 text-sm font-medium"
          {...props}
        />

        {/* Right Icon / Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            className="p-1 ml-2"
          >
            {showPassword ? (
              <EyeOff size={18} color="#94A3B8" />
            ) : (
              <Eye size={18} color="#94A3B8" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Validation / Description Labels */}
      {error ? (
        <Text className="text-xs text-rose-500 font-semibold mt-1">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
