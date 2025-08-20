import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";
import { SystemSettingsCard } from "@/components/settings/SystemSettingsCard";
import { ThemeSettingsCard } from "@/components/settings/ThemeSettingsCard";

export default function SettingsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const getRoleText = (role: string) => {
    if (language === "th") {
      switch (role) {
        case "admin":
          return "ผู้ดูแลระบบ";
        case "staff":
          return "พนักงาน";
        case "tenant":
          return "ผู้เช่า";
        default:
          return "ผู้เยี่ยมชม";
      }
    } else {
      switch (role) {
        case "admin":
          return "Administrator";
        case "staff":
          return "Staff";
        case "tenant":
          return "Tenant";
        default:
          return "Visitor";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {language === "th" ? "ตั้งค่า" : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {language === "th"
              ? "จัดการการตั้งค่าระบบและโปรไฟล์ของคุณ"
              : "Manage your system settings and profile"}
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {getRoleText(user?.role || "visitor")}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <ProfileSettingsCard />

        {/* Theme Settings */}
        <ThemeSettingsCard />

        {/* System Settings - Admin Only */}
        {user?.role === "admin" && <SystemSettingsCard />}
      </div>
    </div>
  );
}
