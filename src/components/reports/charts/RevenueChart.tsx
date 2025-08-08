
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  ChartContainer,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
import { useReportsData } from "../hooks/useReportsData";

// Create custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const amount = payload[0].value as number;
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary">{`${payload[0].name}: ${formatCurrency(amount)}`}</p>
      </div>
    );
  }
  return null;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount);
};

export const RevenueChart = () => {
  const { revenueData, isLoading } = useReportsData('revenue');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
          <CardDescription>Monthly revenue data for the dormitory</CardDescription>
        </CardHeader>        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analysis</CardTitle>
        <CardDescription>Monthly revenue data for the dormitory</CardDescription>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue",
              theme: {
                light: "#10b981",
                dark: "#34d399",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "var(--foreground)" }}
              />
              <YAxis 
                tick={{ fill: "var(--foreground)" }}
                tickFormatter={(value) => formatCurrency(value).split('.')[0]}
              />
              <CustomTooltip />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="var(--color-revenue)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
