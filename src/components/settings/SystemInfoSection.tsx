import { useSystemStats } from "@/hooks/useSystemStats";
import { useLanguage } from "@/providers/LanguageProvider";

export function SystemInfoSection() {
  const { data: stats, isLoading: statsLoading } = useSystemStats();
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">{t("system.info")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {statsLoading ? "..." : stats?.totalRooms || 0}
          </div>
          <div className="text-sm text-muted-foreground">{t("system.totalRooms")}</div>
        </div>
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? "..." : stats?.occupiedRooms || 0}
          </div>
          <div className="text-sm text-muted-foreground">{t("system.occupiedRooms")}</div>
        </div>
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {statsLoading ? "..." : stats?.totalTenants || 0}
          </div>
          <div className="text-sm text-muted-foreground">{t("system.totalTenants")}</div>
        </div>
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {statsLoading ? "..." : stats?.pendingRepairs || 0}
          </div>
          <div className="text-sm text-muted-foreground">{t("system.pendingRepairs")}</div>
        </div>
      </div>
    </div>
  );
}
