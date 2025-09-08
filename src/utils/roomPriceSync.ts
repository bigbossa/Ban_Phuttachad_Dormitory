import { supabase } from "@/integrations/supabase/client";

/**
 * ฟังก์ชันสำหรับตรวจสอบและซิงค์ราคาห้องกับ system_settings
 */
export const syncRoomPricesWithSystemSettings = async () => {
  try {
    console.log("🔄 เริ่มตรวจสอบและซิงค์ราคาห้อง...");

    // 1. ดึงข้อมูล system_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("deposit_rate")
      .order("created_at", { ascending: false })
      .limit(1);

    if (settingsError) {
      console.error("❌ Error fetching system settings:", settingsError);
      return { success: false, error: settingsError.message };
    }

    if (!settingsData || settingsData.length === 0) {
      console.log("⚠️ ไม่พบข้อมูล system_settings");
      return { success: false, error: "ไม่พบข้อมูล system_settings" };
    }

    const systemDepositRate = settingsData[0].deposit_rate;
    console.log(`📊 ราคาจาก system_settings: ${systemDepositRate} บาท`);

    // 2. ดึงข้อมูลห้องทั้งหมด
    const { data: roomsData, error: roomsError } = await supabase
      .from("rooms")
      .select("id, room_number, price")
      .order("room_number", { ascending: true });

    if (roomsError) {
      console.error("❌ Error fetching rooms:", roomsError);
      return { success: false, error: roomsError.message };
    }

    console.log(`🏠 พบห้องทั้งหมด: ${roomsData?.length || 0} ห้อง`);

    // 3. ตรวจสอบห้องที่มีราคาไม่ตรงกับ system_settings
    const roomsToUpdate = (roomsData || []).filter(
      (room) => room.price !== systemDepositRate
    );

    if (roomsToUpdate.length === 0) {
      console.log("✅ ราคาห้องทั้งหมดตรงกับ system_settings แล้ว");
      return {
        success: true,
        message: "ราคาห้องทั้งหมดตรงกับ system_settings แล้ว",
        updatedCount: 0,
      };
    }

    console.log(`🔧 พบห้องที่ต้องอัปเดต: ${roomsToUpdate.length} ห้อง`);
    roomsToUpdate.forEach((room) => {
      console.log(
        `   - ห้อง ${room.room_number}: ${room.price} → ${systemDepositRate}`
      );
    });

    // 4. อัปเดตราคาห้องทั้งหมดให้ตรงกับ system_settings
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ price: systemDepositRate })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // อัปเดตทุกห้อง

    if (updateError) {
      console.error("❌ Error updating room prices:", updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`✅ อัปเดตราคาห้องสำเร็จ: ${roomsToUpdate.length} ห้อง`);

    return {
      success: true,
      message: `อัปเดตราคาห้องสำเร็จ: ${roomsToUpdate.length} ห้อง`,
      updatedCount: roomsToUpdate.length,
      newPrice: systemDepositRate,
    };
  } catch (error) {
    console.error(
      "❌ Unexpected error in syncRoomPricesWithSystemSettings:",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    };
  }
};

/**
 * ฟังก์ชันสำหรับตรวจสอบราคาห้องปัจจุบัน
 */
export const checkCurrentRoomPrices = async () => {
  try {
    console.log("🔍 ตรวจสอบราคาห้องปัจจุบัน...");

    // ดึงข้อมูล system_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("deposit_rate")
      .order("created_at", { ascending: false })
      .limit(1);

    if (settingsError) {
      console.error("❌ Error fetching system settings:", settingsError);
      return { success: false, error: settingsError.message };
    }

    const systemDepositRate = settingsData?.[0]?.deposit_rate || 0;

    // ดึงข้อมูลห้องทั้งหมด
    const { data: roomsData, error: roomsError } = await supabase
      .from("rooms")
      .select("id, room_number, price")
      .order("room_number", { ascending: true });

    if (roomsError) {
      console.error("❌ Error fetching rooms:", roomsError);
      return { success: false, error: roomsError.message };
    }

    const rooms = roomsData || [];
    const roomsWithDifferentPrice = rooms.filter(
      (room) => room.price !== systemDepositRate
    );

    return {
      success: true,
      systemDepositRate,
      totalRooms: rooms.length,
      roomsWithDifferentPrice: roomsWithDifferentPrice.length,
      rooms: rooms,
      differentPriceRooms: roomsWithDifferentPrice,
    };
  } catch (error) {
    console.error("❌ Unexpected error in checkCurrentRoomPrices:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    };
  }
};
