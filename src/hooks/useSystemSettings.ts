
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemSettings {
  id?: string;
  waterRate: number;
  electricityRate: number;
  lateFee: number;
  floor:number;
  depositRate: number;
}

const defaultSettings: SystemSettings = {
  waterRate: 18,
  electricityRate: 8,
  lateFee: 5,
  floor: 4,
  depositRate: 2
};

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading settings:', error);
        // Fallback to localStorage if database fails
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        return;
      }

      if (data && data.length > 0) {
        const dbSettings = data[0];
        const formattedSettings: SystemSettings = {
          id: dbSettings.id,
          waterRate: Number(dbSettings.water_rate),
          electricityRate: Number(dbSettings.electricity_rate),
          lateFee: Number(dbSettings.late_fee),
          floor: Number(dbSettings.floor),
          depositRate: Number(dbSettings.deposit_rate)
        };
        setSettings(formattedSettings);
        // Also save to localStorage as backup
        localStorage.setItem('systemSettings', JSON.stringify(formattedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: SystemSettings) => {
    setLoading(true);
    try {
      // If we have an existing settings record, update it
      if (settings.id) {
        const { error } = await supabase
          .from('system_settings')
          .update({
            water_rate: newSettings.waterRate,
            electricity_rate: newSettings.electricityRate,
            late_fee: newSettings.lateFee,
            floor: newSettings.floor,
            deposit_rate: newSettings.depositRate
          })
          .eq('id', settings.id);

        if (error) {
          console.error('Error updating settings:', error);
          throw error;
        }
      } else {
        // Create new settings record
        const { error } = await supabase
          .from('system_settings')
          .insert({
            water_rate: newSettings.waterRate,
            electricity_rate: newSettings.electricityRate,
            late_fee: newSettings.lateFee,
            floor: newSettings.floor,
            deposit_rate: newSettings.depositRate
          });

        if (error) {
          console.error('Error creating settings:', error);
          throw error;
        }
      }

      setSettings(newSettings);
      // Also save to localStorage as backup
      localStorage.setItem('systemSettings', JSON.stringify(newSettings));
      toast.success("บันทึกการตั้งค่าสำเร็จ!");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("ไม่สามารถบันทึกการตั้งค่าได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    saveSettings,
    loading
  };
};
