import { Wrench, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AnnouncementsCard } from "./AnnouncementsCard";
import { CalendarCard } from "./CalendarCard";

interface MonthlyData {
  month: string;
  revenue: number;
}

interface ServiceStatsCardProps {
  monthlyData: MonthlyData[];
  pendingRepairs: number;
  announcements: number;
  formatCurrency: (value: number) => string;
  t: (key: string) => string;
  userRole?: string;
  currentMonthBillStatus?: string;
}

export function ServiceStatsCard({
  monthlyData,
  pendingRepairs,
  announcements,
  formatCurrency,
  t,
  userRole,
  currentMonthBillStatus,
}: ServiceStatsCardProps) {
  const navigate = useNavigate();
  const currentMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0;
  const currentMonth = monthlyData[monthlyData.length - 1]?.month || "";

  const handleViewBilling = () => {
    navigate("/billing");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {userRole === "tenant"
              ? t("dashboard.currentMonthBill") || "ยอดบิลเดือนนี้"
              : `${t("dashboard.monthlyRevenue")} (${currentMonth})`}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userRole === "tenant"
              ? (() => {
                  switch (currentMonthBillStatus) {
                    case "paid":
                      return (
                        <span className="text-green-600 dark:text-green-400">
                          {t("dashboard.billPaid")}
                        </span>
                      );
                    case "pending":
                      return (
                        <span className="text-orange-600 dark:text-orange-400">
                          {t("dashboard.billPending")}
                        </span>
                      );
                    case "no_bill":
                      return (
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("dashboard.billNoBill")}
                        </span>
                      );
                    default:
                      return (
                        <span className="text-gray-600 dark:text-gray-400">
                          {currentMonthBillStatus || "กำลังโหลด..."}
                        </span>
                      );
                  }
                })()
              : formatCurrency(currentMonthRevenue)}
          </div>

          {/* ปุ่มลิงก์ไปหน้า Billing สำหรับผู้เช่า */}
          {userRole === "tenant" && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewBilling}
                className="w-full text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {t("dashboard.viewBillingDetails")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* การซ่อมแซมที่รอดำเนินการ - แสดงเฉพาะ Admin และ Staff */}
      {(userRole === "admin" || userRole === "staff") && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.pendingRepairs")}
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRepairs}</div>
            <div className="mt-2"></div>
          </CardContent>
        </Card>
      )}

      {/* ประกาศที่สำคัญ - แสดงเฉพาะผู้เช่า */}
      {userRole === "tenant" && <AnnouncementsCard t={t} />}

      {/* ปฏิทิน - แสดงเฉพาะผู้เช่า */}
      {userRole === "tenant" && <CalendarCard t={t} userRole={userRole} />}

      {/* ประกาศที่สำคัญ - แสดงเฉพาะ Admin และ Staff (จำนวนประกาศ) */}
      {(userRole === "admin" || userRole === "staff") && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.importantAnnouncements") || "ประกาศที่สำคัญ"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{announcements}</div>
            <div className="mt-2"></div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
