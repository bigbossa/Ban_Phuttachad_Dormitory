import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, User, Briefcase, Building2, CheckCircle, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useLanguage } from "@/providers/LanguageProvider";

type Staff = Database['public']['Tables']['staffs']['Row'];

interface StaffDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
}

export default function StaffDetailsDialog({
  open,
  onOpenChange,
  staff,
}: StaffDetailsDialogProps) {
  const { t } = useLanguage();
  if (!staff) return null;

  const fullName = `${staff.first_name} ${staff.last_name}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("staff.detailTitle")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`} 
                alt={fullName} 
              />
              <AvatarFallback>
                {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <Badge variant="secondary">{t("staff.staffRole")}</Badge>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={staff.status === "1" ? "2" : "destructive"}>
                  {staff.status === "1" ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" /> {t("staff.working")}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" /> {t("staff.notWorking")}
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {staff.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("staff.email")}</p>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                </div>
              </div>
            )}
            {staff.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("staff.phone")}</p>
                  <p className="text-sm text-muted-foreground">{staff.phone}</p>
                </div>
              </div>
            )}
            {staff.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("staff.address")}</p>
                  <p className="text-sm text-muted-foreground">{staff.address}</p>
                </div>
              </div>
            )}
            {staff.role && (
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("staff.position")}</p>
                  <p className="text-sm text-muted-foreground">{staff.role}</p>
                </div>
              </div>
            )}
            {staff.department && (
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("staff.department")}</p>
                  <p className="text-sm text-muted-foreground">{staff.department}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>{t("staff.createdAt")}: {staff.created_at ? new Date(staff.created_at).toLocaleDateString('th-TH') : "-"}</p>
            {staff.updated_at && (
              <p>{t("staff.updatedAt")}: {new Date(staff.updated_at).toLocaleDateString('th-TH')}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}