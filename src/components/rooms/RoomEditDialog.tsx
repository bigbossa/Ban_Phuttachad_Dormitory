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
          <DialogTitle>Edit Room {room.room_number}</DialogTitle>
          <DialogDescription>Update the room information below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-roomNumber">Room Number</Label>
            <Input
              id="edit-roomNumber"
              value={editRoom.room_number}
              onChange={(e) =>
                setEditRoom({ ...editRoom, room_number: e.target.value })
              }
              placeholder="101"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-type">Room Type</Label>
            <Select
              value={editRoom.room_type}
              onValueChange={(value) => {
                const capacity = value === "Standard Single" ? 1 : 2;
                setEditRoom({ ...editRoom, room_type: value, capacity });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard Single">Standard Single</SelectItem>
                <SelectItem value="Standard Double">Standard Double</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={editRoom.status}
              onValueChange={(value) =>
                setEditRoom({ ...editRoom, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="edit-price">Price (THB)</Label>
            <Input
              id="edit-price"
              type="number"
              value={editRoom.price}
              onChange={(e) =>
                setEditRoom({ ...editRoom, price: Number(e.target.value) })
              }
              placeholder="3500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-capacity">Capacity</Label>
            <Input
              id="edit-capacity"
              type="number"
              value={editRoom.capacity}
              disabled
              placeholder="Auto-set by room type"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-floor">Floor</Label>
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
              placeholder="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRoom} disabled={loading}>
            {loading ? "Updating..." : "Update Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
