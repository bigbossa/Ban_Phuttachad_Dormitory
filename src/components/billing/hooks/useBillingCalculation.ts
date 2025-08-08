import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRoomOccupancyData } from "./useRoomOccupancyData";
import { useBillingFormState } from "./useBillingFormState";
import { createRoomBillingRecord } from "../utils/billingApi";
import { supabase } from "@/integrations/supabase/client";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export const useBillingCalculation = (
  open: boolean,
  onBillingCreated: () => void,
  onOpenChange: (open: boolean) => void
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { settings } = useSystemSettings();
  const { roomOccupancies } = useRoomOccupancyData(open);

  const {
    billingMonth,
    setBillingMonth,
    dueDate,
    setDueDate,
    resetForm,
  } = useBillingFormState(open);

  const WATER_RATE = 20;
  const ELECTRICITY_RATE = 7;
  const BillingMonth = `${billingMonth}-01`;

const handleCreateBilling = async (
  waterUnitsByRoom: Record<string, number>,
  currentMeterReadingByRoom: Record<string, number>
) => {
  try {
    setLoading(true);
    const errors: string[] = [];

    for (const room of roomOccupancies) {
      const roomId = room.room_id;
      const occupantCount = room.occupants?.length || 0;

      // ตรวจสอบว่ามีบิลเดือนนั้นๆ ของห้องนี้แล้วหรือยัง
      const { data: existingBills, error: checkError } = await supabase
        .from("billing")
        .select("id")
        .eq("room_id", roomId)
        .eq("billing_month", BillingMonth);

      if (checkError) {
        console.error("Error checking existing billing:", checkError);
        errors.push(`ห้อง ${room.room_number}: ไม่สามารถตรวจสอบบิลเดิมได้`);
        continue; // ข้ามห้องนี้ไปเลย
      }

      if (existingBills && existingBills.length > 0) {
        errors.push(`ห้อง ${room.room_number}: มีบิลในเดือนนี้แล้ว ไม่สามารถสร้างซ้ำได้`);
        continue; // ข้ามห้องนี้ไม่สร้างบิลซ้ำ
      }

      const waterUnits = occupantCount || 0;
      const currentMeter = currentMeterReadingByRoom[roomId] || 0;
      const prevMeter = room.latest_meter_reading || 0;
      const electricityUnits = Math.max(currentMeter - prevMeter, 0);

      const roomRent = settings.depositRate || 0;
      const waterCost = occupantCount * settings.waterRate;
      const electricityCost = electricityUnits * settings.electricityRate;
      const totalAmount = roomRent + waterCost + electricityCost;

      const billingData = {
        selectedRoomData: room,
        billingMonth,
        roomRent,
        waterUnits,
        waterCost,
        electricityUnits,
        electricityCost,
        totalAmount,
        dueDate,
        occupantCount,
      };

      try {
        await createRoomBillingRecord(billingData);
        await supabase
          .from("rooms")
          .update({ latest_meter_reading: currentMeter })
          .eq("id", roomId);
      } catch (err: any) {
        console.error(`Error creating billing for room ${room.room_number}:`, err);
        errors.push(`ห้อง ${room.room_number}: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: "บางห้องสร้างบิลไม่สำเร็จ",
        description: errors.join("\n"),
        variant: "destructive",
      });
    } else {
      toast({
        title: "สร้างบิลสำเร็จ",
        description: `สร้างบิลทั้งหมดเรียบร้อยแล้ว`,
      });
    }

    onBillingCreated();
    onOpenChange(false);
    resetForm();
  } catch (err) {
    console.error("Error in handleCreateBilling:", err);
    toast({
      title: "Error",
      description: err instanceof Error ? err.message : "เกิดข้อผิดพลาด",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  return {
    loading,
    roomOccupancies,
    billingMonth,
    setBillingMonth,
    dueDate,
    setDueDate,
    handleCreateBilling,
    resetForm,
    WATER_RATE,
    ELECTRICITY_RATE,
  };
};
