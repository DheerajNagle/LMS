import React, { useEffect } from "react";
import { Text } from "react-native";
import { useNetworkStore } from "@/store/useNetworkStore";
import { AlertCircle } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

export default function NetworkBanner() {
  const isOnline = useNetworkStore((state) => state.isOnline());
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (!isOnline) {
      // Slide down
      translateY.value = withSpring(0, { damping: 15 });
    } else {
      // Slide back up
      translateY.value = withTiming(-100, { duration: 300 });
    }
  }, [isOnline, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute top-12 left-0 right-0 z-50 bg-amber-500/95 dark:bg-amber-600/95 px-6 py-3.5 shadow-md flex-row items-center border-b border-amber-400/20"
      accessibilityRole="alert"
    >
      <AlertCircle size={16} color="#FFFFFF" className="mr-2.5" />
      <Text className="text-white text-xs font-bold leading-relaxed flex-1">
        Airplane / Offline Mode Active. Local cache hydrated.
      </Text>
    </Animated.View>
  );
}
