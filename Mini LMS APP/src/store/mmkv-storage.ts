import { StateStorage } from "zustand/middleware";

// Fallback in-memory storage for Expo Go / Web compatibility (avoiding missing native C++ binary crashes)
class MemoryStorage {
  private store = new Map<string, string>();

  set(key: string, value: string) {
    this.store.set(key, value);
  }

  getString(key: string): string | undefined {
    return this.store.get(key);
  }

  delete(key: string) {
    this.store.delete(key);
  }
}

let appStorage: any;

try {
  // Use require dynamically to prevent static compile-time import resolution crashes in Expo Go
  const { MMKV } = require("react-native-mmkv");
  appStorage = new MMKV({
    id: "mini-lms-zustand-storage",
  });
  console.log("[Storage] Native C++ MMKV initialized successfully.");
} catch (e) {
  console.log("[Storage] MMKV native module not found (standard Expo Go). Falling back to In-Memory storage.");
  appStorage = new MemoryStorage();
}

export { appStorage };

// Implement the Zustand StateStorage interface to hook up storage
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    appStorage.set(name, value);
  },
  getItem: (name) => {
    const value = appStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    appStorage.delete(name);
  },
};
