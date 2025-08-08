
import { useState, useEffect } from "react";

export const useBillingFormState = (open: boolean) => {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [billingMonth, setBillingMonth] = useState("");
  const [waterUnits, setWaterUnits] = useState<number>(1);
  const [electricityUnits, setElectricityUnits] = useState<number>(0);
  const [previousMeterReading, setPreviousMeterReading] = useState<number>(0);
  const [currentMeterReading, setCurrentMeterReading] = useState<number>(0);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (open) {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const due = new Date(now.getFullYear(), now.getMonth() + 1, 5);
      const dueFormatted = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;

      setBillingMonth(month);
      setDueDate(dueFormatted);
    }
  }, [open]);

  // Calculate electricity units from meter readings
  useEffect(() => {
    const calculatedUnits = Math.max(0, currentMeterReading - previousMeterReading);
    setElectricityUnits(calculatedUnits);
  }, [currentMeterReading, previousMeterReading]);

  const resetForm = () => {
    setSelectedRoom("");
    setWaterUnits(1);
    setElectricityUnits(0);
    setPreviousMeterReading(0);
    setCurrentMeterReading(0);
    setBillingMonth("");
    setDueDate("");
  };

  return {
    selectedRoom,
    setSelectedRoom,
    billingMonth,
    setBillingMonth,
    waterUnits,
    setWaterUnits,
    electricityUnits,
    setElectricityUnits,
    previousMeterReading,
    setPreviousMeterReading,
    currentMeterReading,
    setCurrentMeterReading,
    dueDate,
    setDueDate,
    resetForm
  };
};
