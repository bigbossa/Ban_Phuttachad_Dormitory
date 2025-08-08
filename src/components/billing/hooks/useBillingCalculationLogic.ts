
import { useMemo } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

interface RoomOccupancy {
  room_id: string;
  room_number: string;
  room_price: number;
  occupant_count: number;
  latest_meter_reading: number;
  occupants: Array<{
    tenant_id: string;
    tenant_name: string;
    occupancy_id: string;
  }>;
}

export const useBillingCalculationLogic = (
  roomOccupancies: RoomOccupancy[],
  selectedRoom: string,
  waterUnits: number,
  electricityUnits: number
) => {
  const { settings } = useSystemSettings();

  const selectedRoomData = useMemo(() => {
    return roomOccupancies.find(room => room.room_id === selectedRoom);
  }, [roomOccupancies, selectedRoom]);

  const roomRent = settings.depositRate || 0;
  
  // Calculate water cost based on number of occupants
  const occupantCount = selectedRoomData?.occupant_count || 1;
  const waterCost = waterUnits * occupantCount * settings.waterRate;
  
  const electricityCost = electricityUnits * settings.electricityRate;
  const totalAmount = roomRent + waterCost + electricityCost;

  return {
    selectedRoomData,
    roomRent,
    waterCost,
    electricityCost,
    totalAmount,
    occupantCount,
    WATER_RATE: settings.waterRate,
    ELECTRICITY_RATE: settings.electricityRate
  };
};
