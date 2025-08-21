import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  TooltipProps,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { useReportsData } from "../hooks/useReportsData";

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
        <p className="font-medium">{`ปี ${label}`}</p>
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

export const RevenueYearlyChart = () => {
  const { revenueYearlyData, revenueSummaryData, isLoading } =
    useReportsData("revenueYearly");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>รายได้รายปี</CardTitle>
          <CardDescription>ข้อมูลรายได้รายปีของหอพัก</CardDescription>
        </CardHeader>
        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-muted-foreground">กำลังโหลด...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายได้รายปี</CardTitle>
        <CardDescription>ข้อมูลรายได้รายปีของหอพัก</CardDescription>
        {revenueSummaryData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(revenueSummaryData.totalRevenue).split(".")[0]}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                รายได้ทั้งหมด
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {
                  formatCurrency(revenueSummaryData.averageYearlyRevenue).split(
                    "."
                  )[0]
                }
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                รายได้เฉลี่ย/ปี
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {revenueSummaryData.bestYear}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                ปีที่ดีที่สุด
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {revenueSummaryData.totalYears}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                จำนวนปี
              </div>
            </div>
          </div>
        )}

        {/* แสดงข้อมูลเปรียบเทียบรายปี */}
        {revenueYearlyData.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(
                  revenueYearlyData[revenueYearlyData.length - 1].revenue -
                    revenueYearlyData[revenueYearlyData.length - 2].revenue
                )}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                การเปลี่ยนแปลงจากปีก่อน
              </div>
            </div>
            <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(
                  (revenueYearlyData[revenueYearlyData.length - 1].revenue /
                    revenueSummaryData.averageYearlyRevenue) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400">
                เปรียบเทียบกับค่าเฉลี่ย
              </div>
            </div>
            <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
                {revenueYearlyData[revenueYearlyData.length - 1].year}
              </div>
              <div className="text-sm text-pink-600 dark:text-pink-400">
                ปีล่าสุด
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[500px]">
        <ChartContainer
          config={{
            revenue: {
              label: "รายได้",
              theme: {
                light: "#10b981",
                dark: "#34d399",
              },
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={revenueYearlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fill: "var(--foreground)" }} />
              <YAxis
                tick={{ fill: "var(--foreground)" }}
                tickFormatter={(value) => formatCurrency(value).split(".")[0]}
              />
              <CustomTooltip />
              <Legend />
              <Bar
                dataKey="revenue"
                name="รายได้"
                fill="var(--color-revenue)"
              />
              {revenueSummaryData && (
                <Bar
                  dataKey={(data) =>
                    data.year === revenueSummaryData.bestYear ? data.revenue : 0
                  }
                  name="ปีที่ดีที่สุด"
                  fill="#8b5cf6"
                  opacity={0.8}
                />
              )}
              <Line
                type="monotone"
                dataKey="revenue"
                name="แนวโน้มรายได้"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {revenueSummaryData && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-center">
              สรุปข้อมูลรายได้รายปี
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    รายได้รวมทั้งหมด:
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(revenueSummaryData.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    รายได้เฉลี่ยต่อปี:
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(revenueSummaryData.averageYearlyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    จำนวนปีที่มีข้อมูล:
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {revenueSummaryData.totalYears} ปี
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    ปีที่มีรายได้สูงสุด:
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {revenueSummaryData.bestYear}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    รายได้ในปี {revenueSummaryData.bestYear}:
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(revenueSummaryData.bestYearRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    เปอร์เซ็นต์ของรายได้รวม:
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {Math.round(
                      (revenueSummaryData.bestYearRevenue /
                        revenueSummaryData.totalRevenue) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* แสดงข้อมูลเปรียบเทียบรายปี */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium mb-3 text-center">
                ข้อมูลเปรียบเทียบรายปี
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      การเปลี่ยนแปลงจากปีก่อน:
                    </span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {revenueYearlyData.length > 1
                        ? formatCurrency(
                            revenueYearlyData[revenueYearlyData.length - 1]
                              .revenue -
                              revenueYearlyData[revenueYearlyData.length - 2]
                                .revenue
                          )
                        : "ไม่มีข้อมูล"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      เปรียบเทียบกับค่าเฉลี่ย:
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {revenueYearlyData.length > 0
                        ? Math.round(
                            (revenueYearlyData[revenueYearlyData.length - 1]
                              .revenue /
                              revenueSummaryData.averageYearlyRevenue) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      ปีล่าสุด:
                    </span>
                    <span className="font-semibold text-pink-600 dark:text-pink-400">
                      {revenueYearlyData.length > 0
                        ? revenueYearlyData[revenueYearlyData.length - 1].year
                        : "ไม่มีข้อมูล"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      แนวโน้ม:
                    </span>
                    <span
                      className={`font-semibold ${
                        revenueYearlyData.length > 1 &&
                        revenueYearlyData[revenueYearlyData.length - 1]
                          .revenue >
                          revenueYearlyData[revenueYearlyData.length - 2]
                            .revenue
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {revenueYearlyData.length > 1
                        ? revenueYearlyData[revenueYearlyData.length - 1]
                            .revenue >
                          revenueYearlyData[revenueYearlyData.length - 2]
                            .revenue
                          ? "เพิ่มขึ้น"
                          : "ลดลง"
                        : "ไม่มีข้อมูล"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
