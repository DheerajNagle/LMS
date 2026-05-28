import React, { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { clientPersister } from "@/api/queryPersister";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "@/theme/global.css"; // Ensure NativeWind processes this global CSS
import { useThemeStore } from "@/store/useThemeStore";
import NetworkBanner from "@/components/ui/NetworkBanner";
import { notificationService } from "@/utils/notification-service";

// Initialize Query Client with production-grade defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collect
    },
  },
});

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const theme = useThemeStore((state) => state.theme);

  // Synchronize Zustand dynamic store with NativeWind's color scheme
  useEffect(() => {
    if (theme === "system") {
      // In production, we'd hook this to RN Appearance
      setColorScheme("dark");
    } else {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  // Schedule retention notifications on bootstrap launch and app background transition
  useEffect(() => {
    notificationService.scheduleInactiveUserReminder().catch(console.error);

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        notificationService.scheduleInactiveUserReminder().catch(console.error);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ 
          persister: clientPersister,
          maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days cache maxAge
        }}
      >
        <SafeAreaProvider>
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
          <NetworkBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: theme === "dark" ? "#020617" : "#F8FAFC",
              },
            }}
          >
            {/* The (auth) dynamic stack router group */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            
            {/* The (tabs) primary navigation container */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            {/* Dynamic detailed routes */}
            <Stack.Screen
              name="course/[id]"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="player/[id]"
              options={{
                headerShown: false,
                presentation: "fullScreenModal",
                animation: "fade_from_bottom",
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
