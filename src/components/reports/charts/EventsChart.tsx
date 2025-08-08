
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
        {payload.map((entry, index) => (
          <p key={index} className="text-primary">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const EventsChart = () => {
  const { eventAttendanceData, isLoading } = useReportsData('events');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Attendance</CardTitle>
          <CardDescription>Monthly event participation and attendance rates</CardDescription>
        </CardHeader>        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Attendance</CardTitle>
        <CardDescription>Monthly event participation and attendance rates</CardDescription>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ChartContainer
          config={{
            events: {
              label: "Events",
              theme: {
                light: "#6366f1",
                dark: "#818cf8",
              },
            },
            attendees: {
              label: "Total Attendees",
              theme: {
                light: "#ec4899",
                dark: "#f472b6",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventAttendanceData}
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
              />
              <CustomTooltip />
              <Legend />
              <Bar
                dataKey="events"
                name="Events"
                fill="var(--color-events)"
              />
              <Bar
                dataKey="attendees"
                name="Total Attendees"
                fill="var(--color-attendees)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
