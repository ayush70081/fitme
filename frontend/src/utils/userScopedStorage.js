// Small helper to namespace localStorage keys per logged-in user

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('fitme_user');
    if (!raw) return 'guest';
    const user = JSON.parse(raw);
    return user?.id || user?._id || 'guest';
  } catch {
    return 'guest';
  }
};

export const getKey = (baseKey) => {
  const userId = getCurrentUserId();
  return `fitme:${userId}:${baseKey}`;
};

// Move legacy (global) key to user-scoped storage if not already present
const migrateLegacyIfNeeded = (baseKey) => {
  try {
    const userKey = getKey(baseKey);
    const hasUserScoped = localStorage.getItem(userKey) !== null;
    const legacy = localStorage.getItem(baseKey);
    if (!hasUserScoped && legacy !== null) {
      localStorage.setItem(userKey, legacy);
      localStorage.removeItem(baseKey);
    }
  } catch {
    // no-op
  }
};

export const getItem = (baseKey) => {
  migrateLegacyIfNeeded(baseKey);
  return localStorage.getItem(getKey(baseKey));
};

export const setItem = (baseKey, value) => {
  localStorage.setItem(getKey(baseKey), value);
};

export const removeItem = (baseKey) => {
  localStorage.removeItem(getKey(baseKey));
};

export default {
  getKey,
  getItem,
  setItem,
  removeItem,
};


