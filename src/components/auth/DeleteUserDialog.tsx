import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/providers/LanguageProvider";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName?: string;
  userRole?: string;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  userRole,
}: DeleteUserDialogProps) {
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>
              {language === "th"
                ? "ยืนยันการลบผู้ใช้"
                : "Confirm User Deletion"}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === "th" ? (
              <>
                คุณต้องการลบผู้ใช้ <strong>{userName || "ไม่ทราบชื่อ"}</strong>
                (บทบาท: {getRoleText(userRole || "unknown")}) ออกจากระบบหรือไม่?
                <br />
                <span className="text-red-600 font-medium">
                  การดำเนินการนี้ไม่สามารถยกเลิกได้
                </span>
              </>
            ) : (
              <>
                Are you sure you want to delete user{" "}
                <strong>{userName || "Unknown"}</strong>
                (Role: {getRoleText(userRole || "unknown")}) from the system?
                <br />
                <span className="text-red-600 font-medium">
                  This action cannot be undone
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {language === "th" ? "ยกเลิก" : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {language === "th" ? "ลบผู้ใช้" : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
