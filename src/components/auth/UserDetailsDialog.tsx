import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/providers/LanguageProvider";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Users,
  Building,
  MapPin,
  Clock,
  Database,
} from "lucide-react";

interface SupabaseUser {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  source_table: string;
}

interface UserDetailsDialogProps {
  user: SupabaseUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "staff":
        return "default";
      case "tenant":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSourceTableText = (source: string) => {
    if (language === "th") {
      switch (source) {
        case "staffs":
          return "ตารางพนักงาน";
        case "tenants":
          return "ตารางผู้เช่า";
        case "profiles":
          return "ตารางโปรไฟล์";
        default:
          return source;
      }
    } else {
      switch (source) {
        case "staffs":
          return "Staff Table";
        case "tenants":
          return "Tenants Table";
        case "profiles":
          return "Profiles Table";
        default:
          return source;
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>
              {language === "th" ? "รายละเอียดผู้ใช้" : "User Details"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {language === "th"
              ? "ข้อมูลรายละเอียดของผู้ใช้ในระบบ"
              : "Detailed information about the system user"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>
                  {language === "th" ? "ข้อมูลพื้นฐาน" : "Basic Information"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "ชื่อแสดง" : "Display Name"}
                  </label>
                  <p className="text-sm">
                    {user.display_name ||
                      (language === "th" ? "ไม่มีชื่อ" : "No name")}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "บทบาท" : "Role"}
                  </label>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleText(user.role)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>
                  {language === "th"
                    ? "ข้อมูลการติดต่อ"
                    : "Contact Information"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "อีเมล" : "Email"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {user.email ||
                        (language === "th" ? "ไม่มีอีเมล" : "No email")}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "เบอร์โทร" : "Phone"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {user.phone ||
                        (language === "th" ? "ไม่มีเบอร์โทร" : "No phone")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>
                  {language === "th" ? "ข้อมูลระบบ" : "System Information"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "User ID" : "User ID"}
                  </label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {user.id}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "แหล่งข้อมูล" : "Data Source"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {getSourceTableText(user.source_table)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{language === "th" ? "ข้อมูลเวลา" : "Timestamps"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "วันที่สร้าง" : "Created At"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {user.created_at
                        ? format(
                            new Date(user.created_at),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: language === "th" ? th : undefined,
                            }
                          )
                        : language === "th"
                        ? "ไม่ทราบวันที่"
                        : "Unknown date"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {language === "th" ? "เข้าสู่ระบบล่าสุด" : "Last Sign In"}
                  </label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {user.last_sign_in_at
                        ? format(
                            new Date(user.last_sign_in_at),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: language === "th" ? th : undefined,
                            }
                          )
                        : language === "th"
                        ? "ไม่เคยเข้าสู่ระบบ"
                        : "Never signed in"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === "th" ? "ปิด" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
