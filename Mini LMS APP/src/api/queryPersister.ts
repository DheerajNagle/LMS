import { appStorage } from "@/store/mmkv-storage";

export const clientPersister = {
  // 1. Serialize and save query client state to MMKV
  persistClient: async (client: any) => {
    try {
      appStorage.set("react-query-cache", JSON.stringify(client));
    } catch (e) {
      console.error("[QueryPersister] Failed to save query cache:", e);
    }
  },

  // 2. Hydrate cache state from MMKV on startup
  restoreClient: async () => {
    try {
      const cache = appStorage.getString("react-query-cache");
      return cache ? JSON.parse(cache) : undefined;
    } catch (e) {
      console.error("[QueryPersister] Failed to restore query cache:", e);
      return undefined;
    }
  },

  // 3. Clear cache slot
  removeClient: async () => {
    try {
      appStorage.delete("react-query-cache");
    } catch (e) {
      console.error("[QueryPersister] Failed to remove query cache:", e);
    }
  },
};
export type ClientPersister = typeof clientPersister;
