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
import { UserManagementDialog } from "@/components/auth/UserManagementDialog";
import { Users, Shield } from "lucide-react";

export default function UserManagementPage() {
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

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {language === "th" ? "ไม่มีสิทธิ์เข้าถึง" : "Access Denied"}
          </h1>
          <p className="text-muted-foreground">
            {language === "th"
              ? "คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
              : "You do not have permission to access this page"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {language === "th" ? "จัดการผู้ใช้" : "User Management"}
          </h1>
          <p className="text-muted-foreground">
            {language === "th"
              ? "สร้างบัญชีผู้ใช้ใหม่และรีเซ็ตรหัสผ่าน"
              : "Create new user accounts and reset passwords"}
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {getRoleText(user?.role || "visitor")}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* User Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>
                {language === "th" ? "จัดการผู้ใช้ระบบ" : "System Users"}
              </span>
            </CardTitle>
            <CardDescription>
              {language === "th"
                ? "สร้าง แก้ไข และลบบัญชีผู้ใช้ในระบบ"
                : "Create, edit, and delete system user accounts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserManagementDialog>
              <Button className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                {language === "th"
                  ? "เปิดการจัดการผู้ใช้"
                  : "Open User Management"}
              </Button>
            </UserManagementDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
