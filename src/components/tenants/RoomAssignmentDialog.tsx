import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useSystemSettings } from "@/hooks/useSystemSettings";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];

interface RoomAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onAssignRoom: (tenantId: string, roomId: string) => void;
  isLoading?: boolean;
}

type RoomWithOccupancy = {
  id: string;
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  status: string;
  price: number;
  current_occupants: number;
};

export default function RoomAssignmentDialog({
  open,
  onOpenChange,
  tenant,
  onAssignRoom,
  isLoading = false,
}: RoomAssignmentDialogProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const { t } = useLanguage();
  const { settings } = useSystemSettings();

  const { data: availableRooms = [] } = useQuery({
    queryKey: ["available-rooms-with-capacity"],
    queryFn: async () => {
      // Get all rooms with their current occupancy count
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");

      if (roomsError) throw roomsError;

      // Get current occupancy for each room
      const roomsWithOccupancy: RoomWithOccupancy[] = await Promise.all(
        rooms.map(async (room) => {
          const { data: occupancyData } = await supabase
            .from("occupancy")
            .select("tenant_id")
            .eq("room_id", room.id)
            .eq("is_current", true);

          const current_occupants = occupancyData?.length || 0;

          return {
            ...room,
            current_occupants,
          };
        })
      );

      // Filter rooms to only empty, non-maintenance rooms
      return roomsWithOccupancy.filter((room) => {
        const isMaintenance = room.status === "maintenance";
        const isEmpty = (room.current_occupants || 0) === 0;
        return !isMaintenance && isEmpty;
      });
    },
    enabled: open,
  });

  const handleAssign = () => {
    if (tenant && selectedRoomId) {
      onAssignRoom(tenant.id, selectedRoomId);
      setSelectedRoomId("");
      onOpenChange(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("tenants.assignRoom")}</DialogTitle>
          <DialogDescription>
            {t("tenants.selectRoomFor")} {tenant.first_name} {tenant.last_name}
            {tenant.room_number && (
              <p className="text-sm text-muted-foreground mt-1">
                {t("tenants.currentRoom")}{" "}
                <span className="font-medium">
                  {t("tenants.room")} {tenant.room_number}
                </span>
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="room" className="text-sm font-medium">
              {t("tenants.selectRoomLabel")}
            </label>
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger>
                <SelectValue placeholder={t("tenants.selectRoomPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {availableRooms
                  .filter((room) => room.id !== tenant.room_id)
                  .map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {t("tenants.room")} {room.room_number} (
                          {t("tenants.floor")} {room.floor})
                        </span> 
                        <div className="flex items-center gap-2 ml-2 hidden">
                          <Badge
                            variant={
                              room.current_occupants === 0
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {room.current_occupants}/
                            {Math.max(room.capacity ?? 2, 2)}{" "}
                            {t("tenants.people")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {(settings.depositRate || 0).toLocaleString()}{" "}
                            {t("tenants.baht")}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {availableRooms.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("tenants.noAvailableRooms")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("tenants.cancel")}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedRoomId || isLoading}
          >
            {isLoading ? t("tenants.saving") : t("tenants.assign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
