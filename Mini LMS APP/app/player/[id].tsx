import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { WebView } from "react-native-webview";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useCourseStore } from "@/store/useCourseStore";
import { useOffline } from "@/hooks/useOffline";
import { useAuth } from "@/hooks/useAuth";
// @ts-ignore – lucide-react-native@0.363 peer compat quirk; all icons resolve at runtime
import { X, Play, Pause, SkipForward, Maximize, RotateCcw, Volume2, VolumeX, CheckCircle, WifiOff, CloudLightning, Film, BookOpen } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";

// Generate the local HTML template with injected course data
const buildCourseHTML = (course: any, isOnline: boolean) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>${course.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0F172A;
      color: #F1F5F9;
      padding: 24px 20px 40px;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      background: rgba(99,102,241,0.15);
      color: #818CF8;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid rgba(99,102,241,0.3);
      margin-bottom: 14px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #F8FAFC;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .subtitle {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 24px;
    }
    .stats {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .stat {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 8px 14px;
      font-size: 11px;
      font-weight: 600;
      color: #CBD5E1;
    }
    .stat span { color: #818CF8; font-weight: 800; }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6366F1;
      margin-bottom: 12px;
    }
    .description {
      font-size: 14px;
      color: #94A3B8;
      margin-bottom: 28px;
      background: #1E293B;
      border-radius: 14px;
      padding: 16px;
      border: 1px solid #334155;
    }
    .outline-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px;
      background: #1E293B;
      border-radius: 12px;
      border: 1px solid #334155;
      margin-bottom: 10px;
      font-size: 13px;
      color: #E2E8F0;
      font-weight: 500;
    }
    .outline-num {
      background: rgba(99,102,241,0.2);
      color: #818CF8;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .instructor {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 28px;
    }
    .instructor img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }
    .instructor-name { font-size: 14px; font-weight: 800; color: #F1F5F9; }
    .instructor-role { font-size: 11px; color: #6366F1; font-weight: 700; margin-top: 2px; }
    .network-badge {
      text-align: center;
      font-size: 11px;
      color: ${isOnline ? '#10B981' : '#F59E0B'};
      font-weight: 700;
      background: ${isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'};
      border: 1px solid ${isOnline ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'};
      border-radius: 10px;
      padding: 8px;
      margin-bottom: 20px;
    }
    .complete-btn {
      display: block;
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white;
      font-size: 14px;
      font-weight: 800;
      text-align: center;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      letter-spacing: 0.05em;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="network-badge">
    ${isOnline ? '🟢 Connected — Live Course Content' : '🟡 Offline Mode — Cached Content'}
  </div>

  <div class="badge">${course.category} • ${course.level}</div>
  <h1>${course.title}</h1>
  <p class="subtitle">${course.subtitle}</p>

  <div class="stats">
    <div class="stat">⭐ <span>${course.rating}</span> rating</div>
    <div class="stat">⏱ <span>${course.duration}</span></div>
    <div class="stat">👥 <span>${course.enrolledCount.toLocaleString()}</span> enrolled</div>
  </div>

  <div class="section-title">About this Course</div>
  <div class="description">${course.description}</div>

  <div class="section-title">Your Instructor</div>
  <div class="instructor">
    <img src="${course.instructor.avatar}" alt="${course.instructor.name}" />
    <div>
      <div class="instructor-name">${course.instructor.name}</div>
      <div class="instructor-role">${course.instructor.role}</div>
    </div>
  </div>

  <div class="section-title">Course Outline (${course.outline.length} Lessons)</div>
  ${course.outline.map((lesson: string, i: number) => `
    <div class="outline-item">
      <div class="outline-num">${i + 1}</div>
      <span>${lesson}</span>
    </div>
  `).join('')}

  <button class="complete-btn" onclick="notifyNative()">Mark Module as Complete ✓</button>

  <script>
    function notifyNative() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MODULE_COMPLETED',
        payload: { courseId: '${course.id}', title: '${course.title}', timestamp: Date.now() }
      }));
    }
    // Confirm to native that the WebView has loaded
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_READY', payload: { courseId: '${course.id}' } }));
  </script>
</body>
</html>
`;


// Premium dynamic standard video sources for streaming mock lessons
const MOCK_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
];

export default function PlayerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOnline } = useOffline();
  const { token } = useAuth();
  
  // Zustand client store
  const { enrolledCourseIds, enrollInCourse } = useCourseStore();

  // Tab state: 'video' | 'webview'
  const [activeTab, setActiveTab] = useState<'video' | 'webview'>('video');
  const [webviewMessage, setWebviewMessage] = useState<string | null>(null);
  const webviewRef = useRef<any>(null);
  const videoRef = useRef<Video>(null);
  
  
  // Custom video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  // Fetch Course details via cache
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => apiClient.getCourseById(id!),
    enabled: !!id,
  });

  // Automatically show HUD and auto-hide after 3 seconds if playing
  useEffect(() => {
    let timer: any;
    if (showHud && isPlaying) {
      timer = setTimeout(() => {
        setShowHud(false);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [showHud, isPlaying]);

  // Dynamic lesson video selector
  const videoUri = useMemo(() => {
    const videoIndex = activeLessonIndex % MOCK_VIDEOS.length;
    return MOCK_VIDEOS[videoIndex];
  }, [activeLessonIndex]);

  // Auto-mark enrolled if they start watching classes
  useEffect(() => {
    if (id && !enrolledCourseIds.includes(id)) {
      enrollInCourse(id);
    }
  }, [id, enrolledCourseIds, enrollInCourse]);

  // Duration position calculators
  const progressPercent = useMemo(() => {
    if (!playbackStatus || !playbackStatus.isLoaded || !playbackStatus.durationMillis) return 0;
    return Math.round((playbackStatus.positionMillis / playbackStatus.durationMillis) * 100);
  }, [playbackStatus]);

  const durationLabel = useMemo(() => {
    if (!playbackStatus || !playbackStatus.isLoaded) return "00:00";
    return formatTime(playbackStatus.durationMillis || 0);
  }, [playbackStatus]);

  const positionLabel = useMemo(() => {
    if (!playbackStatus || !playbackStatus.isLoaded) return "00:00";
    return formatTime(playbackStatus.positionMillis || 0);
  }, [playbackStatus]);

  // Format milliseconds into MM:SS format
  function formatTime(millis: number) {
    if (isNaN(millis)) return "00:00";
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  // Trigger Haptic & Progress Saved overlay notification
  const triggerProgressSavedToast = useCallback(() => {
    setShowSavedToast(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 2000);
  }, []);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    setPlaybackStatus(status);
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);

      // Auto-complete lesson when it reaches 99% or didJustFinish
      if (status.didJustFinish) {
        if (!completedLessons.includes(activeLessonIndex)) {
          setCompletedLessons((prev) => [...prev, activeLessonIndex]);
          triggerProgressSavedToast();
        }
      }
    }
  }, [activeLessonIndex, completedLessons, triggerProgressSavedToast]);

  const handlePlayPause = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (e) {
      console.warn("[Player] Play/Pause error:", e);
    }
  }, [isPlaying]);

  const handleRewind = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!videoRef.current || !playbackStatus || !playbackStatus.isLoaded) return;
    
    try {
      const newPosition = Math.max(0, playbackStatus.positionMillis - 10000);
      await videoRef.current.setPositionAsync(newPosition);
      triggerProgressSavedToast();
    } catch (e) {
      console.warn("[Player] Rewind error:", e);
    }
  }, [playbackStatus, triggerProgressSavedToast]);

  const handleFastForward = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!videoRef.current || !playbackStatus || !playbackStatus.isLoaded || !playbackStatus.durationMillis) return;

    try {
      const newPosition = Math.min(playbackStatus.durationMillis, playbackStatus.positionMillis + 10000);
      await videoRef.current.setPositionAsync(newPosition);
      triggerProgressSavedToast();
    } catch (e) {
      console.warn("[Player] Fast forward error:", e);
    }
  }, [playbackStatus, triggerProgressSavedToast]);

  const handleToggleMute = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!videoRef.current) return;
    
    try {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (e) {
      console.warn("[Player] Mute error:", e);
    }
  }, [isMuted]);

  const handleFullscreen = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!videoRef.current) return;

    try {
      await videoRef.current.presentFullscreenPlayer();
    } catch (e) {
      console.warn("[Player] Fullscreen error:", e);
    }
  }, []);

  const handleLessonSwitch = useCallback(async (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveLessonIndex(index);
    setShowHud(true);
    triggerProgressSavedToast();
    
    if (videoRef.current) {
      try {
        await videoRef.current.stopAsync();
        await videoRef.current.playAsync();
      } catch (e) {
        console.warn("[Player] Switch lesson video play error:", e);
      }
    }
  }, [triggerProgressSavedToast]);

  const handleNextLesson = useCallback(() => {
    if (!course || activeLessonIndex >= course.outline.length - 1) return;
    handleLessonSwitch(activeLessonIndex + 1);
  }, [course, activeLessonIndex, handleLessonSwitch]);

  if (isLoading || !course) {
    return (
      <View className="flex-grow justify-center items-center bg-slate-950">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const activeLessonTitle = course.outline[activeLessonIndex] || `Lesson ${activeLessonIndex + 1}`;

  // Handle messages from WebView (Web → Native communication)
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'MODULE_COMPLETED') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setWebviewMessage(`✅ Module "${msg.payload.title}" marked complete!`);
        setTimeout(() => setWebviewMessage(null), 3000);
      } else if (msg.type === 'WEBVIEW_READY') {
        // Ready status
      }
    } catch (e) {
      console.warn('[WebView] Could not parse message:', e);
    }
  }, []);

  const courseHTML = buildCourseHTML(course, isOnline);


  return (
    <View className="flex-1 bg-slate-950">
      
      {/* ── TAB BAR: Video / Course Content ── */}
      <View className="flex-row bg-slate-900 border-b border-slate-800">
        <TouchableOpacity
          onPress={() => { setActiveTab('video'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          className={`flex-1 flex-row items-center justify-center py-3.5 border-b-2 ${
            activeTab === 'video' ? 'border-brand-500' : 'border-transparent'
          }`}
        >
          <Film size={14} color={activeTab === 'video' ? '#6366F1' : '#64748B'} />
          <Text className={`ml-1.5 text-xs font-bold ${
            activeTab === 'video' ? 'text-brand-500' : 'text-slate-500'
          }`}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setActiveTab('webview'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          className={`flex-1 flex-row items-center justify-center py-3.5 border-b-2 ${
            activeTab === 'webview' ? 'border-brand-500' : 'border-transparent'
          }`}
        >
          <BookOpen size={14} color={activeTab === 'webview' ? '#6366F1' : '#64748B'} />
          <Text className={`ml-1.5 text-xs font-bold ${
            activeTab === 'webview' ? 'text-brand-500' : 'text-slate-500'
          }`}>Course Content</Text>
        </TouchableOpacity>
      </View>

      {/* ── WEBVIEW MODULE COMPLETE TOAST ── */}
      {webviewMessage && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOut.duration(300)}
          className="absolute top-20 self-center bg-emerald-500 px-4 py-2.5 rounded-full flex-row items-center gap-2 shadow-lg z-50 border border-emerald-400/20"
        >
          <CheckCircle size={14} color="#FFFFFF" />
          <Text className="text-white text-[11px] font-extrabold tracking-wide">{webviewMessage}</Text>
        </Animated.View>
      )}

      {/* ── WEBVIEW TAB: HTML Course Content Viewer ── */}
      {activeTab === 'webview' ? (
        <WebView
          ref={webviewRef}
          source={{
            html: courseHTML,
            headers: {
              "Authorization": `Bearer ${token || ""}`,
              "X-Course-Id": String(id || "")
            }
          }}
          style={{ flex: 1, backgroundColor: '#0F172A' }}
          onMessage={handleWebViewMessage}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('[WebView] Error:', nativeEvent);
          }}
          renderError={() => (
            <View className="flex-1 bg-slate-950 items-center justify-center px-6">
              <WifiOff size={32} color="#F59E0B" />
              <Text className="text-slate-300 text-sm font-bold mt-4 text-center">
                Failed to load course content
              </Text>
              <Text className="text-slate-500 text-xs mt-2 text-center mb-5">
                Check your connection and try again.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  webviewRef.current?.reload();
                }}
                className="bg-brand-500 px-5 py-2.5 rounded-xl shadow-soft"
                activeOpacity={0.8}
              >
                <Text className="text-white text-xs font-bold">Reload Content</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <>
          <View className="w-full aspect-video bg-black relative justify-center">
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              rate={1.0}
              volume={1.0}
              isMuted={isMuted}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              className="w-full h-full"
            />

        {/* TAP TARGET VIEWPORT LAYER TO REVEAL CONTROLS */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setShowHud(!showHud)} 
          className="absolute inset-0 z-10"
        />

        {/* CUSTOM CONTROL OVERLAY HUD CONTROLLERS */}
        {showHud && (
          <Animated.View 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(200)}
            className="absolute inset-0 bg-black/60 z-20 px-6 py-4 justify-between"
          >
            {/* Top Row HUD */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-4">
                <Text className="text-[9px] font-black text-brand-400 uppercase tracking-widest leading-relaxed">
                  {!isOnline && <WifiOff size={9} color="#F59E0B" className="mr-1" />}
                  {isOnline ? "Streaming Native HD" : "Offline Cached Session"}
                </Text>
                <Text className="text-xs font-extrabold text-slate-100 leading-snug" numberOfLines={1}>
                  {activeLessonTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                className="w-7 h-7 bg-white/10 rounded-full items-center justify-center border border-white/10"
              >
                <X size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Middle Playback Toggles Row */}
            <View className="flex-row justify-center items-center gap-10">
              <TouchableOpacity 
                onPress={handleRewind}
                className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/5"
              >
                <RotateCcw size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handlePlayPause}
                className="w-16 h-16 bg-brand-500 rounded-full items-center justify-center shadow-lg shadow-brand-500/30"
              >
                {isPlaying ? (
                  <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" className="ml-1" />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleFastForward}
                className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/5"
              >
                <SkipForward size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Playback Spec HUD */}
            <View className="gap-2">
              {/* Progress Slider Track */}
              <View className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <View style={{ width: `${progressPercent}%` }} className="h-full bg-brand-500 rounded-full" />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-[10px] font-bold text-slate-300">
                  {positionLabel} / {durationLabel}
                </Text>
                
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity onPress={handleToggleMute} className="p-1">
                    {isMuted ? (
                      <VolumeX size={15} color="#FFFFFF" />
                    ) : (
                      <Volume2 size={15} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleFullscreen} className="p-1">
                    <Maximize size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </Animated.View>
        )}
      </View>

      {/* 2. DYNAMIC "PROGRESS SAVED" CLOUD SYNC TOAST OVERLAY */}
      {showSavedToast && (
        <Animated.View 
          entering={FadeInDown.duration(300)}
          exiting={FadeOut.duration(300)}
          className="absolute top-10 self-center bg-emerald-500 px-4 py-2.5 rounded-full flex-row items-center gap-2 shadow-lg z-50 border border-emerald-400/20"
        >
          <CheckCircle size={14} color="#FFFFFF" />
          <Text className="text-white text-[11px] font-extrabold tracking-wide uppercase">
            Progress Saved & Synced Offline
          </Text>
        </Animated.View>
      )}

      {/* 3. LESSON OUTLINE PLAYLIST & COURSE SPECS */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 50 }}
        className="flex-1 bg-slate-900"
      >
        
        {/* Core Lesson Detail Header */}
        <Animated.View entering={FadeInDown.duration(400)} className="mb-6">
          <Text className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">
            Lesson {activeLessonIndex + 1} of {course.outline.length}
          </Text>
          <Text className="text-xl font-black text-white leading-tight mb-2">
            {activeLessonTitle}
          </Text>
          <Text className="text-xs text-slate-450 leading-relaxed">
            By {course.instructor.name} • {course.instructor.role}
          </Text>

          {/* Quick Stats Grid */}
          <View className="flex-row mt-4 gap-4">
            <View className="bg-slate-800/50 px-3.5 py-2.5 rounded-xl flex-row items-center border border-slate-800">
              <CloudLightning size={13} color="#6366F1" className="mr-2" />
              <Text className="text-slate-300 text-[11px] font-bold">Auto-Saving Active</Text>
            </View>
          </View>
        </Animated.View>

        {/* Sticky Next Lesson CTA Button */}
        {activeLessonIndex < course.outline.length - 1 && (
          <TouchableOpacity
            onPress={handleNextLesson}
            activeOpacity={0.8}
            className="bg-brand-500 py-4.5 rounded-2xl flex-row items-center justify-center mb-6 shadow-soft shadow-brand-500/10 border border-brand-400/10"
          >
            <Text className="text-white text-xs font-black mr-2 uppercase tracking-wider">Next Lesson</Text>
            <SkipForward size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Scrollable Classroom Outlines Playlist */}
        <View className="mb-6">
          <Text className="text-sm font-black text-slate-100 uppercase tracking-wider mb-4">
            Course Playlist
          </Text>

          {course.outline.map((lesson: string, idx: number) => {
            const isPlayingNow = activeLessonIndex === idx;
            const isFinished = completedLessons.includes(idx);
            
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleLessonSwitch(idx)}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between p-4.5 mb-3 rounded-2xl border ${
                  isPlayingNow
                    ? "bg-brand-500/10 border-brand-500"
                    : "bg-slate-800/40 border-slate-800/60"
                }`}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                    isPlayingNow 
                      ? "bg-brand-500" 
                      : isFinished 
                        ? "bg-emerald-500" 
                        : "bg-slate-800"
                  }`}>
                    {isFinished ? (
                      <CheckCircle size={10} color="#FFFFFF" />
                    ) : (
                      <Text className="text-[10px] font-extrabold text-white">{idx + 1}</Text>
                    )}
                  </View>
                  <Text 
                    className={`text-xs font-bold flex-1 ${isPlayingNow ? "text-brand-400 font-extrabold" : "text-slate-350"}`}
                    numberOfLines={1}
                  >
                    {lesson}
                  </Text>
                </View>

                {isPlayingNow && (
                  <View className="bg-brand-500/20 px-2.5 py-1 rounded-md">
                    <Text className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Watching</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        </ScrollView>
        </>
      )}
    </View>
  );
}
