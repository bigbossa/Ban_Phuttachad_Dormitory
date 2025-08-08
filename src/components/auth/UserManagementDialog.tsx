
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCreateDialog } from "./UserCreateDialog";
import { PasswordResetDialog } from "./PasswordResetDialog";
import { UserPlus, KeyRound } from "lucide-react";

interface UserManagementDialogProps {
  children: React.ReactNode;
}

export const UserManagementDialog = ({ children }: UserManagementDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>จัดการผู้ใช้ระบบ</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* <Button
              onClick={() => {
                setIsOpen(false);
                setCreateUserOpen(true);
              }}
              className="w-full"
              variant="outline"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              สร้างบัญชีผู้ใช้ใหม่
            </Button> */}
            
            <Button
              onClick={() => {
                setIsOpen(false);
                setResetPasswordOpen(true);
              }}
              className="w-full"
              variant="outline"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              รีเซ็ตรหัสผ่าน
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UserCreateDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onSuccess={() => {
          // Refresh data if needed
        }}
      />

      <PasswordResetDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
      />
    </>
  );
};
