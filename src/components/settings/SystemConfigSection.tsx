import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useLanguage } from "@/providers/LanguageProvider";

export function SystemConfigSection() {
  const { settings, saveSettings, loading: settingsLoading } = useSystemSettings();
  const { t } = useLanguage();

  const [formSettings, setFormSettings] = useState({
    waterRate: settings.waterRate,
    electricityRate: settings.electricityRate,
    lateFee: settings.lateFee,
    floor: settings.floor,
    depositRate: settings.depositRate,
  });

  // Update form settings when settings change
  useEffect(() => {
    setFormSettings({
      waterRate: settings.waterRate,
      electricityRate: settings.electricityRate,
      lateFee: settings.lateFee,
      floor: settings.floor,
      depositRate: settings.depositRate,
    });
  }, [settings]);

  const handleSaveSettings = async () => {
    console.log('Saving settings:', formSettings);
    await saveSettings(formSettings);
  };

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    console.log(`Updating ${field} to:`, numValue);
    setFormSettings((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("system.configTitle")}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="water-rate">{t("system.waterRate")}</Label>
          <Input
            id="water-rate"
            type="number"
            value={formSettings.waterRate}
            onChange={(e) => handleInputChange("waterRate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="electricity-rate">{t("system.electricityRate")}</Label>
          <Input
            id="electricity-rate"
            type="number"
            value={formSettings.electricityRate}
            onChange={(e) => handleInputChange("electricityRate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="late-fee">{t("system.lateFee")}</Label>
          <Input
            id="late-fee"
            type="number"
            value={formSettings.lateFee}
            onChange={(e) => handleInputChange("lateFee", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="deposit-rate">{t("system.depositRate")}</Label>
          <Input
            id="deposit-rate"
            type="number"
            value={formSettings.depositRate}
            onChange={(e) => handleInputChange("depositRate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="floor">{t("system.floor")}</Label>
          <Input
            id="floor"
            type="number"
            value={formSettings.floor}
            onChange={(e) => handleInputChange("floor", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <Button
        onClick={handleSaveSettings}
        disabled={settingsLoading}
        className="w-full md:w-auto"
      >
        {settingsLoading ? t("system.saving") : t("system.save")}
      </Button>
    </div>
  );
}
