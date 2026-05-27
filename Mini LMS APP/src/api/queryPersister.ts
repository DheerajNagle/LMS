import AsyncStorage from "@react-native-async-storage/async-storage";

export const clientPersister = {
  // 1. Serialize and save query client state to AsyncStorage
  persistClient: async (client: any) => {
    try {
      await AsyncStorage.setItem("react-query-cache", JSON.stringify(client));
    } catch (e) {
      console.error("[QueryPersister] Failed to save query cache:", e);
    }
  },

  // 2. Hydrate cache state from AsyncStorage on startup
  restoreClient: async () => {
    try {
      const cache = await AsyncStorage.getItem("react-query-cache");
      return cache ? JSON.parse(cache) : undefined;
    } catch (e) {
      console.error("[QueryPersister] Failed to restore query cache:", e);
      return undefined;
    }
  },

  // 3. Clear cache slot
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem("react-query-cache");
    } catch (e) {
      console.error("[QueryPersister] Failed to remove query cache:", e);
    }
  },
};
export type ClientPersister = typeof clientPersister;
