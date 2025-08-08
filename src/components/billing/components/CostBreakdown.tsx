import { Input } from "@/components/ui/input";
import { Zap, Droplet, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";

interface CostBreakdownProps {
  roomId: string;
  room_number: string;
  roomRent: number;
  waterUnits: number;
  onWaterUnitsChange: (value: number) => void;
  waterCost: number;
  electricityUnits: number;
  previousMeterReading: number;
  currentMeterReading: number;
  onCurrentMeterReadingChange: (value: number) => void;
  electricityCost: number;
  totalAmount: number;
  occupantCount: number;
  WATER_RATE: number;
  ELECTRICITY_RATE: number;
  onValidityChange?: (isValid: boolean) => void; // 👈 เพิ่ม
}

export default function CostBreakdown({
  roomId,
  room_number,
  roomRent,
  waterUnits,
  onWaterUnitsChange,
  waterCost,
  electricityUnits,
  previousMeterReading,
  currentMeterReading,
  onCurrentMeterReadingChange,
  electricityCost,
  totalAmount,
  occupantCount,
  WATER_RATE,
  ELECTRICITY_RATE,
  onValidityChange,
}: CostBreakdownProps) {
  const [isValid, setIsValid] = useState(true);
  useEffect(() => {
    const valid = !isNaN(currentMeterReading) && currentMeterReading >= previousMeterReading;
    setIsValid(valid);
    onValidityChange?.(valid);
  }, [currentMeterReading, previousMeterReading]);
  const { t } = useLanguage();
  return (
    <div className="overflow-y-auto max-h-[35vh] sm:max-w-[650px] md:max-w-[750px] lg:max-w-[850px]">
      <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-card">
        <h3 className="font-bold text-xl mb-2 dark:text-foreground">{t("billing.roomNumber")}: {room_number}</h3>
        <h4 className="font-semibold text-lg dark:text-foreground">{t("billing.expenseDetail")}</h4>

        <div className="flex items-center justify-between p-3 bg-white dark:bg-background rounded border">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-600" />
            <span className="dark:text-foreground">{t("billing.roomRent")}</span>
          </div>
          <span className="font-medium dark:text-foreground">{roomRent.toLocaleString()} {t("billing.baht")}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-background rounded border">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-600" />
              <span className="dark:text-foreground">
                {t("billing.waterCost")} ({occupantCount} {t("billing.personUnit")} × {WATER_RATE} {t("billing.baht")}/{t("billing.personUnit")})
              </span>
            </div>
            <span className="font-medium dark:text-foreground">{(occupantCount * WATER_RATE).toLocaleString()} {t("billing.baht")}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-white dark:bg-background rounded border">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="dark:text-foreground">
                {t("billing.electricityCost")} ({t("billing.electricityUnit")} × {ELECTRICITY_RATE} {t("billing.baht")}/{t("billing.electricityUnit")})
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-card rounded">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-foreground">
                    {t("billing.previousMeter")}: <span className="font-medium ml-1 dark:text-foreground">{previousMeterReading}</span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-foreground">{t("billing.currentMeter")}:</span>
                  <Input
                    type="number"
                    value={currentMeterReading}
                    onChange={(e) => onCurrentMeterReadingChange(Number(e.target.value))}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val < previousMeterReading) {
                        onCurrentMeterReadingChange(previousMeterReading);
                      }
                    }}
                    min={previousMeterReading}
                    step="1"
                    className="w-24 dark:bg-background dark:text-foreground"
                  />
                </div>
              </div>
              {currentMeterReading < previousMeterReading && (
                <p className="text-red-500 text-sm ml-2">
                  * {t("billing.meterError")}
                </p>
              )}
              <div className="p-2 bg-gray-50 dark:bg-card rounded border flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-foreground">{t("billing.electricityUnitUsed")}:</span>
                <span className="font-medium dark:text-foreground">
                  {electricityUnits.toFixed(1)} {t("billing.electricityUnit")} = {electricityCost.toLocaleString()} {t("billing.baht")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded border-2 border-green-200 dark:border-green-700">
          <span className="font-semibold text-lg dark:text-foreground">{t("billing.total")}</span>
          <span className="font-bold text-xl text-green-600 dark:text-green-300">{totalAmount.toLocaleString()} {t("billing.baht")}</span>
        </div>

        <div className="text-sm text-gray-600 dark:text-foreground p-2 bg-blue-50 dark:bg-blue-900 rounded">
          {t("billing.noteRoomTotal", { count: occupantCount })}
        </div>
      </div>
    </div>
  );
}
