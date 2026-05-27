import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useThemeStore } from "@/store/useThemeStore";
import { useNetworkStore } from "@/store/useNetworkStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { useCourseStore } from "@/store/useCourseStore";
import { Image } from "expo-image";
import { LogOut, Sun, Moon, Wifi, WifiOff, CloudLightning, RefreshCw, Layers, Award, BookOpen, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useOffline } from "@/hooks/useOffline";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { Course } from "@/api/types";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateAvatar } = useAuth();
  const { theme, setTheme } = useThemeStore();
  const { isSimulatedOffline, toggleSimulatedOffline } = useNetworkStore();
  
  // Custom offline sync handlers
  const { isOnline, queueLength, syncOfflineQueue } = useOffline();
  const clearQueue = useOfflineStore((state) => state.clearQueue);

  // Zustand course metrics
  const { bookmarkedCourseIds, enrolledCourseIds } = useCourseStore();

  // Load courses query to display enrolled course progress details
  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.getCourses(),
    staleTime: 1000 * 60 * 10,
  });

  const enrolledCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c: Course) => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds]);

  // Calculate dynamic completed lesson counts
  const totalCompletedLessons = useMemo(() => {
    return enrolledCourseIds.reduce((acc, courseId) => {
      // Course 1 has 3 completed, course 2 has 2, others have 1 completed lesson
      const completed = courseId === "1" ? 3 : courseId === "2" ? 2 : 1;
      return acc + completed;
    }, 0);
  }, [enrolledCourseIds]);

  const handleSignOut = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to end your active session?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await logout();
          } 
        }
      ]
    );
  };

  const handleOfflineSimulationToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSimulatedOffline();
  };

  const handleUpdateAvatar = async () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose a source for your new profile picture:",
      [
        {
          text: "Choose from Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const imageUri = result.assets[0].uri;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await updateAvatar(imageUri);
            }
          }
        },
        {
          text: "Take Photo",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permission Denied", "Sorry, we need camera permissions to make this work!");
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const imageUri = result.assets[0].uri;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await updateAvatar(imageUri);
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      className="flex-1 bg-slate-50 dark:bg-slate-950 pt-16"
    >
      
      {/* 1. PREMIUM USER PROFILE HERO CARD */}
      <View className="px-6 mb-6">
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-soft dark:shadow-soft-dark flex-row items-center">
          <TouchableOpacity onPress={handleUpdateAvatar} activeOpacity={0.85} className="relative">
            <Image
              source={{ uri: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" }}
              style={{ width: 72, height: 72, borderRadius: 36 }}
              contentFit="cover"
            />
            {/* Small camera edit badge */}
            <View className="absolute -top-1 -right-1 bg-brand-500 w-5 h-5 rounded-full items-center justify-center border border-white dark:border-slate-900 shadow-sm">
              <Text className="text-[10px] text-white font-extrabold leading-none">+</Text>
            </View>
            {/* Active network dot */}
            <View className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
              isOnline ? "bg-emerald-500" : "bg-amber-500"
            }`} />
          </TouchableOpacity>

          <View className="flex-1 ml-4.5">
            <View className="flex-row items-center">
              <Text className="text-lg font-black text-slate-900 dark:text-slate-50 mr-2">
                {user?.name || "Premium Learner"}
              </Text>
              <View className="bg-brand-500/10 dark:bg-brand-500/20 px-2.5 py-0.5 rounded-full">
                <Text className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Pro</Text>
              </View>
            </View>
            <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
              {user?.email || "learner@minilms.com"}
            </Text>
            <Text className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-2">
              Joined May 2026
            </Text>
          </View>
        </View>
      </View>

      {/* 2. DYNAMIC LEARNING METRICS PROGRESS CARD */}
      <View className="px-6 mb-6">
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-soft dark:shadow-soft-dark flex-row justify-between items-center">
          
          <View className="flex-1 items-center">
            <Text className="text-lg font-black text-brand-500">{enrolledCourseIds.length}</Text>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
              Enrolled
            </Text>
          </View>
          
          <View className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
          
          <View className="flex-1 items-center">
            <Text className="text-lg font-black text-brand-500">{totalCompletedLessons}</Text>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
              Completed
            </Text>
          </View>
          
          <View className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
          
          <View className="flex-1 items-center">
            <Text className="text-lg font-black text-brand-500">{bookmarkedCourseIds.length}</Text>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
              Saved
            </Text>
          </View>

        </View>
      </View>

      {/* 3. ENROLLED COURSE PROGRESS CHECKLIST (Modern Card UI) */}
      <View className="px-6 mb-6">
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-soft dark:shadow-soft-dark">
          <View className="flex-row items-center mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
            <Award size={18} color="#6366F1" className="mr-2.5" />
            <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-sm">
              Current Learning Syllabus
            </Text>
          </View>

          {enrolledCourses.length === 0 ? (
            <View className="py-6 items-center">
              <BookOpen size={20} color="#94A3B8" className="mb-2" />
              <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-bold text-center">
                You are not enrolled in any masterclasses yet.
              </Text>
            </View>
          ) : (
            <View>
              {enrolledCourses.map((course: Course) => {
                const total = course.outline.length || 5;
                const completed = course.id === "1" ? 3 : course.id === "2" ? 2 : 1;
                const percent = Math.round((completed / total) * 100);

                return (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/course/${course.id}`);
                    }}
                    className="flex-row items-center justify-between py-3 mb-2 border-b border-slate-50 dark:border-slate-800/40 last:border-b-0"
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: course.image }}
                      style={{ width: 36, height: 36, borderRadius: 8, marginRight: 12 }}
                      contentFit="cover"
                    />
                    <View className="flex-1 mr-3">
                      <Text numberOfLines={1} className="text-xs font-bold text-slate-900 dark:text-slate-550 mb-1">
                        {course.title}
                      </Text>
                      <View className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <View style={{ width: `${percent}%` }} className="h-full bg-brand-500 rounded-full" />
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-[10px] font-black text-brand-500 mr-1.5">{percent}%</Text>
                      <ChevronRight size={12} color="#94A3B8" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* 4. SETTINGS & SYNC DASHBOARD (Card-based UI) */}
      
      {/* Network Sync Control Card */}
      <View className="px-6 mb-6">
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-soft dark:shadow-soft-dark">
          <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
            <View className="flex-row items-center">
              {isOnline ? (
                <Wifi size={18} color="#10B981" className="mr-2.5" />
              ) : (
                <WifiOff size={18} color="#F59E0B" className="mr-2.5" />
              )}
              <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-sm">
                Airplane Mode Sync
              </Text>
            </View>
            <Text className="text-[10px] font-black uppercase text-slate-400">
              {isOnline ? "Connected" : "Off-grid"}
            </Text>
          </View>

          {/* Offline switch toggle */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-bold text-slate-850 dark:text-slate-255 leading-tight">
                Simulate Airplane Mode
              </Text>
              <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
                Disconnect app internally to test offline caching and queues.
              </Text>
            </View>
            <Switch
              value={isSimulatedOffline}
              onValueChange={handleOfflineSimulationToggle}
              trackColor={{ false: "#CBD5E1", true: "#6366F1" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Sync actions row */}
          <View className="flex-row justify-between items-center mt-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
            <View className="flex-row items-center flex-1 mr-3">
              <CloudLightning size={14} color="#6366F1" className="mr-2" />
              <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-455">
                Pending Actions Queue: {queueLength}
              </Text>
            </View>
            {queueLength > 0 && (
              <View className="flex-row gap-1.5">
                <TouchableOpacity
                  onPress={syncOfflineQueue}
                  disabled={!isOnline}
                  className="bg-brand-500 px-3 py-2 rounded-xl flex-row items-center"
                >
                  <RefreshCw size={10} color="#FFFFFF" className="mr-1" />
                  <Text className="text-[9px] font-black uppercase text-white">Sync</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={clearQueue}
                  className="bg-rose-500 px-3 py-2 rounded-xl"
                >
                  <Text className="text-[9px] font-black uppercase text-white">Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Visual Customizations Card */}
      <View className="px-6 mb-6">
        <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-soft dark:shadow-soft-dark">
          <View className="flex-row items-center mb-4 pb-3 border-b border-slate-50 dark:border-slate-800">
            <Layers size={18} color="#6366F1" className="mr-2.5" />
            <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-sm">
              Appearance Theme Settings
            </Text>
          </View>

          <View className="flex-row">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTheme("light");
              }}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl mr-2 border ${
                theme === "light"
                  ? "bg-brand-500/10 dark:bg-brand-950/20 border-brand-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <Sun size={14} color={theme === "light" ? "#6366F1" : "#64748B"} className="mr-1.5" />
              <Text className={`text-xs font-extrabold ${theme === "light" ? "text-brand-500" : "text-slate-500"}`}>
                Light Mode
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTheme("dark");
              }}
              className={`flex-1 flex-row items-center justify-center py-3.5 rounded-2xl ml-2 border ${
                theme === "dark"
                  ? "bg-brand-500/10 dark:bg-brand-950/20 border-brand-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <Moon size={14} color={theme === "dark" ? "#6366F1" : "#64748B"} className="mr-1.5" />
              <Text className={`text-xs font-extrabold ${theme === "dark" ? "text-brand-500" : "text-slate-400"}`}>
                Dark Mode
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. CARD-BASED LOGOUT BUTTON */}
      <View className="px-6">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 py-4.5 rounded-3xl flex-row items-center justify-center shadow-soft"
          activeOpacity={0.8}
        >
          <LogOut size={16} color="#EF4444" className="mr-2" />
          <Text className="text-rose-600 dark:text-rose-400 font-extrabold text-sm uppercase tracking-wider">
            Sign Out Session
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}
