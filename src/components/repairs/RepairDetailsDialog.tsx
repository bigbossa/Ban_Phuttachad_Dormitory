import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { useLanguage } from "@/providers/LanguageProvider";

type RepairRequest = {
  id: string;
  room_id: string;
  room_number: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  reported_date: string;
  completed_date?: string | null;
  profile_id?: string;
};

interface RepairDetailsDialogProps {
  repair: RepairRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepairDetailsDialog({
  repair,
  open,
  onOpenChange,
}: RepairDetailsDialogProps) {
  const { t } = useLanguage();

  if (!repair) return null;

  return (    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("repairs.viewDetails")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">{t("repairs.roomNumber")}:</span>
            <span className="col-span-2">{repair.room_number}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">{t("repairs.status")}:</span>
            <span className="col-span-2">{t(`repairs.status.${repair.status}`)}</span>
          </div>          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">{t("repairs.reportedDate")}:</span>
            <span className="col-span-2">{format(parseISO(repair.reported_date), "PPP")}</span>
          </div>
          {repair.completed_date && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium">{t("repairs.completedDate")}:</span>
              <span className="col-span-2">{format(parseISO(repair.completed_date), "PPP")}</span>
            </div>
          )}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium">{t("repairs.description")}:</span>
            <span className="col-span-2">{repair.description}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
