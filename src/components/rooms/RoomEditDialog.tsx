import { useState } from "react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/providers/LanguageProvider";
import { useSystemSettings } from "@/hooks/useSystemSettings";

type Room = {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
  price: number;
  capacity: number;
  floor: number;
};

interface RoomEditDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomUpdated: (updatedRoom: Room) => void;
}

export default function RoomEditDialog({
  room,
  open,
  onOpenChange,
  onRoomUpdated,
}: RoomEditDialogProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { settings } = useSystemSettings();
  const [editRoom, setEditRoom] = useState<Room>({ ...room, capacity: 2 });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // บังคับความจุเป็น 2 ทุกครั้งที่เปิดหน้าต่างแก้ไขหรือเมื่อห้องเปลี่ยน
  // ป้องกันค่าคงค้างจากห้องก่อนหน้า
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    setEditRoom((prev) => ({ ...prev, capacity: 2 }));
  }, [open, room.id]);

  const handleUpdateRoom = async () => {
    try {
      setLoading(true);

      // ตรวจสอบว่ามีการเปลี่ยนหมายเลขห้องหรือไม่
      const isRoomNumberChanged = editRoom.room_number !== room.room_number;

      if (isRoomNumberChanged) {
        // อัปเดต foreign key ในตาราง repairs ก่อน
        const { error: repairsError } = await supabase
          .from("repairs")
          .update({ room_number: editRoom.room_number })
          .eq("room_number", room.room_number);

        if (repairsError) {
          console.error("Error updating repairs table:", repairsError);
          toast({
            title: "Error",
            description: "Failed to update related records. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // อัปเดต foreign key ในตาราง occupancy (ใช้ room_id)
        const { error: occupancyError } = await supabase
          .from("occupancy")
          .update({ room_id: room.id })
          .eq("room_id", room.id);

        if (occupancyError) {
          console.error("Error updating occupancy table:", occupancyError);
          toast({
            title: "Error",
            description: "Failed to update related records. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // สร้างข้อมูลที่จะ update โดยใช้ข้อมูลเดิมจาก room สำหรับ fields ที่แก้ไขไม่ได้
      const updateData = {
        room_number: editRoom.room_number,
        room_type: room.room_type, // ใช้ข้อมูลเดิม
        status: room.status, // ใช้ข้อมูลเดิม
        price: settings.depositRate || 0, // ใช้ค่าจากการตั้งค่า
        capacity: room.capacity, // ใช้ข้อมูลเดิม
        floor: editRoom.floor,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("rooms")
        .update(updateData)
        .eq("id", room.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating room:", error);
        toast({
          title: "Error",
          description: "Failed to update room. Please try again.",
          variant: "destructive",
        });
        return;
      }

      onRoomUpdated(data);
      onOpenChange(false);

      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["occupancy"] });
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      toast({
        title: "Room Updated",
        description: `Room ${editRoom.room_number} has been updated successfully.`,
      });
    } catch (err) {
      console.error("Error in handleUpdateRoom:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the room.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("rooms.edit")} {room.room_number}
          </DialogTitle>
          <DialogDescription>
            {t("rooms.edit_description") ||
              "Update the room information below."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-foreground">
          <div>
            <label
              htmlFor="edit-roomNumber"
              className="block mb-1 font-medium text-foreground"
            >
              {t("rooms.number")}
            </label>
            <Input
              id="edit-roomNumber"
              type="text"
              placeholder={t("rooms.number")}
              value={editRoom.room_number}
              onChange={(e) =>
                setEditRoom({
                  ...editRoom,
                  room_number: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>

          <div>
            <label
              htmlFor="edit-floor"
              className="block mb-1 font-medium text-foreground"
            >
              {t("rooms.floor")}
            </label>
            <Input
              id="edit-floor"
              type="number"
              placeholder={t("rooms.floor")}
              min={1}
              max={4}
              value={editRoom.floor}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val < 1) val = 1;
                else if (val > 4) val = 4;
                setEditRoom({ ...editRoom, floor: val });
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleUpdateRoom} disabled={loading}>
            {loading
              ? t("rooms.updating") || "Updating..."
              : t("rooms.update") || "Update Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
