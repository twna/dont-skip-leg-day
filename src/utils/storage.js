/**
 * Safe localStorage utilities to prevent errors when localStorage is not available
 */

// Memory fallback when localStorage is not available
const memoryStorage = new Map();

// Check if localStorage is available in a safe way
const isLocalStorageAvailable = () => {
  // First check if we are in a browser environment at all
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }
  
  try {
    // Try the actual operation that might fail
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    const testResult = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    // Test for corrupted localStorage (has been seen in some browsers)
    return testResult === testKey;
  } catch (e) {
    return false;
  }
};

// Safe wrapper for localStorage.getItem
export const getFromStorage = (key, defaultValue = null) => {
  // Return early if key is invalid
  if (!key || typeof key !== 'string') {
    return defaultValue;
  }
  
  if (!isLocalStorageAvailable()) {
    // Use memory fallback
    return memoryStorage.has(key) ? memoryStorage.get(key) : defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    try {
      return JSON.parse(item);
    } catch (parseError) {
      // If parsing fails, return the raw item
      return item;
    }
  } catch (error) {
    console.warn(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Safe wrapper for localStorage.setItem
export const saveToStorage = (key, value) => {
  // Return early if key is invalid
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  if (!isLocalStorageAvailable()) {
    // Use memory fallback
    memoryStorage.set(key, value);
    return true;
  }
  
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.warn(`Error saving ${key} to localStorage:`, error);
    
    // Try to use the memory fallback
    try {
      memoryStorage.set(key, value);
      return true;
    } catch (memoryError) {
      console.error('Memory storage fallback also failed:', memoryError);
      return false;
    }
  }
};

// Safe wrapper for localStorage.removeItem
export const removeFromStorage = (key) => {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

export default {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  isAvailable: isLocalStorageAvailable
};
