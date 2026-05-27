import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "@/api/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Mail, Lock, User, BookOpen } from "lucide-react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error: apiError } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleRegister = async () => {
    setErrors({});
    const formData = { name, email, password };
    
    // Validate inputs using Zod
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof typeof errors;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await register(formData);
      router.replace("/(tabs)");
    } catch (e) {
      // Handled in hook
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
          
          {/* Logo & Header */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(100)} 
            className="items-center mb-8"
          >
            <View className="w-16 h-16 bg-brand-500 rounded-2xl items-center justify-center shadow-soft mb-4">
              <BookOpen size={32} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-center">
              Create an account
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm px-4">
              Sign up to gain full-fidelity access to top micro learning tracks.
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(200)} 
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-soft dark:shadow-soft-dark border border-slate-100 dark:border-slate-800"
          >
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Alex Nagle"
              autoCapitalize="words"
              leftIcon={<User size={18} color="#94A3B8" />}
              error={errors.name}
            />

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#94A3B8" />}
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              isPassword
              leftIcon={<Lock size={18} color="#94A3B8" />}
              error={errors.password}
            />

            {apiError && (
              <Animated.View entering={FadeInUp.duration(300)} className="mb-4 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
                <Text className="text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {apiError}
                </Text>
              </Animated.View>
            )}

            <Button
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              className="mt-2"
            />

            {/* Link to Login */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text className="text-brand-500 font-bold text-xs">
                  Sign in instead
                </Text>
              </Pressable>
            </View>

          </Animated.View>

          <Text className="text-slate-400 text-center text-xs mt-8">
            Credentials encrypted with hardware secure zones.
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
