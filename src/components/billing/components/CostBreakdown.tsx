import { Input } from "@/components/ui/input";
import { Zap, Droplet, Home } from "lucide-react";
import { useEffect, useState } from "react";

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

  return (
    <div className="overflow-y-auto max-h-[35vh] sm:max-w-[650px] md:max-w-[750px] lg:max-w-[850px]">
      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
        <h3 className="font-bold text-xl mb-2">ห้อง {room_number}</h3>
        <h4 className="font-semibold text-lg">รายละเอียดค่าใช้จ่าย</h4>

        <div className="flex items-center justify-between p-3 bg-white rounded border">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-600" />
            <span>ค่าห้อง</span>
          </div>
          <span className="font-medium">{roomRent.toLocaleString()} บาท</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-600" />
              <span>ค่าน้ำ ({occupantCount} คน × {WATER_RATE} บาท/หัว)</span>
            </div>
            <span className="font-medium">{(occupantCount * WATER_RATE).toLocaleString()} บาท</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-white rounded border">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span>ค่าไฟ (หน่วยละ {ELECTRICITY_RATE} บาท)</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    เลขมิเตอร์เก่า:
                    <span className="font-medium ml-1">{previousMeterReading}</span>
                  </span>
                  <span className="text-sm text-gray-600">เลขมิเตอร์ใหม่:</span>
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
                    className="w-24"
                  />
                </div>
              </div>
              {currentMeterReading < previousMeterReading && (
                <p className="text-red-500 text-sm ml-2">* กรุณากรอกเลขมิเตอร์ใหม่ให้ถูกต้อง</p>
              )}
              <div className="p-2 bg-gray-50 rounded border flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">หน่วยที่ใช้:</span>
                <span className="font-medium">{electricityUnits.toFixed(1)} หน่วย = {electricityCost.toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded border-2 border-green-200">
          <span className="font-semibold text-lg">รวมทั้งหมด</span>
          <span className="font-bold text-xl text-green-600">{totalAmount.toLocaleString()} บาท</span>
        </div>

        <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
          หมายเหตุ: บิลนี้สำหรับทั้งห้อง รวม {occupantCount} คน
        </div>
      </div>
    </div>
  );
}
