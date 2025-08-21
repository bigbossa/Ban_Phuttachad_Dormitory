import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Create custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const amount = payload[0].value as number;
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary">{`${payload[0].name}: ${formatCurrency(
          amount
        )}`}</p>
      </div>
    );
  }
  return null;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
};

type RevenueChartProps = {
  year: number;
};

export const RevenueChart = ({ year }: RevenueChartProps) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from("billing")
          .select("room_rent, water_cost, billing_month")
          .gte("billing_month", `${year}-01-01`)
          .lte("billing_month", `${year}-12-31`);

        if (error) {
          setErrorMsg("เกิดข้อผิดพลาดในการดึงข้อมูล");
          setMonthlyRevenue([]);
          setLoading(false);
          return;
        }

        const revenueByMonth = Array(12).fill(0);
        data?.forEach((bill: { room_rent: number; water_cost: number; billing_month: string }) => {
          const month = new Date(bill.billing_month).getMonth();
          const total = (bill.room_rent || 0) + (bill.water_cost || 0);
          revenueByMonth[month] += total;
        });

        setMonthlyRevenue(revenueByMonth);
      } catch (err) {
        setErrorMsg("เกิดข้อผิดพลาดในการดึงข้อมูล");
        setMonthlyRevenue([]);
      }
      setLoading(false);
    };

    fetchRevenue();
  }, [year]);

  const chartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        label: `Revenue (${year})`,
        data: monthlyRevenue,
        backgroundColor: "#f59e42",
      },
    ],
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
          <CardDescription>
            Monthly revenue data for the dormitory
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (errorMsg) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-destructive">{errorMsg}</div>
        </CardContent>
      </Card>
    );
  }

  if (!monthlyRevenue.some((v) => v > 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-muted-foreground">ไม่มีข้อมูลรายรับในปีนี้</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analysis</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <Bar data={chartData} />
      </CardContent>
    </Card>
  );
};
