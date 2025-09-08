import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import ViewContractDialog from "../tenants/ViewContractDialog";
import { useLanguage } from "@/providers/LanguageProvider";

export function ProfileSettingsCard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user?.tenant) {
      setFormData({
        firstName: user.tenant.first_name || "",
        lastName: user.tenant.last_name || "",
        phone: user.tenant.phone || "",
        address: user.tenant.address || "",
        email: user.tenant.email || user.email || "",
      });
    } else if (user?.staff) {
      setFormData({
        firstName: user.staff.first_name || "",
        lastName: user.staff.last_name || "",
        phone: user.staff.phone || "",
        address: user.staff.address || "",
        email: user.staff.email || user.email || "",
      });
    } else if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("กรุณากรอกชื่อและนามสกุล");
      return;
    }

    setLoading(true);
    try {
      if (user.tenant?.id) {
        // Update existing tenant record
        const { error } = await supabase
          .from("tenants")
          .update({
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            email: formData.email.trim(),
            updated_at: new Date().toISOString(),
            room_id: user.tenant.room_id || "",
            room_number: user.tenant.room_number || "",
            residents: user.tenant.residents || "1",
            image: user.tenant.image || "",
            action: user.tenant.action || "1",
          })
          .eq("id", user.tenant.id);

        if (error) {
          console.error("Error updating tenant profile:", error);
          toast.error("ไม่สามารถบันทึกโปรไฟล์ได้");
          return;
        }
      } else if (user.staff?.id) {
        // Update existing staff record
        const { error } = await supabase
          .from("staffs")
          .update({
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            email: formData.email.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.staff.id);

        if (error) {
          console.error("Error updating staff profile:", error);
          toast.error("ไม่สามารถบันทึกโปรไฟล์ได้");
          return;
        }
      } else if (user.role === "tenant") {
        // Create new tenant record
        const { error } = await supabase.from("tenants").insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          email: formData.email.trim(),
          auth_email: user.email,
          room_id: "", // Will be updated when assigned to a room
          room_number: "",
          residents: "1",
          image: "",
          action: "1",
        });

        if (error) {
          console.error("Error creating tenant profile:", error);
          toast.error("ไม่สามารถสร้างโปรไฟล์ได้");
          return;
        }

        // Link the new tenant to the profile
        const { data: newTenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("auth_email", user.email)
          .single();

        if (newTenant) {
          await supabase
            .from("profiles")
            .update({
              tenant_id: newTenant.id,
              staff_id: null, // Clear staff_id when setting tenant_id
            })
            .eq("id", user.id);
        }
      } else if (user.role === "staff") {
        // Create new staff record
        const { error } = await supabase.from("staffs").insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          email: formData.email.trim(),
          status: "1",
        });

        if (error) {
          console.error("Error creating staff profile:", error);
          toast.error("ไม่สามารถสร้างโปรไฟล์ได้");
          return;
        }

        // Link the new staff to the profile
        const { data: newStaff } = await supabase
          .from("staffs")
          .select("id")
          .eq("email", user.email)
          .single();

        if (newStaff) {
          await supabase
            .from("profiles")
            .update({
              staff_id: newStaff.id,
              tenant_id: null, // Clear tenant_id when setting staff_id
            })
            .eq("id", user.id);
        }
      } else {
        toast.info("การแก้ไขโปรไฟล์รองรับเฉพาะผู้เช่าและพนักงานเท่านั้น");
        return;
      }

      toast.success("บันทึกโปรไฟล์สำเร็จ!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // แสดง UI ต่างกันตาม role
  if (user?.role === "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{t("profile.title")}</span>
          </CardTitle>
          <CardDescription>{t("profile.manage")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
              />
              <AvatarFallback>
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1">
                {t("profile.admin")}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {t("profile.adminOnlyView")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (user?.role === "staff") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{t("profile.title")}</span>
          </CardTitle>
          <CardDescription>{t("profile.manage")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
              />
              <AvatarFallback>
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-medium">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{t("profile.staff")}</Badge>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  {t("profile.firstName")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder={t("profile.enterFirstName")}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  {t("profile.lastName")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder={t("profile.enterLastName")}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="email"
                className="flex items-center space-x-1 text-sm font-medium "
              >
                <Mail className="h-4 w-4" />
                <span>{t("profile.email")}</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@email.com"
                className="mt-1"
                readOnly
              />
            </div>

            <div>
              <Label
                htmlFor="phone"
                className="flex items-center space-x-1 text-sm font-medium"
              >
                <Phone className="h-4 w-4" />
                <span>{t("profile.phone")}</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder={t("profile.enterPhone")}
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="address"
                className="flex items-center space-x-1 text-sm font-medium"
              >
                <MapPin className="h-4 w-4" />
                <span>{t("profile.address")}</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={t("profile.enterAddress")}
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t flex flex-col md:flex-row md:items-center md:space-x-4">
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="w-full md:w-auto mb-3 md:mb-0"
              size="lg"
            >
              {loading ? t("profile.saving") : t("profile.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{t("profile.title")}</span>
        </CardTitle>
        <CardDescription>{t("profile.manageContact")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
            />
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-medium">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{t("profile.tenant")}</Badge>
              {user?.tenant?.room_number && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>
                    {t("profile.room")} {user.tenant.room_number}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium">
                {t("profile.firstName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder={t("profile.enterFirstName")}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium">
                {t("profile.lastName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder={t("profile.enterLastName")}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="email"
              className="flex items-center space-x-1 text-sm font-medium "
            >
              <Mail className="h-4 w-4" />
              <span>{t("profile.email")}</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="example@email.com"
              className="mt-1"
              readOnly
            />
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="flex items-center space-x-1 text-sm font-medium"
            >
              <Phone className="h-4 w-4" />
              <span>{t("profile.phone")}</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder={t("profile.enterPhone")}
              className="mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="address"
              className="flex items-center space-x-1 text-sm font-medium"
            >
              <MapPin className="h-4 w-4" />
              <span>{t("profile.address")}</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={t("profile.enterAddress")}
              className="mt-1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t flex flex-col md:flex-row md:items-center md:space-x-4">
          <Button
            variant="outline"
            onClick={() => setContractDialogOpen(true)}
            className="w-full md:w-auto"
            size="lg"
          >
            {t("profile.openContract")}
          </Button>

          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full md:w-auto mb-3 md:mb-0"
            size="lg"
          >
            {loading ? t("profile.saving") : t("profile.save")}
          </Button>
        </div>

        <ViewContractDialog
          open={contractDialogOpen}
          onOpenChange={setContractDialogOpen}
          tenantId={user?.tenant?.id || null}
        />
      </CardContent>
    </Card>
  );
}
