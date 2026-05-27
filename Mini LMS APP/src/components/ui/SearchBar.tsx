import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Search, X } from "lucide-react-native";
import { clsx } from "clsx";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={clsx(
        "flex-row items-center border bg-white dark:bg-slate-900 rounded-xl px-3.5 py-1 shadow-soft dark:shadow-soft-dark transition-colors",
        isFocused 
          ? "border-brand-500" 
          : "border-slate-200 dark:border-slate-800",
        className
      )}
    >
      <Search size={18} color="#94A3B8" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 py-3 px-3 text-slate-900 dark:text-slate-50 text-sm font-semibold"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search input"
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          className="p-1 rounded-full bg-slate-50 dark:bg-slate-800"
          activeOpacity={0.7}
        >
          <X size={12} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}
