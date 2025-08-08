import { useState } from "react";
import { useReportsData } from "@/components/reports/hooks/useReportsData";

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  pendingRepairs: number;
  monthlyRevenue: number;
  announcements: number;
}

type MonthlyData = {
  month: string;
  revenue: number;
};

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 50,
    occupiedRooms: 42,
    vacantRooms: 8,
    pendingRepairs: 3,
    monthlyRevenue: 175000,
    announcements: 2,
  });

  const { revenueData, isLoading } = useReportsData("revenue");

  const fallbackData = [
    { month: "Jan", revenue: 10000 },
    { month: "Feb", revenue: 12000 },
    { month: "Mar", revenue: 9000 },
    { month: "Apr", revenue: 15000 },
    { month: "May", revenue: 11000 },
    { month: "Jun", revenue: 13000 },
  ];

  // เอา 6 เดือนล่าสุด
  const last6Revenue = revenueData.length > 0 ? revenueData.slice(-6) : fallbackData;

  const chartData = {
    labels: last6Revenue.map((item) => item.month),
    datasets: [
      {
        label: "รายได้ (บาท)",
        data: last6Revenue.map((item) => item.revenue),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  // ดึง 6 เดือนล่าสุด
  const last6Occupancy = revenueData.slice(-6);

  const occupancyChartData = {
    labels: last6Occupancy.map((item) => item.month),
    datasets: [
      {
        label: "Occupancy Rate",
        data: last6Occupancy.map(
          (item) => (item.occupiedRooms / (item.occupiedRooms + item.vacantRooms)) * 100
        ),
        backgroundColor: "#60a5fa",
      },
    ],
  };

  const revenueChartData = {
    labels: last6Revenue.map((item) => item.month),
    datasets: [
      {
        label: "รายได้ (บาท)",
        data: last6Revenue.map((item) => item.revenue),
        backgroundColor: "#34d399",
      },
    ],
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(value);
  };

  console.log("occupancyData", occupancyData);
  console.log("revenueData", revenueData);

  return {
    stats,
    monthlyData,
    formatCurrency,
    chartData,
    occupancyChartData,
    revenueChartData,
  };
}
