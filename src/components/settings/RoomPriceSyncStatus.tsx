/**
 * Component to display room price sync status
 */

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  checkRoomPriceSync,
  syncRoomPricesWithNotification,
} from "@/utils/syncRoomPrices";
import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

interface SyncStatus {
  isSynced: boolean;
  systemRate: number;
  mismatchedRooms: Array<{
    id: string;
    room_number: string;
    current_price: number;
  }>;
}

export function RoomPriceSyncStatus() {
  const { t } = useLanguage();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const checkSyncStatus = async () => {
    setLoading(true);
    try {
      const status = await checkRoomPriceSync();
      setSyncStatus(status);
    } catch (error) {
      console.error("Error checking sync status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncRoomPricesWithNotification();
      // Refresh status after sync
      await checkSyncStatus();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  if (!syncStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            สถานะการซิงค์ราคาห้อง
          </CardTitle>
          <CardDescription>
            กำลังตรวจสอบสถานะการซิงค์ราคาห้อง...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          สถานะการซิงค์ราคาห้อง
        </CardTitle>
        <CardDescription>ตรวจสอบความสอดคล้องของราคาห้องกับระบบ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {syncStatus.isSynced ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700 dark:text-green-400">
                  ราคาห้องซิงค์แล้ว
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-yellow-700 dark:text-yellow-400">
                  ราคาห้องไม่ซิงค์
                </span>
              </>
            )}
          </div>
          <Badge variant={syncStatus.isSynced ? "default" : "destructive"}>
            {syncStatus.isSynced
              ? "OK"
              : `${syncStatus.mismatchedRooms.length} ห้อง`}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            ราคาจากระบบ:{" "}
            <strong>{syncStatus.systemRate.toLocaleString()} บาท</strong>
          </p>
        </div>

        {!syncStatus.isSynced && syncStatus.mismatchedRooms.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>พบห้องที่มีราคาไม่ตรงกับระบบ:</p>
                <div className="max-h-32 overflow-y-auto">
                  {syncStatus.mismatchedRooms.map((room) => (
                    <div key={room.id} className="flex justify-between text-sm">
                      <span>ห้อง {room.room_number}</span>
                      <span className="text-muted-foreground">
                        {room.current_price.toLocaleString()} บาท
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={checkSyncStatus}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            ตรวจสอบใหม่
          </Button>
          {!syncStatus.isSynced && (
            <Button onClick={handleSync} disabled={syncing} size="sm">
              <RefreshCw
                className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />
              ซิงค์ราคาห้อง
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

