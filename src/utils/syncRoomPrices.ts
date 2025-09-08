/**
 * Utility functions to sync room prices with system settings
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RoomPriceSyncResult {
  success: boolean;
  updatedRooms: number;
  errors: string[];
  message: string;
}

/**
 * Sync all room prices with system settings deposit rate
 */
export const syncAllRoomPrices = async (): Promise<RoomPriceSyncResult> => {
  const errors: string[] = [];
  let updatedRooms = 0;

  try {
    // Get current system settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("deposit_rate")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (settingsError) {
      errors.push(`Failed to fetch system settings: ${settingsError.message}`);
      return {
        success: false,
        updatedRooms: 0,
        errors,
        message: "Failed to fetch system settings",
      };
    }

    const systemDepositRate = settingsData.deposit_rate;

    // Get all rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from("rooms")
      .select("id, room_number, price");

    if (roomsError) {
      errors.push(`Failed to fetch rooms: ${roomsError.message}`);
      return {
        success: false,
        updatedRooms: 0,
        errors,
        message: "Failed to fetch rooms",
      };
    }

    // Find rooms that need price updates
    const roomsToUpdate =
      roomsData?.filter((room) => room.price !== systemDepositRate) || [];

    if (roomsToUpdate.length === 0) {
      return {
        success: true,
        updatedRooms: 0,
        errors: [],
        message: "All room prices are already synchronized",
      };
    }

    // Update room prices
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ price: systemDepositRate })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all rooms

    if (updateError) {
      errors.push(`Failed to update room prices: ${updateError.message}`);
      return {
        success: false,
        updatedRooms: 0,
        errors,
        message: "Failed to update room prices",
      };
    }

    updatedRooms = roomsToUpdate.length;

    console.log(
      `✅ Successfully synced ${updatedRooms} room prices to ${systemDepositRate} baht`
    );

    return {
      success: true,
      updatedRooms,
      errors: [],
      message: `Successfully updated ${updatedRooms} room prices to ${systemDepositRate} baht`,
    };
  } catch (error) {
    errors.push(`Unexpected error: ${error}`);
    return {
      success: false,
      updatedRooms: 0,
      errors,
      message: "Unexpected error occurred",
    };
  }
};

/**
 * Check if room prices are synchronized with system settings
 */
export const checkRoomPriceSync = async (): Promise<{
  isSynced: boolean;
  systemRate: number;
  mismatchedRooms: Array<{
    id: string;
    room_number: string;
    current_price: number;
  }>;
}> => {
  try {
    // Get current system settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("system_settings")
      .select("deposit_rate")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (settingsError) {
      throw new Error(
        `Failed to fetch system settings: ${settingsError.message}`
      );
    }

    const systemRate = settingsData.deposit_rate;

    // Get all rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from("rooms")
      .select("id, room_number, price");

    if (roomsError) {
      throw new Error(`Failed to fetch rooms: ${roomsError.message}`);
    }

    // Find mismatched rooms
    const mismatchedRooms =
      roomsData
        ?.filter((room) => room.price !== systemRate)
        .map((room) => ({
          id: room.id,
          room_number: room.room_number,
          current_price: room.price,
        })) || [];

    return {
      isSynced: mismatchedRooms.length === 0,
      systemRate,
      mismatchedRooms,
    };
  } catch (error) {
    console.error("Error checking room price sync:", error);
    return {
      isSynced: false,
      systemRate: 0,
      mismatchedRooms: [],
    };
  }
};

/**
 * Sync room prices and show toast notification
 */
export const syncRoomPricesWithNotification = async () => {
  try {
    const result = await syncAllRoomPrices();

    if (result.success) {
      if (result.updatedRooms > 0) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    } else {
      toast.error(result.message);
    }

    return result;
  } catch (error) {
    toast.error("Failed to sync room prices");
    return {
      success: false,
      updatedRooms: 0,
      errors: [String(error)],
      message: "Failed to sync room prices",
    };
  }
};

