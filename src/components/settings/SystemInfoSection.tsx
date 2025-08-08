
import { useSystemStats } from "@/hooks/useSystemStats";

export function SystemInfoSection() {
  const { data: stats, isLoading: statsLoading } = useSystemStats();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">ข้อมูลระบบ</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {statsLoading ? "..." : stats?.totalRooms || 0}
          </div>
          <div className="text-sm text-muted-foreground">ห้องทั้งหมด</div>
        </div>
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? "..." : stats?.occupiedRooms || 0}
          </div>
          <div className="text-sm text-muted-foreground">ห้องที่เช่าแล้ว</div>
        </div>
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {statsLoading ? "..." : stats?.totalTenants || 0}
          </div>
          <div className="text-sm text-muted-foreground">ผู้เช่าทั้งหมด</div>
        </div>
        <div className="text-center p-3 border rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {statsLoading ? "..." : stats?.pendingRepairs || 0}
          </div>
          <div className="text-sm text-muted-foreground">งานซ่อมรอดำเนินการ</div>
        </div>
      </div>
    </div>
  );
}
