import { useState, useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DoorClosed, MoreVertical, Plus, Edit, Eye, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RoomEditDialog from "@/components/rooms/RoomEditDialog";
import RoomDetailsDialog from "@/components/rooms/RoomDetailsDialog";
import TenantFormDialog from "@/components/rooms/TenantFormDialog";

import { useSystemSettings } from "@/hooks/useSystemSettings";

import type { Database } from "@/integrations/supabase/types";
type Room = Database["public"]["Tables"]["rooms"]["Row"];

export default function RoomsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // สำหรับเปิด dialog เพิ่มผู้เช่า และเก็บ room info ที่จะเพิ่มผู้เช่า
  const [tenantFormOpen, setTenantFormOpen] = useState(false);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<{ id: string; room_number: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [newRoom, setNewRoom] = useState({
    room_number: "",
    room_type: "", // เริ่มต้นเป็นค่าว่าง
    status: "vacant",
    price: 3500,
    capacity: 0, // เริ่มต้น 0 เพราะยังไม่ได้เลือก
    floor: 1,
  });

const { settings } = useSystemSettings();
  const roomRent = settings.depositRate || 0;
  const floor = settings.floor || 0;
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number", { ascending: true });

      if (error) throw error;

      setRooms(data || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch rooms.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

 const handleAddRoom = async () => {
  // ตรวจสอบข้อมูลว่ากรอกครบหรือไม่
  if (
    !newRoom.room_number ||
    !newRoom.room_type ||
    !newRoom.status ||
    newRoom.price === undefined ||
    newRoom.capacity === undefined ||
    newRoom.floor === undefined
  ) {
    toast({
      title: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
      variant: "destructive",
    });
    return; // ไม่ส่งข้อมูลถ้ายังไม่ครบ
  }

  try {
    const { data, error } = await supabase
      .from("rooms")
      .insert([newRoom])
      .select()
      .single();

    if (error) throw error;

    setRooms([...rooms, data]);
    setDialogOpen(false);
    toast({ title: "Room Added", description: `Room ${newRoom.room_number} added.` });

    // reset form
    setNewRoom({
      room_number: "",
      room_type: "",
      status: "vacant",
      price: 3500,
      capacity: 0,
      floor: 1,
    });
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to add room.",
      variant: "destructive",
    });
  }
};


  const handleChangeRoomStatus = async (id: string, status: string) => {
      try {
        const { error } = await supabase
          .from('rooms')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
  
        if (error) {
          console.error('Error updating room status:', error);
          toast({
            title: "Error",
            description: "Failed to update room status.",
            variant: "destructive",
          });
          return;
        }
  
        setRooms(rooms.map((room) => 
          room.id === id ? { ...room, status } : room
        ));
        
        toast({
          title: "Room Status Updated",
          description: `Room status has been updated to ${status}.`,
        });
      } catch (err) {
        console.error('Error in handleChangeRoomStatus:', err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while updating room status.",
          variant: "destructive",
        });
      }
    };

  // กรองห้องตาม search และ filter
  const filteredRooms = rooms.filter((room) => {
    const matchSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || room.status.toLowerCase() === statusFilter.toLowerCase();
    const matchType = typeFilter === "all" || room.room_type.toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "vacant":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "occupied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading rooms...</p>
        </div>
      </div>
    );

  return (
    <div>
      {/* Header + Add Room Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("rooms.management")}</h1>
      
        {(user?.role === "admin" || user?.role === "staff") && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t("rooms.add")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("rooms.add")}</DialogTitle>
                <DialogDescription>{t("rooms.addDesc")}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <label htmlFor="roomNumber" className="block mb-1 font-medium">
                    {t("rooms.number")}
                  </label>
                  <Input
                    id="roomNumber"
                    type="text"
                    placeholder={t("rooms.number")}
                    value={newRoom.room_number}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        room_number: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="roomType" className="block mb-1 font-medium">
                    {t("rooms.type")}
                  </label>
                  <Select
                    id="roomType"
                    value={newRoom.room_type}
                    onValueChange={(v) => {
                      const capacity =
                        v === t("Standard.Single") ? 1 :
                        v === t("Standard.Double") ? 2 : 0;
                      setNewRoom({ ...newRoom, room_type: v, capacity });
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

                <div>
                  <label htmlFor="price" className="block mb-1 font-medium">
                    {t("rooms.rent")}
                  </label>
                  <Input
                    id="price"
                    type="number"
                    placeholder={t("rooms.rent")}
                    value={roomRent}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, price: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block mb-1 font-medium">
                    {t("rooms.capacity")}
                  </label>

                  {newRoom.room_type === "" ? (
                    <Input
                      id="capacity"
                      placeholder={t("rooms.type") + "..."}
                      disabled
                      value=""
                    />
                  ) : newRoom.room_type === "Standard Single" ? (
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      max={1}
                      value={1}
                      disabled
                    />
                  ) : (
                    <Input
                      id="capacity"
                      type="number"
                      min={2}
                      max={2}
                      value={2}
                      disabled
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="floor" className="block mb-1 font-medium">
                    {t("rooms.floor")}
                  </label>
                  <Input
                    id="floor"
                    type="number"
                    placeholder={t("rooms.floor")}
                    min={1}
                    max={floor}
                    value={newRoom.floor}
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val < 1) val = 1;
                      else if (val > floor) val = floor;
                      setNewRoom({ ...newRoom, floor: val });
                    }}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleAddRoom}>{t("rooms.add")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Input
          placeholder={t("Search by room number")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Statuses")}</SelectItem>
              <SelectItem value="vacant">{t("satatus.vacant")}</SelectItem>
              <SelectItem value="occupied">{t("satatus.occupied")}</SelectItem>
              <SelectItem value="maintenance">{t("satatus.maintenance")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("rooms.allTypes") || "All Types"}</SelectItem>
              <SelectItem value="Standard Single">{t("Standard.Single")}</SelectItem>
              <SelectItem value="Standard Double">{t("Standard.Double")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rooms.number")}</TableHead>
              <TableHead>{t("rooms.type")}</TableHead>
              <TableHead>{t("rooms.status")}</TableHead>
              <TableHead>{t("rooms.rent")}</TableHead>
              <TableHead>{t("rooms.capacity")}</TableHead>
              <TableHead>{t("rooms.floor")}</TableHead>
              <TableHead className="text-right">{t("Actions.text")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium flex items-center">
                    <DoorClosed className="h-4 w-4 mr-2 text-muted-foreground" />
                    {room.room_number}
                  </TableCell>
                  <TableCell>{t(room.room_type)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        room.status
                      )}`}
                    >
                      {t(`satatus.${room.status}`)}
                    </span>
                  </TableCell>
                  <TableCell>{formatPrice(roomRent)}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("Actions.text")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRoom(room);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t("view_details")}
                        </DropdownMenuItem>
                        {(user?.role === "admin" || user?.role === "staff") && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRoom(room);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem
                              onClick={() => {
                                setSelectedRoomInfo({ id: room.id, room_number: room.room_number });
                                setTenantFormOpen(true);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              เพิ่มลูกเช่า
                            </DropdownMenuItem> */}
                        
                              {room.status === "vacant" && (
                                <>
                                 <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                  {/* <DropdownMenuItem onClick={() => handleChangeRoomStatus(room.id, "occupied")}>
                                    Set as Occupied
                                  </DropdownMenuItem> */}
                                  <DropdownMenuItem onClick={() => handleChangeRoomStatus(room.id, "maintenance")}>
                                    Set as Maintenance
                                  </DropdownMenuItem>
                                </>
                              )}

                              {room.status === "maintenance" && (
                                <>
                                 <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleChangeRoomStatus(room.id, "vacant")}>
                                    Set as Vacant
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem onClick={() => handleChangeRoomStatus(room.id, "occupied")}>
                                    Set as Occupied
                                  </DropdownMenuItem> */}
                                </>
                              )}
                          </>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) :           
             (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  {t("No rooms found. Try adjusting your search or filters.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Room Dialog */}
      {selectedRoom && (
        <RoomEditDialog
          room={selectedRoom}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onRoomUpdated={(updatedRoom) =>
            setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)))
          }
        />
      )}

      {/* Room Details Dialog */}
      {selectedRoom && (
        <RoomDetailsDialog
          room={selectedRoom}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}

      {/* Tenant Form Dialog */}
      {selectedRoomInfo && (
        <TenantFormDialog
          open={tenantFormOpen}
          onOpenChange={setTenantFormOpen}
          room_id={selectedRoomInfo.id}
          room_number={selectedRoomInfo.room_number}
        />
      )}
    </div>
  );
}
