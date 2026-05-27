import { useNetworkStore } from "@/store/useNetworkStore";

export interface NormalizedError {
  message: string;
  code: "OFFLINE" | "TIMEOUT" | "UNAUTHORIZED" | "SERVER_ERROR" | "UNKNOWN";
  status?: number;
}

class AppError extends Error implements NormalizedError {
  code: NormalizedError["code"];
  status?: number;

  constructor(message: string, code: NormalizedError["code"], status?: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 2;
const BASE_RETRY_DELAY = 1000; // 1 second base

export const httpClient = {
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      timeout = DEFAULT_TIMEOUT,
      retryCount = DEFAULT_RETRIES,
      retryDelay = BASE_RETRY_DELAY,
      ...fetchOptions
    } = options;

    // 1. Request Interceptor: Offline connection check guard
    const isOnline = useNetworkStore.getState().isOnline();
    if (!isOnline) {
      throw new AppError(
        "Network connection is unavailable. Cached content is loaded.",
        "OFFLINE"
      );
    }

    // 2. Request Interceptor: Inject hardware SecureStore access token
    const { useAuthStore } = require("@/store/useAuthStore");
    const token = useAuthStore.getState().token;
    const headers = new Headers(fetchOptions.headers || {});
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    fetchOptions.headers = headers;

    // 3. Timeout interceptor using standard AbortController
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;

    try {
      console.log(`[HTTPClient] Requesting: ${url}`);
      const response = await fetch(url, fetchOptions);
      clearTimeout(id);

      // 4. Response Interceptor: Successful responses
      if (response.ok) {
        return (await response.json()) as T;
      }

      // 5. Response Interceptor: 401 Unauthorized handling (token refresh rotation)
      if (response.status === 401) {
        console.warn("[HTTPClient] Received 401. Retrying with refreshed session...");
        
        try {
          // Trigger the dynamic session rotation
          const { useAuthStore: updatedAuthStore } = require("@/store/useAuthStore");
          await updatedAuthStore.getState().refreshSession();
          
          // Re-inject the newly refreshed token and retry the exact request once
          const newToken = updatedAuthStore.getState().token;
          if (newToken) {
            const retryHeaders = new Headers(fetchOptions.headers);
            retryHeaders.set("Authorization", `Bearer ${newToken}`);
            fetchOptions.headers = retryHeaders;
            
            const retryResponse = await fetch(url, fetchOptions);
            if (retryResponse.ok) {
              return (await retryResponse.json()) as T;
            }
          }
        } catch (refreshErr) {
          console.error("[HTTPClient] Token rotation sequence failed:", refreshErr);
        }

        throw new AppError("Session expired. Please sign in again.", "UNAUTHORIZED", 401);
      }

      // 6. Response Interceptor: Other server failures
      throw new AppError(
        `Server returned an error status: ${response.status}`,
        "SERVER_ERROR",
        response.status
      );

    } catch (err: any) {
      clearTimeout(id);

      // Handle abort triggers
      if (err.name === "AbortError") {
        throw new AppError("Network request timed out. Please try again.", "TIMEOUT");
      }

      // 7. GET Requests Retry mechanism with exponential backoff
      const isGet = !fetchOptions.method || fetchOptions.method.toUpperCase() === "GET";
      if (isGet && retryCount > 0 && err.name !== "AppError") {
        console.warn(`[HTTPClient] Failed. Retrying in ${retryDelay}ms... (${retryCount} left)`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        
        return httpClient.request<T>(url, {
          ...options,
          retryCount: retryCount - 1,
          retryDelay: retryDelay * 2, // Exponential multiplication
        });
      }

      // Normalizing standard unknown network throws
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(err.message || "An unexpected networking issue occurred.", "UNKNOWN");
    }
  }
};
