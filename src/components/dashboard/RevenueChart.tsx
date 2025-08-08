
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MonthlyData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  monthlyData: MonthlyData[];
  formatCurrency: (value: number) => string;
  t: (key: string) => string;
}

export function RevenueChart({ monthlyData, formatCurrency, t }: RevenueChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t("dashboard.monthlyRevenue")}</CardTitle>
        <CardDescription>
          Revenue trend over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value) => [formatCurrency(value as number), "Revenue"]}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
