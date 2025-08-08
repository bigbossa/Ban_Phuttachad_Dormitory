import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { SystemInfoSection } from "./SystemInfoSection";
import { SystemConfigSection } from "./SystemConfigSection";
import { SystemMaintenanceSection } from "./SystemMaintenanceSection";
import { SystemStatusSection } from "./SystemStatusSection";
import { useLanguage } from "@/providers/LanguageProvider";

export function SystemSettingsCard() {
  const { t } = useLanguage();

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>{t("system.title")}</span>
        </CardTitle>
        <CardDescription>
          {t("system.description")}
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
