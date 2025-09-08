/**
 * Utility function to clear system settings cache from localStorage
 * This ensures all users see the same data from the database
 */
export const clearSystemSettingsCache = () => {
  try {
    localStorage.removeItem("systemSettings");
    console.log("✅ System settings cache cleared from localStorage");
  } catch (error) {
    console.error("❌ Error clearing system settings cache:", error);
  }
};

/**
 * Clear all system-related cache from localStorage
 */
export const clearAllSystemCache = () => {
  try {
    const keysToRemove = [
      "systemSettings",
      "system-settings",
      "settings",
      "system_config",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log("✅ All system cache cleared from localStorage");
  } catch (error) {
    console.error("❌ Error clearing system cache:", error);
  }
};

