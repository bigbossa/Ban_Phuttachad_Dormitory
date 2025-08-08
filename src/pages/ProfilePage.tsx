
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const getRoleText = (role: string) => {
    if (language === 'th') {
      switch (role) {
        case 'admin': return 'ผู้ดูแลระบบ';
        case 'staff': return 'พนักงาน';
        case 'tenant': return 'ผู้เช่า';
        default: return 'ผู้เยี่ยมชม';
      }
    } else {
      switch (role) {
        case 'admin': return 'Administrator';
        case 'staff': return 'Staff';
        case 'tenant': return 'Tenant';
        default: return 'Visitor';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCircle className="h-8 w-8" />
            {language === 'th' ? 'โปรไฟล์ส่วนตัว' : 'Profile'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'th' 
              ? 'จัดการข้อมูลส่วนตัวและการตั้งค่าของคุณ'
              : 'Manage your personal information and settings'
            }
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {getRoleText(user?.role || 'visitor')}
        </Badge>
      </div>

      <div className="max-w-2xl">
        <ProfileSettingsCard />
      </div>
    </div>
  );
}
