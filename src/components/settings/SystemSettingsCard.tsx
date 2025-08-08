
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { SystemInfoSection } from "./SystemInfoSection";
import { SystemConfigSection } from "./SystemConfigSection";
import { SystemMaintenanceSection } from "./SystemMaintenanceSection";
import { SystemStatusSection } from "./SystemStatusSection";

export function SystemSettingsCard() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>ตั้งค่าระบบ</span>
        </CardTitle>
        <CardDescription>
          การตั้งค่าระบบและการบำรุงรักษา (เฉพาะผู้ดูแลระบบ)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Information */}
        <SystemInfoSection />

        <Separator />

        {/* System Configuration */}
        <SystemConfigSection />

        <Separator />

        {/* System Maintenance */}
        <SystemMaintenanceSection />

        <Separator />

        {/* System Status */}
        <SystemStatusSection />
      </CardContent>
    </Card>
  );
}
