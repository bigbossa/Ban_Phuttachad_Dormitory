
import { useState } from "react";
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

type Tenant = Database['public']['Tables']['tenants']['Row'];

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

  const { data: availableRooms = [] } = useQuery({
    queryKey: ['available-rooms-with-capacity'],
    queryFn: async () => {
      // Get all rooms with their current occupancy count
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (roomsError) throw roomsError;

      // Get current occupancy for each room
      const roomsWithOccupancy: RoomWithOccupancy[] = await Promise.all(
        rooms.map(async (room) => {
          const { data: occupancyData } = await supabase
            .from('occupancy')
            .select('tenant_id')
            .eq('room_id', room.id)
            .eq('is_current', true);

          const current_occupants = occupancyData?.length || 0;

          return {
            ...room,
            current_occupants
          };
        })
      );

      // Filter rooms that have space (current occupants < capacity) or are vacant
      return roomsWithOccupancy.filter(room => 
        room.status === 'vacant' || room.current_occupants < room.capacity
      );
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
          <DialogTitle>กำหนดห้องให้ผู้เช่า</DialogTitle>
         <DialogDescription>
            เลือกห้องสำหรับ {tenant.first_name} {tenant.last_name}
            {tenant.room_number && (
              <p className="text-sm text-muted-foreground mt-1">
                ห้องปัจจุบัน: <span className="font-medium">ห้อง {tenant.room_number}</span>
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="room" className="text-sm font-medium">
              เลือกห้อง (แสดงเฉพาะห้องที่มีที่ว่าง)
            </label>
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกห้องที่มีที่ว่าง" />
              </SelectTrigger>
              <SelectContent>
            {availableRooms
              .filter((room) => room.id !== tenant.room_id) 
              .map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>
                      ห้อง {room.room_number} - {room.room_type} (ชั้น {room.floor})
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant={room.current_occupants === 0 ? "secondary" : "outline"}>
                        {room.current_occupants}/{room.capacity} คน
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {room.price.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
            </Select>
            {availableRooms.length === 0 && (
              <p className="text-sm text-muted-foreground">
                ไม่มีห้องที่มีที่ว่างในขณะนี้
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedRoomId || isLoading}
          >
            {isLoading ? "กำลังบันทึก..." : "กำหนดห้อง"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
