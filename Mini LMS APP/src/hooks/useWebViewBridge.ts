import { useRef, useCallback } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useCourseStore } from "@/store/useCourseStore";

interface BridgeMessage {
  type: "QUIZ_COMPLETED" | "PROGRESS_UPDATE" | "LESSON_COMPLETED";
  payload: any;
}

export function useWebViewBridge(courseId: string) {
  const webViewRef = useRef<any>(null);
  const enrollInCourse = useCourseStore((state) => state.enrollInCourse);

  // Send a stringified command into the WebView environment
  const postMessageToWeb = useCallback((type: string, payload: any) => {
    if (webViewRef.current) {
      const script = `
        if (window.onNativeMessage) {
          window.onNativeMessage(${JSON.stringify({ type, payload })});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, []);

  // Handle incoming postMessage triggers from inside the WebView
  const handleOnMessage = useCallback((event: any) => {
    try {
      const data: BridgeMessage = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case "QUIZ_COMPLETED": {
          const { score, passed } = data.payload;
          Haptics.notificationAsync(
            passed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
          );
          Alert.alert(
            passed ? "Quiz Passed!" : "Quiz Failed",
            `You scored ${score}% in the interactive module quiz.`
          );
          break;
        }
        case "LESSON_COMPLETED": {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          enrollInCourse(courseId); // Auto mark as enrolled on lesson completion
          Alert.alert("Congratulations", "You have finished this lesson successfully!");
          break;
        }
        case "PROGRESS_UPDATE": {
          break;
        }
        default:
          console.warn("[WebViewBridge] Unknown event action type:", data.type);
      }
    } catch (e) {
      console.error("[WebViewBridge] Failed to parse message:", e);
    }
  }, [courseId, enrollInCourse]);

  return {
    webViewRef,
    handleOnMessage,
    postMessageToWeb,
  };
}
