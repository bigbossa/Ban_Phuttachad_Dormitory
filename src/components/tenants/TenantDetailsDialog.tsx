import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Home,
  Building,
  Users,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/providers/LanguageProvider";

// Types

type Tenant = Database["public"]["Tables"]["tenants"]["Row"] & {
  current_room?: {
    id: string;
    room_number: string;
    room_type: string;
    floor: number;
  } | null;
};

interface TenantDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
}

export default function TenantDetailsDialog({
  open,
  onOpenChange,
  tenant,
}: TenantDetailsDialogProps) {
  const [roomTenants, setRoomTenants] = useState<Tenant[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchRoomTenants() {
      if (!tenant?.room_id) return;

      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("room_id", tenant.room_id)
        .eq("action", "1")
        .ilike("residents", "%ลูกเช่า%")
        .neq("id", tenant.id); // Exclude the current tenant

      if (!error && data) {
        setRoomTenants(data);
      }
    }

    if (open && tenant) {
      fetchRoomTenants();
    }
  }, [open, tenant]);

  if (!tenant) return null;

  const fullName = `${tenant.first_name} ${tenant.last_name}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("tenants.tenantInfo")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                alt={fullName}
              />
              <AvatarFallback>
                {tenant.first_name.charAt(0)}{tenant.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <Badge variant="secondary">{tenant.residents || t("tenants.main")}</Badge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {tenant.current_room && (
              <div className="flex items-center space-x-3">
                <Home className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("tenants.room")}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{t("tenants.room")} {tenant.current_room.room_number}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {tenant.current_room.room_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {t("tenants.floor")} {tenant.current_room.floor}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {tenant.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("profile.email")}</p>
                  <p className="text-sm text-muted-foreground">{tenant.email}</p>
                </div>
              </div>
            )}

            {tenant.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("profile.phone")}</p>
                  <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                </div>
              </div>
            )}

            {tenant.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("tenants.address")}</p>
                  <p className="text-sm text-muted-foreground">{tenant.address}</p>
                </div>
              </div>
            )}

            {tenant.emergency_contact && (
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("tenants.emergencyContact")}</p>
                  <p className="text-sm text-muted-foreground">{tenant.emergency_contact}</p>
                </div>
              </div>
            )}
          </div>

          {/* Roommates */}
          {roomTenants.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" /> {t("tenants.roommates")}
              </h4>

              <div className="space-y-6">
                {roomTenants.map((roommate) => {
                  const fullName = `${roommate.first_name} ${roommate.last_name}`;
                  return (
                    <div key={roommate.id}>
                      {/* Main Info */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                            alt={fullName}
                          />
                          <AvatarFallback>
                            {roommate.first_name.charAt(0)}
                            {roommate.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{fullName}</h3>
                          <Badge variant="secondary">{roommate.residents || t("tenants.child")}</Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-4 mt-4">
                        {roommate.current_room && (
                          <div className="flex items-center space-x-3">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t("tenants.room")}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{t("tenants.room")} {roommate.current_room.room_number}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {roommate.current_room.room_type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Building className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {t("tenants.floor")} {roommate.current_room.floor}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {roommate.email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t("profile.email")}</p>
                              <p className="text-sm text-muted-foreground">{roommate.email}</p>
                            </div>
                          </div>
                        )}

                        {roommate.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t("profile.phone")}</p>
                              <p className="text-sm text-muted-foreground">{roommate.phone}</p>
                            </div>
                          </div>
                        )}

                        {roommate.address && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t("tenants.address")}</p>
                              <p className="text-sm text-muted-foreground">{roommate.address}</p>
                            </div>
                          </div>
                        )}

                        {roommate.emergency_contact && (
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{t("tenants.emergencyContact")}</p>
                              <p className="text-sm text-muted-foreground">{roommate.emergency_contact}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-4">
            <p>
              {t("tenants.checkIn")}: {new Date(tenant.created_at!).toLocaleDateString(t("language.th") === "ไทย" ? "th-TH" : "en-US")}
            </p>
            {tenant.updated_at && (
              <p>
                {t("tenants.lastUpdated")}: {new Date(tenant.updated_at).toLocaleDateString(t("language.th") === "ไทย" ? "th-TH" : "en-US")}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
