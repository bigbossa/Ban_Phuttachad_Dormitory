
import { Link, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 flex space-x-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground">
            {t("app.title")}
          </h1>
          <Link
            to="/"
            className="text-primary hover:underline text-sm mt-2 inline-block"
          >
            &larr; กลับสู่หน้าหลัก
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ระบบจัดการหอพัก</CardTitle>
            <CardDescription>
              เข้าสู่ระบบด้วยบัญชีที่ผู้ดูแลระบบสร้างให้
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
