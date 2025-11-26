// Storage utility functions
export const storage = {
  async get(key) {
    const result = await chrome.storage.local.get([key]);
    return result[key] ?? null;
  },

  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },

  async remove(key) {
    await chrome.storage.local.remove([key]);
  },

  async clear() {
    await chrome.storage.local.clear();
  }
};

