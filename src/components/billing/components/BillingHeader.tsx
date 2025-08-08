import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface BillingHeaderProps {
  onOpenCalculationDialog: () => void;
  exportToExcel: () => void;
}

export default function BillingHeader({ onOpenCalculationDialog, exportToExcel }: BillingHeaderProps) {
const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">ระบบคิดเงิน</h1>
        <p className="text-muted-foreground">จัดการการคิดค่าใช้จ่ายของหอพัก</p>
      </div>
      {(user?.role === 'admin' || user?.role === 'staff') && (
    <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
      <Button
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
        onClick={exportToExcel}
      >
        <Download size={16} />
        <span>ส่งออก</span>
      </Button>
      <Button
        className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90"
        onClick={onOpenCalculationDialog}
      >
        <Plus size={16} />
        <span>คำนวณค่าใช้จ่าย</span>
      </Button>
    </div>
  )}
    </div>
  );
}
