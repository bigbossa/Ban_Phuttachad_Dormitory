/**
 * Utility functions to validate and ensure system settings consistency
 */

import { supabase } from "@/integrations/supabase/client";

export interface SystemSettingsValidation {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Validate system settings data consistency
 */
export const validateSystemSettings =
  async (): Promise<SystemSettingsValidation> => {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if system_settings table has data
      const { data: settingsData, error: settingsError } = await supabase
        .from("system_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (settingsError) {
        issues.push(`Database error: ${settingsError.message}`);
        return { isValid: false, issues, recommendations };
      }

      if (!settingsData || settingsData.length === 0) {
        issues.push("No system settings found in database");
        recommendations.push("Create initial system settings record");
        return { isValid: false, issues, recommendations };
      }

      const settings = settingsData[0];

      // Validate deposit rate
      if (!settings.deposit_rate || settings.deposit_rate <= 0) {
        issues.push("Invalid deposit rate (monthly rent)");
        recommendations.push("Set a valid deposit rate greater than 0");
      }

      // Validate water rate
      if (!settings.water_rate || settings.water_rate <= 0) {
        issues.push("Invalid water rate");
        recommendations.push("Set a valid water rate greater than 0");
      }

      // Validate electricity rate
      if (!settings.electricity_rate || settings.electricity_rate <= 0) {
        issues.push("Invalid electricity rate");
        recommendations.push("Set a valid electricity rate greater than 0");
      }

      // Check for multiple settings records
      const { count: settingsCount } = await supabase
        .from("system_settings")
        .select("*", { count: "exact", head: true });

      if (settingsCount && settingsCount > 1) {
        issues.push(
          `Multiple system settings records found (${settingsCount})`
        );
        recommendations.push("Keep only the latest system settings record");
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      issues.push(`Validation error: ${error}`);
      return { isValid: false, issues, recommendations };
    }
  };

/**
 * Get current system settings with validation
 */
export const getValidatedSystemSettings = async () => {
  const validation = await validateSystemSettings();

  if (!validation.isValid) {
    console.warn("System settings validation issues:", validation.issues);
    console.warn("Recommendations:", validation.recommendations);
  }

  const { data: settingsData, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching system settings:", error);
    return null;
  }

  return {
    settings: settingsData,
    validation,
  };
};

/**
 * Log system settings for debugging
 */
export const logSystemSettings = async () => {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching system settings for logging:", error);
      return;
    }

    console.log("📊 Current System Settings:");
    data?.forEach((setting, index) => {
      console.log(`  ${index + 1}. ID: ${setting.id}`);
      console.log(`     Deposit Rate (Monthly Rent): ${setting.deposit_rate}`);
      console.log(`     Water Rate: ${setting.water_rate}`);
      console.log(`     Electricity Rate: ${setting.electricity_rate}`);
      console.log(`     Created: ${setting.created_at}`);
      console.log(`     Updated: ${setting.updated_at}`);
    });
  } catch (error) {
    console.error("❌ Error logging system settings:", error);
  }
};

