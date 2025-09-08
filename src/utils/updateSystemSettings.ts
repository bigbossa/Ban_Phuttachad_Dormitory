import { supabase } from "@/integrations/supabase/client";

/**
 * ฟังก์ชันสำหรับอัปเดตค่า system_settings ใหม่
 */
export const updateSystemSettings = async (newSettings: {
  waterRate: number;
  electricityRate: number;
  depositRate: number;
  lateFee?: number;
  floor?: number;
}) => {
  try {
    console.log("🔄 กำลังอัปเดต system_settings...");
    console.log("ค่าที่จะอัปเดต:", newSettings);

    // ตรวจสอบว่ามีข้อมูล system_settings อยู่แล้วหรือไม่
    const { data: existingSettings, error: checkError } = await supabase
      .from("system_settings")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (checkError) {
      console.error("❌ Error checking existing settings:", checkError);
      return { success: false, error: checkError.message };
    }

    const settingsData = {
      water_rate: newSettings.waterRate,
      electricity_rate: newSettings.electricityRate,
      deposit_rate: newSettings.depositRate,
      late_fee: newSettings.lateFee || 5,
      floor: newSettings.floor || 4,
    };

    let result;
    if (existingSettings && existingSettings.length > 0) {
      // อัปเดตข้อมูลที่มีอยู่
      const { data, error } = await supabase
        .from("system_settings")
        .update(settingsData)
        .eq("id", existingSettings[0].id)
        .select()
        .single();

      result = { data, error };
    } else {
      // สร้างข้อมูลใหม่
      const { data, error } = await supabase
        .from("system_settings")
        .insert(settingsData)
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error("❌ Error updating system settings:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log("✅ อัปเดต system_settings สำเร็จ");
    console.log("ข้อมูลที่อัปเดต:", result.data);

    return {
      success: true,
      message: "อัปเดต system_settings สำเร็จ",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ Unexpected error in updateSystemSettings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    };
  }
};

/**
 * ฟังก์ชันสำหรับอัปเดตค่าห้องทั้งหมดให้ตรงกับ deposit_rate ใหม่
 */
export const updateAllRoomPrices = async (newPrice: number) => {
  try {
    console.log(`🔄 กำลังอัปเดตราคาห้องทั้งหมดเป็น ${newPrice} บาท...`);

    const { data, error } = await supabase
      .from("rooms")
      .update({ price: newPrice })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // อัปเดตทุกห้อง

    if (error) {
      console.error("❌ Error updating room prices:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ อัปเดตราคาห้องทั้งหมดสำเร็จ");

    return {
      success: true,
      message: `อัปเดตราคาห้องทั้งหมดเป็น ${newPrice} บาท สำเร็จ`,
    };
  } catch (error) {
    console.error("❌ Unexpected error in updateAllRoomPrices:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    };
  }
};

/**
 * ฟังก์ชันสำหรับอัปเดตทั้ง system_settings และราคาห้องพร้อมกัน
 */
export const updateSystemAndRoomPrices = async (newSettings: {
  waterRate: number;
  electricityRate: number;
  depositRate: number;
  lateFee?: number;
  floor?: number;
}) => {
  try {
    console.log("🚀 เริ่มอัปเดตทั้ง system_settings และราคาห้อง...");

    // 1. อัปเดต system_settings
    const settingsResult = await updateSystemSettings(newSettings);
    if (!settingsResult.success) {
      return settingsResult;
    }

    // 2. อัปเดตราคาห้องทั้งหมด
    const roomResult = await updateAllRoomPrices(newSettings.depositRate);
    if (!roomResult.success) {
      return roomResult;
    }

    console.log("✅ อัปเดตทั้ง system_settings และราคาห้องสำเร็จ");

    return {
      success: true,
      message: `อัปเดตระบบสำเร็จ:
        - ค่าน้ำ: ${newSettings.waterRate} บาท/คน
        - ค่าไฟ: ${newSettings.electricityRate} บาท/หน่วย
        - ค่าห้อง: ${newSettings.depositRate} บาท`,
      settingsData: settingsResult.data,
    };
  } catch (error) {
    console.error("❌ Unexpected error in updateSystemAndRoomPrices:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    };
  }
};
