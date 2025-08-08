import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useAuth } from "@/providers/AuthProvider";

interface BillingRecord {
  id: string;
  billing_month: string;
  tenant_id: string;
  room_rent: number;
  water_units: number;
  water_cost: number;
  electricity_units: number;
  electricity_cost: number;
  sum: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  receipt_number: string;
  fullname: string | null;
  room_id: string;
  tenants: { first_name: string; last_name: string };
}

interface BillingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billing: BillingRecord;
  onSave: (updatedBilling: Partial<BillingRecord>) => void;
  onReload?: () => void;
}

export default function BillingEditDialog({
  open,
  onOpenChange,
  billing,
  onSave,
}: BillingEditDialogProps) {
  const [previousMeter, setPreviousMeter] = useState(0);
  const [currentMeterInput, setCurrentMeterInput] = useState("");
  const [loading, setLoading] = useState(true);
  const { settings } = useSystemSettings();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPreviousMeter = async () => {
      if (!billing.room_id) return;

      const { data, error } = await supabase
        .from("rooms")
        .select("latest_meter_reading")
        .eq("id", billing.room_id)
        .single();

      if (error) {
        console.error("Error fetching latest_meter_reading:", error);
      } else {
        const latest = Number(data.latest_meter_reading) || 0;
        setPreviousMeter(latest);
        setCurrentMeterInput(String(latest)); // default ค่าเริ่มต้น
      }

      setLoading(false);
    };

    fetchPreviousMeter();
  }, [billing.room_id]);

  const ELECTRICITY_RATE = settings.electricityRate || 0;
  const currentMeter = Number(currentMeterInput) || 0;
  const electricityUnits = billing.electricity_units + (currentMeter - previousMeter);
  const newElectricityCost = electricityUnits * ELECTRICITY_RATE;
  const totalAmount =
  billing.room_rent +
  billing.water_cost +
  (newElectricityCost > 0 ? newElectricityCost : 0);
  
  if (loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขบิล: {billing.receipt_number}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 overflow-y-auto max-h-[70vh] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[850px]">
          <div>
            <Label>เลขมิเตอร์ปัจจุบัน</Label>
            <Input
              type="number"
              value={currentMeterInput}
              onChange={(e) => setCurrentMeterInput(e.target.value)}
              onBlur={() => {
                const value = Number(currentMeterInput);
                if (value < previousMeter) {
                  alert(`เลขมิเตอร์ต้องไม่ต่ำกว่าค่าก่อนหน้า (${previousMeter})`);
                  setCurrentMeterInput(String(previousMeter));
                }
              }}
            />
            {currentMeter < previousMeter && (
              <p className="text-sm text-red-600 mt-1">
                เลขมิเตอร์ต้องไม่ต่ำกว่าค่าก่อนหน้า ({previousMeter})
              </p>
            )}
          </div>

          <div className="text-right font-bold">
            ยอดรวม: {totalAmount.toLocaleString()} บาท
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
         <button
        disabled={currentMeter < previousMeter}
        onClick={async () => {
            if (currentMeter < previousMeter) return;

            const updatedBilling = {
            edit_name:user.id,
            electricity_units: electricityUnits,
            electricity_cost: newElectricityCost > 0 ? newElectricityCost : 0,
            sum: totalAmount,
            };

            // อัปเดตตาราง billings
            const { error: billingError } = await supabase
            .from("billing")
            .update(updatedBilling)
            .eq("id", billing.id);

            if (billingError) {
            console.error("Error updating billing:", billingError);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลบิล");
            return;
            }

            // อัปเดต latest_meter_reading ในตาราง rooms
            const { error: roomError } = await supabase
            .from("rooms")
            .update({ latest_meter_reading: currentMeter })
            .eq("id", billing.room_id);

            if (roomError) {
            console.error("Error updating room meter:", roomError);
            alert("บันทึกบิลสำเร็จ แต่ไม่สามารถอัปเดตเลขมิเตอร์ห้องได้");
            return;
            }

            onSave(updatedBilling);
            onOpenChange(false);
            window.location.reload();
        }}
        className={`px-4 py-2 rounded text-white ${
            currentMeter < previousMeter
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        >
        บันทึก
        </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
