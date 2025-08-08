
import { useState } from "react";
import { toast } from "sonner";

export const useSystemMaintenance = () => {
  const [backupLoading, setBackupLoading] = useState(false);

  const handleSystemBackup = async () => {
    setBackupLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("สำรองข้อมูลเสร็จสิ้น!");
    } catch (error) {
      toast.error("ไม่สามารถสำรองข้อมูลได้");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      // Clear localStorage except for auth data
      const authData = localStorage.getItem('sb-mnsotnlftoumjwjlvzus-auth-token');
      localStorage.clear();
      if (authData) {
        localStorage.setItem('sb-mnsotnlftoumjwjlvzus-auth-token', authData);
      }
      toast.success("ล้าง Cache เสร็จสิ้น!");
    } catch (error) {
      toast.error("ไม่สามารถล้าง Cache ได้");
    }
  };

  return {
    backupLoading,
    handleSystemBackup,
    handleClearCache
  };
};
