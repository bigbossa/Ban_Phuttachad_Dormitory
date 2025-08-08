import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/providers/LanguageProvider";

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
  const [editRoom, setEditRoom] = useState<Room>(room);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleUpdateRoom = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .update({
          room_number: editRoom.room_number,
          room_type: editRoom.room_type,
          status: editRoom.status,
          price: editRoom.price,
          capacity: editRoom.capacity,
          floor: editRoom.floor,
          updated_at: new Date().toISOString(),
        })
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
            {t("rooms.edit_description") || "Update the room information below."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-roomNumber">{t("rooms.number")}</Label>
            <Input
              id="edit-roomNumber"
              value={editRoom.room_number}
              onChange={(e) =>
                setEditRoom({ ...editRoom, room_number: e.target.value })
              }
              placeholder={t("rooms.number")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-type">{t("rooms.type")}</Label>
            <Select
              value={editRoom.room_type}
              onValueChange={(value) => {
                const capacity =
                  value === t("Standard.Single") ? 1 :
                  value === t("Standard.Double") ? 2 : 0;
                setEditRoom({ ...editRoom, room_type: value, capacity });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("rooms.type") + "..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard Single">{t("Standard.Single")}</SelectItem>
                <SelectItem value="Standard Double">{t("Standard.Double")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="edit-status">{t("rooms.status")}</Label>
            <Select
              value={editRoom.status}
              onValueChange={(value) =>
                setEditRoom({ ...editRoom, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("rooms.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant">{t("satatus.vacant")}</SelectItem>
                <SelectItem value="occupied">{t("satatus.occupied")}</SelectItem>
                <SelectItem value="maintenance">{t("satatus.maintenance")}</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="edit-price">{t("rooms.rent")}</Label>
            <Input
              id="edit-price"
              type="number"
              value={editRoom.price}
              onChange={(e) =>
                setEditRoom({ ...editRoom, price: Number(e.target.value) })
              }
              placeholder={t("rooms.rent")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-capacity">{t("rooms.capacity")}</Label>
            <Input
              id="edit-capacity"
              type="number"
              value={editRoom.capacity}
              disabled
              placeholder={t("rooms.capacity")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-floor">{t("rooms.floor")}</Label>
            <Input
              id="edit-floor"
              type="number"
              value={editRoom.floor}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val < 1) val = 1;
                else if (val > 4) val = 4;
                setEditRoom({ ...editRoom, floor: val });
              }}
              placeholder={t("rooms.floor")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleUpdateRoom} disabled={loading}>
            {loading ? t("rooms.updating") || "Updating..." : t("rooms.update") || "Update Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
