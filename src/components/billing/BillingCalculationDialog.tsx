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

  const [waterUnitsByRoom, setWaterUnitsByRoom] = useState<
    Record<string, number>
  >({});
  const [currentMeterReadingByRoom, setCurrentMeterReadingByRoom] = useState<
    Record<string, string>
  >({});
  const [validityByRoom, setValidityByRoom] = useState<Record<string, boolean>>(
    {}
  );
  const { settings } = useSystemSettings();
  const { t } = useLanguage();

  useEffect(() => {
    if (roomOccupancies?.length) {
      const waterInit: Record<string, number> = {};
      const meterInit: Record<string, string> = {};
      const validityInit: Record<string, boolean> = {};
      roomOccupancies.forEach((room) => {
        waterInit[room.room_id] = 0;
        meterInit[room.room_id] = ""; // บังคับให้เป็นค่าว่างเริ่มต้น
        validityInit[room.room_id] = false; // ต้องกรอกให้ครบ
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

  const onCurrentMeterReadingChange = (roomId: string, value: string) => {
    setCurrentMeterReadingByRoom((prev) => ({
      ...prev,
      [roomId]: value,
    }));

    const prev =
      roomOccupancies?.find((r) => r.room_id === roomId)
        ?.latest_meter_reading || 0;
    const isValid = value !== "" && Number(value) >= prev;
    setValidityByRoom((prevMap) => ({ ...prevMap, [roomId]: isValid }));
  };

  const isFormValid =
    roomOccupancies?.every((r) => validityByRoom[r.room_id] === true) ?? false;

  const onCreate = () => {
    // แปลงค่าเป็นตัวเลขก่อนส่งต่อ
    const numericMeters: Record<string, number> = {};
    roomOccupancies?.forEach((room) => {
      numericMeters[room.room_id] = Number(
        currentMeterReadingByRoom[room.room_id]
      );
    });
    handleCreateBilling(waterUnitsByRoom, numericMeters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px]">
        <DialogHeader className="sticky top-0 bg-background z-999 pb-4 border-b">
          <DialogTitle>{t("billing.calculateTitle")}</DialogTitle>
          <DialogDescription>
            {t("billing.calculateDesc", {
              water: WATER_RATE,
              elec: ELECTRICITY_RATE,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <BillingDateInputs
            billingMonth={billingMonth}
            onBillingMonthChange={setBillingMonth}
            dueDate={dueDate}
            onDueDateChange={setDueDate}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm bg-white dark:bg-background rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-card">
                <tr>
                  <th className="border px-2 py-1">
                    {" "}
                    {t("billing.roomNumber")}
                  </th>
                  <th className="border px-2 py-1"> {t("billing.roomRent")}</th>
                  <th className="border px-2 py-1">
                    💧 {t("billing.waterCost")}
                  </th>
                  <th className="border px-2 py-1">
                    ⚡ {t("billing.electricityCost")}
                  </th>
                  <th className="border px-2 py-1">
                    {" "}
                    {t("billing.previousMeter")}
                  </th>
                  <th className="border px-2 py-1">
                    {" "}
                    {t("billing.currentMeter")}
                  </th>
                  <th className="border px-2 py-1">🟢 {t("billing.total")}</th>
                </tr>
              </thead>
              <tbody>
                {roomOccupancies
                  ?.slice()
                  .sort(
                    (a, b) => parseInt(a.room_number) - parseInt(b.room_number)
                  )
                  .map((room) => {
                    const roomId = room.room_id;
                    const roomRent = settings.depositRate || 0;
                    const occupantCount = room.occupants?.length || 0;
                    const waterUnits = waterUnitsByRoom[roomId] || 0;
                    const waterCost = occupantCount * WATER_RATE;
                    const currentMeterStr =
                      currentMeterReadingByRoom[roomId] || "";
                    const currentMeter = Number(currentMeterStr) || 0;
                    const prevMeter = room.latest_meter_reading || 0;
                    const electricityUnits =
                      currentMeterStr === ""
                        ? 0
                        : Math.max(currentMeter - prevMeter, 0);
                    const electricityCost = electricityUnits * ELECTRICITY_RATE;
                    const totalAmount = roomRent + waterCost + electricityCost;
                    const invalid = !validityByRoom[roomId];
                    return (
                      <tr key={roomId} className="text-center">
                        <td className="border px-2 py-1 font-semibold">
                          {room.room_number}
                        </td>
                        <td className="border px-2 py-1">
                          {roomRent.toLocaleString()} {t("billing.baht")}
                        </td>
                        <td className="border px-2 py-1">
                          {waterCost.toLocaleString()} {t("billing.baht")}
                          <br />
                          <span className="text-xs text-gray-500">
                            ({occupantCount} × {WATER_RATE})
                          </span>
                        </td>
                        <td className="border px-2 py-1">
                          {electricityCost.toLocaleString()} {t("billing.baht")}
                          <br />
                          <span className="text-xs text-gray-500">
                            ({electricityUnits} {t("billing.electricityUnit")})
                          </span>
                        </td>
                        <td className="border px-2 py-1">{prevMeter}</td>
                        <td className="border px-2 py-1">
                          <input
                            type="number"
                            className={`w-24 border rounded px-1 py-0.5 dark:bg-background dark:text-foreground ${
                              invalid ? "border-red-500" : ""
                            }`}
                            value={currentMeterStr}
                            min={prevMeter}
                            step="1"
                            required
                            placeholder={t("billing.enterCurrentMeter") || ""}
                            onChange={(e) =>
                              onCurrentMeterReadingChange(
                                roomId,
                                e.target.value
                              )
                            }
                          />
                          {currentMeterStr === "" && (
                            <div className="text-xs text-red-500">
                              {t("billing.required") || "กรอกเลขมิเตอร์ใหม่"}
                            </div>
                          )}
                          {currentMeterStr !== "" &&
                            Number(currentMeterStr) < prevMeter && (
                              <div className="text-xs text-red-500">
                                {t("billing.meterMustBeGtePrev") ||
                                  `ต้องไม่ต่ำกว่าค่าก่อนหน้า (${prevMeter})`}
                              </div>
                            )}
                        </td>
                        <td className="border px-2 py-1 font-bold text-green-600">
                          {totalAmount.toLocaleString()} {t("billing.baht")}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
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
