import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, subDays } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  publish_date: string;
  important: boolean | null;
  action?: string | null;
  created_at?: string | null;
}

interface AnnouncementsCardProps {
  t: (key: string) => string;
}

export function AnnouncementsCard({ t }: AnnouncementsCardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันกรองประกาศที่อยู่ใน 7 วันล่าสุด
  const isWithinLast7Days = (dateStr: string) => {
    const now = new Date();
    const inputDate = new Date(dateStr);
    const sevenDaysAgo = subDays(now, 7);
    return inputDate >= sevenDaysAgo;
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("announcements")
          .select(
            `
            id,
            title,
            content,
            publish_date,
            important,
            action,
            created_at
          `
          )
          .order("publish_date", { ascending: false })
          .limit(10); // ดึงมาเยอะหน่อย แล้วค่อยกรอง

        if (error) {
          console.error("Error fetching announcements:", error);
          return;
        }

        if (data) {
          // กรองเฉพาะประกาศที่อยู่ใน 7 วันล่าสุด และ action = "1" (ประกาศที่ยังใช้งานได้)
          const filtered = data.filter(
            (a) =>
              isWithinLast7Days(a.publish_date) &&
              (a.action === "1" || a.action === null)
          );
          setAnnouncements(filtered);
          console.log("Dashboard - Fetched announcements:", filtered);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getPriorityColor = (important: boolean | null) => {
    if (important) {
      return "bg-red-500 text-white";
    }
    return "bg-blue-500 text-white";
  };

  const getPriorityText = (important: boolean | null) => {
    if (important) {
      return "สำคัญ";
    }
    return "ทั่วไป";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.topics") || "หัวข้อ"}
          </CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            กำลังโหลดประกาศ...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {t("dashboard.topics") || "หัวข้อ"}
        </CardTitle>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">{announcement.title}</h4>
                  <Badge
                    className={`text-xs ${getPriorityColor(
                      announcement.important
                    )}`}
                  >
                    {getPriorityText(announcement.important)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {announcement.content}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>
                    {format(parseISO(announcement.publish_date), "d MMMM yyyy")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              ไม่มีประกาศในขณะนี้
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
