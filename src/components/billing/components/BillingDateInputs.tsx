import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/providers/LanguageProvider";

export default function BillingDateInputs() {
  // ดึงวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // หาวันที่ 5 ของเดือนถัดไปในรูปแบบ YYYY-MM-DD
  const getNextMonthDueDate = () => {
    const now = new Date();
    const due = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    const year = due.getFullYear();
    const month = String(due.getMonth() + 1).padStart(2, "0");
    const day = String(due.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { t } = useLanguage();
  const [billingDate] = useState(getCurrentDate());
  const [dueDate] = useState(getNextMonthDueDate());

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="billingDate" className="dark:text-foreground">
          {t("billing.billingDate")}
        </Label>
        <Input
          id="billingDate"
          type="date"
          value={billingDate}
          readOnly
          className="cursor-not-allowed bg-gray-100 dark:bg-background dark:text-foreground dark:border-gray-600"
        />
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="dueDate" className="dark:text-foreground">
          {t("billing.dueDate")}
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          readOnly
          className="cursor-not-allowed bg-gray-100 dark:bg-background dark:text-foreground dark:border-gray-600"
        />
      </div>
    </>
  );
}
