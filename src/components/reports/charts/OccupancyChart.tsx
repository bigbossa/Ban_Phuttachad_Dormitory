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
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export const OccupancyChart = () => {
  const { occupancyData, isLoading } = useReportsData('occupancy');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Trends</CardTitle>
          <CardDescription>Monthly occupancy rates for the dormitory</CardDescription>
        </CardHeader>       
         <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Trends</CardTitle>
        <CardDescription>Monthly occupancy rates for the dormitory</CardDescription>
      </CardHeader>
      <CardContent className="h-[700px]">
        <ChartContainer
          config={{
            occupancy: {
              label: "Occupancy Rate",
              theme: {
                light: "#3b82f6",
                dark: "#60a5fa",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={occupancyData}
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
                domain={[0, 100]}
                tick={{ fill: "var(--foreground)" }}
                tickFormatter={(value) => `${value}%`}
              />
              <CustomTooltip />
              <Legend />
              <Bar
                dataKey="occupancy"
                name="Occupancy Rate"
                fill="var(--color-occupancy)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
