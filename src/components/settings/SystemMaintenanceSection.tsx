
import { Button } from "@/components/ui/button";
import { Database, Zap, AlertTriangle } from "lucide-react";
import { useSystemMaintenance } from "@/hooks/useSystemMaintenance";

export function SystemMaintenanceSection() {
  const { backupLoading, handleSystemBackup, handleClearCache } = useSystemMaintenance();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">การบำรุงรักษาระบบ</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <Button 
          variant="outline" 
          onClick={handleSystemBackup}
          disabled={backupLoading}
          className="flex items-center space-x-2"
        >
          <Database className="h-4 w-4" />
          <span>{backupLoading ? "กำลังสำรอง..." : "สำรองข้อมูล"}</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleClearCache}
          className="flex items-center space-x-2"
        >
          <Zap className="h-4 w-4" />
          <span>ล้าง Cache</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>ตรวจสอบระบบ</span>
        </Button>
      </div>
    </div>
  );
}
