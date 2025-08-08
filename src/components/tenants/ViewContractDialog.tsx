import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLanguage } from "@/providers/LanguageProvider";

interface ViewContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string | null;
}

const supabaseUrl = "https://mnsotnlftoumjwjlvzus.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc290bmxmdG91bWp3amx2enVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODAxMjg1NiwiZXhwIjoyMDYzNTg4ODU2fQ.gsi0MzKR0s2kIsFFEspAuz5G75soMI8hQmcToYiiIOQ";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ViewContractDialog({
  open,
  onOpenChange,
  tenantId,
}: ViewContractDialogProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!tenantId) {
      setFileUrl(null);
      setLoading(false);
      return;
    }

    async function fetchFileUrl() {
      setLoading(true);
      try {
        // ✅ ดึงลิงก์ public URL ที่บันทึกไว้ใน field `image`
        const { data, error } = await supabase
          .from("tenants")
          .select("image")
          .eq("id", tenantId)
          .single();

        if (error || !data?.image) {
          console.error("ไม่พบลิงก์ไฟล์ใน field image:", error);
          setFileUrl(null);
          return;
        }

        setFileUrl(data.image);
      } catch (err) {
        console.error("fetchFileUrl error:", err);
        setFileUrl(null);
      } finally {
        setLoading(false);
      }
    }

    fetchFileUrl();
  }, [tenantId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("tenants.viewContractFile")}</DialogTitle>
          <DialogDescription>{t("tenants.showContractFileDesc")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground">{t("tenants.loadingFile")}</p>
        ) : fileUrl ? (
          fileUrl.endsWith(".pdf") ? (
            <iframe
              src={fileUrl}
              title={t("tenants.pdfContractTitle")}
              className="w-full h-[600px] rounded border"
            />
          ) : (
            <img
              src={fileUrl}
              alt={t("tenants.contractImageAlt")}
              className="w-full max-h-[600px] object-contain rounded border"
            />
          )
        ) : (
          <p className="text-center text-muted-foreground">{t("tenants.fileNotFound")}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
