
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export function SystemConfigSection() {
  const { settings, saveSettings, loading: settingsLoading } = useSystemSettings();
  
  const [formSettings, setFormSettings] = useState({
    waterRate: settings.waterRate,
    electricityRate: settings.electricityRate,
    lateFee: settings.lateFee,
    floor:settings.floor,
    depositRate: settings.depositRate
  });

  // Update form settings when settings change
  useEffect(() => {
    setFormSettings({
      waterRate: settings.waterRate,
      electricityRate: settings.electricityRate,
      lateFee: settings.lateFee,
      floor:settings.floor,
      depositRate: settings.depositRate
    });
  }, [settings]);

  const handleSaveSettings = async () => {
    console.log('Saving settings:', formSettings);
    await saveSettings(formSettings);
  };

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    console.log(`Updating ${field} to:`, numValue);
    setFormSettings(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">การตั้งค่าระบบ</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="water-rate">อัตราค่าน้ำ (คน/บาท)</Label>
          <Input 
            id="water-rate" 
            type="number" 
            value={formSettings.waterRate}
            onChange={(e) => handleInputChange('waterRate', e.target.value)}
            className="mt-1" 
          />
        </div>
        <div>
          <Label htmlFor="electricity-rate">อัตราค่าไฟ (บาท/หน่วย)</Label>
          <Input 
            id="electricity-rate" 
            type="number" 
            value={formSettings.electricityRate}
            onChange={(e) => handleInputChange('electricityRate', e.target.value)}
            className="mt-1" 
          />
        </div>
        <div>
          <Label htmlFor="late-fee">ค่าปรับชำระล่าช้า (%)</Label>
          <Input 
            id="late-fee" 
            type="number" 
            value={formSettings.lateFee}
            onChange={(e) => handleInputChange('lateFee', e.target.value)}
            className="mt-1" 
          />
        </div>
        <div>
          <Label htmlFor="deposit-rate">ค่าเช่ารายเดือน</Label>
          <Input 
            id="deposit-rate" 
            type="number" 
            value={formSettings.depositRate}
            onChange={(e) => handleInputChange('depositRate', e.target.value)}
            className="mt-1" 
          />
        </div>
        <div>
          <Label htmlFor="floor">ชั้นตึก</Label>
          <Input 
            id="floor" 
            type="number" 
            value={formSettings.floor}
            onChange={(e) => handleInputChange('floor', e.target.value)}
            className="mt-1" 
          />
        </div>
      </div>
      <Button 
        onClick={handleSaveSettings}
        disabled={settingsLoading}
        className="w-full md:w-auto"
      >
        {settingsLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </Button>
    </div>
  );
}
