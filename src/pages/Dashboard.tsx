import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/providers/AuthProvider";
import { useSystemStats } from "@/hooks/useSystemStats";
import { RoomStatsCard } from "@/components/dashboard/RoomStatsCard";
import { ServiceStatsCard } from "@/components/dashboard/ServiceStatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OccupancyVisualization } from "@/components/dashboard/OccupancyVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useReportsData } from "@/components/reports/hooks/useReportsData";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: systemStats, isLoading: statsLoading } = useSystemStats();
  const { revenueData, isLoading: revenueLoading } = useReportsData("revenue");

  const [tenantsInSameRoom, setTenantsInSameRoom] = useState([]);

  useEffect(() => {
    async function fetchTenants() {
      if (user?.tenant?.room_id) {
       const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("room_id", user.tenant.room_id)
        .eq("action", "1")
        .ilike("residents", "%ลูกเช่า%");

        if (error) {
          console.error("Error fetching tenants:", error);
          return;
        }
        setTenantsInSameRoom(data || []);
      }
    }

    fetchTenants();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (statsLoading || revenueLoading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  // เอาเฉพาะ 6 เดือนล่าสุด
  const last6Revenue = revenueData.slice(-6);

  // รวมรายได้ทั้งหมดที่ผ่านมา
  const totalRevenue = revenueData.reduce((sum, r) => sum + (r.revenue || 0), 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard.welcome") || "ยินดีต้อนรับ"}</h1>
          <p className="text-muted-foreground">{t("dashboard.overview") || "ภาพรวมระบบจัดการหอพัก"}</p>
        </div>
        {/* <div>
          <LanguageSwitcher />
        </div> */}

        {/* ข้อมูล user หลัก */}
        {user && (
          <Card className="p-4 space-y-4 max-w-md w-[90hv]">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              </div>
            </div>

            {/* รายชื่อ ลูกเช่าในห้องเดียวกัน ที่ action = 1 */}
           {tenantsInSameRoom.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="space-y-3">
                {tenantsInSameRoom.map((tenant) => (
                  <div key={tenant.id} className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.first_name + tenant.last_name}`}
                        alt={`${tenant.first_name} ${tenant.last_name}`}
                      />
                      <AvatarFallback>
                        {`${tenant.first_name} ${tenant.last_name}`
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{`${tenant.first_name} ${tenant.last_name}`}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">{tenant.email || "-"}</p>
                        <Badge variant="secondary">ลูกเช่า</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </Card>
        )}
      </div>

      {/* รายได้รวม */}
      <div className="mb-6 max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("dashboard.totalRevenue")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RoomStatsCard
          totalRooms={systemStats?.totalRooms || 0}
          occupiedRooms={systemStats?.occupiedRooms || 0}
          vacantRooms={(systemStats?.totalRooms || 0) - (systemStats?.occupiedRooms || 0)}
          t={t}
        />

        <ServiceStatsCard
          monthlyData={last6Revenue}
          pendingRepairs={systemStats?.pendingRepairs || 0}
          announcements={2}
          formatCurrency={formatCurrency}
          t={t}
        />
      </div>

      {/* Revenue Chart */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <RevenueChart monthlyData={last6Revenue} formatCurrency={formatCurrency} t={t} />

        <OccupancyVisualization
          occupiedRooms={systemStats?.occupiedRooms || 0}
          totalRooms={systemStats?.totalRooms || 0}
        />
      </div>
    </div>
  );
}
