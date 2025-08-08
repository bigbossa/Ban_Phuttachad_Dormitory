import { Wrench, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
}

export function ServiceStatsCard({ 
  monthlyData,
  pendingRepairs, 
  announcements, 
  formatCurrency, 
  t 
}: ServiceStatsCardProps) {
  const currentMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0;
  const currentMonth = monthlyData[monthlyData.length - 1]?.month || '';

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.monthlyRevenue")} ({currentMonth})
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(currentMonthRevenue)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.pendingRepairs")}
          </CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRepairs}</div>
          <div className="mt-2">
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("nav.announcements")}
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{announcements}</div>
          <div className="mt-2">
          </div>
        </CardContent>
      </Card>
    </>
  );
}
