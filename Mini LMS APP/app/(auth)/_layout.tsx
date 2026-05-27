import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Reverse Authentication Gate: Redirect to /app tabs if already logged in
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return (
      <View className="flex-grow justify-center items-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F8FAFC" },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          animation: "fade_from_bottom",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
