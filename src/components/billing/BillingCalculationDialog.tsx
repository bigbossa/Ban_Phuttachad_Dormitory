import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useBillingCalculation } from "./hooks/useBillingCalculation";
import BillingDateInputs from "./components/BillingDateInputs";
import CostBreakdown from "./components/CostBreakdown";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useLanguage } from "@/providers/LanguageProvider";

interface BillingCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBillingCreated: () => void;
}

export default function BillingCalculationDialog({
  open,
  onOpenChange,
  onBillingCreated,
}: BillingCalculationDialogProps) {
  const {
    loading,
    roomOccupancies,
    billingMonth,
    setBillingMonth,
    dueDate,
    setDueDate,
    handleCreateBilling,
    WATER_RATE,
    ELECTRICITY_RATE,
    resetForm,
  } = useBillingCalculation(open, onBillingCreated, onOpenChange);

  const [waterUnitsByRoom, setWaterUnitsByRoom] = useState<Record<string, number>>({});
  const [currentMeterReadingByRoom, setCurrentMeterReadingByRoom] = useState<Record<string, number>>({});
  const [validityByRoom, setValidityByRoom] = useState<Record<string, boolean>>({});
  const { settings } = useSystemSettings();
  const { t } = useLanguage();

  useEffect(() => {
    if (roomOccupancies?.length) {
      const waterInit: Record<string, number> = {};
      const meterInit: Record<string, number> = {};
      const validityInit: Record<string, boolean> = {};
      roomOccupancies.forEach((room) => {
        waterInit[room.room_id] = 0;
        meterInit[room.room_id] = room.latest_meter_reading || 0;
        validityInit[room.room_id] = true;
      });
      setWaterUnitsByRoom(waterInit);
      setCurrentMeterReadingByRoom(meterInit);
      setValidityByRoom(validityInit);
    }
  }, [roomOccupancies]);

  const onWaterUnitsChange = (roomId: string, value: number) => {
    setWaterUnitsByRoom((prev) => ({
      ...prev,
      [roomId]: value,
    }));
  };

  const onCurrentMeterReadingChange = (roomId: string, value: number) => {
    setCurrentMeterReadingByRoom((prev) => ({
      ...prev,
      [roomId]: value,
    }));
  };

  const onValidityChange = (roomId: string, isValid: boolean) => {
    setValidityByRoom((prev) => ({
      ...prev,
      [roomId]: isValid,
    }));
  };

  const isFormValid = Object.values(validityByRoom).every((v) => v === true);

  const onCreate = () => {
    handleCreateBilling(waterUnitsByRoom, currentMeterReadingByRoom);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px]">
        <DialogHeader className="sticky top-0 bg-background z-999 pb-4 border-b">
          <DialogTitle>
            {t("billing.calculateTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("billing.calculateDesc", { water: WATER_RATE, elec: ELECTRICITY_RATE })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <BillingDateInputs
            billingMonth={billingMonth}
            onBillingMonthChange={setBillingMonth}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
          />

          {roomOccupancies
            ?.slice()
            .sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number))
            .map((room) => {
              const roomId = room.room_id;
              const roomRent = settings.depositRate || 0;
              const occupantCount = room.occupants?.length || 0;

              const waterUnits = waterUnitsByRoom[roomId] || 0;
              const waterCost = occupantCount * WATER_RATE;

              const currentMeter = currentMeterReadingByRoom[roomId] || 0;
              const prevMeter = room.latest_meter_reading || 0;
              const electricityUnits = Math.max(currentMeter - prevMeter, 0);
              const electricityCost = electricityUnits * ELECTRICITY_RATE;

              const totalAmount = roomRent + waterCost + electricityCost;

              return (
                <CostBreakdown
                  key={roomId}
                  roomId={roomId}
                  room_number={room.room_number}
                  roomRent={roomRent}
                  waterUnits={waterUnits}
                  onWaterUnitsChange={(val) => onWaterUnitsChange(roomId, val)}
                  waterCost={waterCost}
                  electricityUnits={electricityUnits}
                  previousMeterReading={prevMeter}
                  currentMeterReading={currentMeter}
                  onCurrentMeterReadingChange={(val) => onCurrentMeterReadingChange(roomId, val)}
                  electricityCost={electricityCost}
                  totalAmount={totalAmount}
                  occupantCount={occupantCount}
                  WATER_RATE={WATER_RATE}
                  ELECTRICITY_RATE={ELECTRICITY_RATE}
                  onValidityChange={(valid) => onValidityChange(roomId, valid)}
                />
              );
            })}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onCreate} disabled={loading || !isFormValid}>
            {loading ? t("billing.creating") : t("billing.createBill")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
