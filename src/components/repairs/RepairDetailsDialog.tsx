import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { useLanguage } from "@/providers/LanguageProvider";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  if (!repair) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔧 {t("repairs.viewDetails")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* ข้อมูลห้อง */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border">
            <div className="text-sm font-medium text-orange-800 mb-2">
              ข้อมูลห้อง
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium">{t("repairs.roomNumber")}:</span>
              <span className="col-span-2">
                <span className="font-semibold text-lg bg-orange-100 px-2 py-1 rounded border text-orange-800">
                  ห้อง {repair.room_number}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium hidden">Room ID:</span>
              <span className="col-span-2 hidden">
                <span className="font-mono text-sm bg-purple-100 px-2 py-1 rounded border text-purple-800 ">
                  {repair.room_id}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium hidden">ประเภท:</span>
              <span className="col-span-2 text-sm text-muted-foreground hidden">
                การแจ้งซ่อม
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium hidden">ระบบ:</span>
              <span className="col-span-2 text-sm text-muted-foreground hidden">
                ระบบจัดการหอพัก
              </span>
            </div>
          </div>
          {/* สถานะการแจ้งซ่อม */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border">
            <div className="text-sm font-medium text-blue-800 mb-2">
              สถานะการแจ้งซ่อม
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium">{t("repairs.status")}:</span>
              <span className="col-span-2">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    repair.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : repair.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : repair.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : repair.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {t(`repairs.status.${repair.status}`)}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">อัปเดตล่าสุด:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                {repair.completed_date
                  ? format(
                      parseISO(repair.completed_date),
                      "yyyy-MM-dd"
                    )
                  : format(
                      parseISO(repair.reported_date),
                      "yyyy-MM-dd"
                    )}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium hidden">ลำดับ:</span>
              <span className="col-span-2 text-sm text-muted-foreground hidden">
                {repair.status === "pending"
                  ? "1"
                  : repair.status === "in_progress"
                  ? "2"
                  : repair.status === "completed"
                  ? "3"
                  : repair.status === "cancelled"
                  ? "4"
                  : "0"}
              </span>
            </div>
          </div>{" "}
          {/* วันที่แจ้งซ่อม */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border">
            <div className="text-sm font-medium text-green-800 mb-2">
              วันที่แจ้งซ่อม
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium">{t("repairs.reportedDate")}:</span>
              <span className="col-span-2 ">
                <span className="text-sm font-medium">
                  {format(parseISO(repair.reported_date), "PPP")}
                </span>
                <br />
                <span className="text-xs text-muted-foreground hidden">
                  {format(parseISO(repair.reported_date), "yyyy-MM-dd HH:mm")}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">ระยะเวลา:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                {repair.completed_date
                  ? `${Math.ceil(
                      (new Date(repair.completed_date).getTime() -
                        new Date(repair.reported_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} วัน`
                  : `${Math.ceil(
                      (new Date().getTime() -
                        new Date(repair.reported_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} วัน`}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">วันในสัปดาห์:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                {format(parseISO(repair.reported_date), "EEEE")}
              </span>
            </div>
          </div>
          {/* วันที่เสร็จสิ้น (ถ้ามี) */}
          {repair.completed_date && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border">
              <div className="text-sm font-medium text-emerald-800 mb-2">
                วันที่เสร็จสิ้น
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-medium">
                  {t("repairs.completedDate")}:
                </span>
                <span className="col-span-2">
                  <span className="text-sm font-medium">
                    {format(parseISO(repair.completed_date), "PPP")}
                  </span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {format(
                      parseISO(repair.completed_date),
                      "yyyy-MM-dd HH:mm"
                    )}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 mt-2">
                <span className="font-medium">สถานะ:</span>
                <span className="col-span-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    ✅ เสร็จสิ้นแล้ว
                  </span>
                </span>
              </div>
            </div>
          )}
          {/* รายละเอียดการแจ้งซ่อม */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg border">
            <div className="text-sm font-medium text-gray-800 mb-2">
              รายละเอียดการแจ้งซ่อม
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium">{t("repairs.description")}:</span>
              <span className="col-span-2">
                <div className="p-3 bg-white rounded border text-sm shadow-sm">
                  {repair.description}
                </div>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">ความยาว:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                {repair.description.length} ตัวอักษร
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2 hidden">
              <span className="font-medium">ประเภท:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                {repair.description.includes("ไฟฟ้า")
                  ? "ไฟฟ้า"
                  : repair.description.includes("น้ำ")
                  ? "น้ำ"
                  : repair.description.includes("ประตู")
                  ? "ประตู/หน้าต่าง"
                  : repair.description.includes("แอร์")
                  ? "เครื่องปรับอากาศ"
                  : "ทั่วไป"}
              </span>
            </div>
          </div>
          {/* ข้อมูลระบบ */}
          <div className="bg-gradient-to-r from-slate-50 to-zinc-50 p-3 rounded-lg border hidden">
            <div className="text-sm font-medium text-slate-800 mb-2">
              ข้อมูลระบบ
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium">Profile ID:</span>
              <span className="col-span-2">
                <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded border text-blue-800">
                  {repair.profile_id || "ไม่ระบุ"}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">Repair ID:</span>
              <span className="col-span-2">
                <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded border text-green-800">
                  {repair.id}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">สร้างเมื่อ:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                {format(parseISO(repair.reported_date), "yyyy-MM-dd HH:mm:ss")}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">ประเภท:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                การแจ้งซ่อม
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 mt-2">
              <span className="font-medium">เวอร์ชัน:</span>
              <span className="col-span-2 text-sm text-muted-foreground">
                1.0.0
              </span>
            </div>
          </div>
          {/* ปุ่มคัดลอกข้อมูล */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border hidden">
            <div className="text-sm font-medium text-indigo-800 mb-3">
              📋 คัดลอกข้อมูล
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(repair.room_id);
                  toast({
                    title: "คัดลอก Room ID แล้ว",
                    description: `คัดลอก Room ID: ${repair.room_id}`,
                  });
                }}
                className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 shadow-sm"
              >
                📋 Room ID
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(repair.id);
                  toast({
                    title: "คัดลอก Repair ID แล้ว",
                    description: `คัดลอก Repair ID: ${repair.id}`,
                  });
                }}
                className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 shadow-sm"
              >
                📋 Repair ID
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(repair.room_number);
                  toast({
                    title: "คัดลอกหมายเลขห้องแล้ว",
                    description: `คัดลอกหมายเลขห้อง: ${repair.room_number}`,
                  });
                }}
                className="px-3 py-2 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-1 shadow-sm"
              >
                📋 หมายเลขห้อง
              </button>
              <button
                onClick={() => {
                  const repairInfo = `การแจ้งซ่อม - ห้อง ${
                    repair.room_number
                  }\nRoom ID: ${repair.room_id}\nRepair ID: ${
                    repair.id
                  }\nสถานะ: ${t(
                    `repairs.status.${repair.status}`
                  )}\nรายละเอียด: ${repair.description}`;
                  navigator.clipboard.writeText(repairInfo);
                  toast({
                    title: "คัดลอกข้อมูลทั้งหมดแล้ว",
                    description: "คัดลอกข้อมูลการแจ้งซ่อมทั้งหมด",
                  });
                }}
                className="px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1 shadow-sm"
              >
                📋 ข้อมูลทั้งหมด
              </button>
            </div>

            {/* สรุปข้อมูล */}
            <div className="mt-3 p-2 bg-white rounded border text-xs text-muted-foreground">
              <div className="font-medium mb-1">สรุปข้อมูล:</div>
              <div>
                • ห้อง: {repair.room_number} (ID: {repair.room_id})
              </div>
              <div>• การแจ้งซ่อม: {repair.id}</div>
              <div>• สถานะ: {t(`repairs.status.${repair.status}`)}</div>
              <div>
                • วันที่: {format(parseISO(repair.reported_date), "dd/MM/yyyy")}
              </div>
              <div>
                • เวลา: {format(parseISO(repair.reported_date), "HH:mm")}
              </div>
              <div>• วัน: {format(parseISO(repair.reported_date), "EEEE")}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
