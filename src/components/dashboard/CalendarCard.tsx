import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CalendarCardProps {
  t: (key: string) => string;
  userRole?: string;
}

export function CalendarCard({ t, userRole }: CalendarCardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInWeek = [
    t("calendar.days.sunday"),
    t("calendar.days.monday"),
    t("calendar.days.tuesday"),
    t("calendar.days.wednesday"),
    t("calendar.days.thursday"),
    t("calendar.days.friday"),
    t("calendar.days.saturday"),
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // เพิ่มวันว่างก่อนวันแรกของเดือน
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // เพิ่มวันในเดือน
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const formatMonthYear = (date: Date) => {
    const months = [
      t("calendar.months.january"),
      t("calendar.months.february"),
      t("calendar.months.march"),
      t("calendar.months.april"),
      t("calendar.months.may"),
      t("calendar.months.june"),
      t("calendar.months.july"),
      t("calendar.months.august"),
      t("calendar.months.september"),
      t("calendar.months.october"),
      t("calendar.months.november"),
      t("calendar.months.december"),
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // วันที่มีประกาศ (ตามภาพ)
  const hasAnnouncement = (day: number) => {
    if (!day) return false;
    // วันที่ 1, 20, 21, 28, 30 มีประกาศ
    return [1, 20, 21, 28, 30].includes(day);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {t("dashboard.calendar")}
        </CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {/* Header with month/year and navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-6 w-6 p-0"
            aria-label={t("calendar.previousMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {formatMonthYear(currentDate)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="h-6 w-6 p-0"
            aria-label={t("calendar.nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysInWeek.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground p-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                text-center text-xs p-1 rounded-md min-h-[24px] flex flex-col items-center justify-center relative
                ${
                  day === null
                    ? "text-transparent"
                    : isToday(day)
                    ? "bg-orange-500 text-white font-bold"
                    : "hover:bg-muted cursor-pointer"
                }
              `}
              title={
                day && hasAnnouncement(day)
                  ? t("calendar.hasAnnouncement")
                  : t("calendar.noAnnouncement")
              }
            >
              {day}
              {/* จุดสีส้มสำหรับวันที่มีประกาศ - แสดงเฉพาะ Admin และ Staff */}
              {day &&
                hasAnnouncement(day) &&
                (userRole === "admin" || userRole === "staff") && (
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-0.5"></div>
                )}
            </div>
          ))}
        </div>

        {/* Today indicator */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>{t("calendar.today")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
