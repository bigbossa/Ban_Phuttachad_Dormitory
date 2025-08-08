import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { MoreVertical, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client"; 
import { RepairDetailsDialog } from "@/components/repairs/RepairDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

type Room = {
  id: string;
  room_number: string;
  tenant_id?: string; 
};

interface RoomWithOccupancy {
  id: string;
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  current_occupants: number;
  price: number;
  status: string;
}


type RepairRequest = {
  id: string;
  room_id: string;
  room_number: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  reported_date: string;
  completed_date?: string | null;
  profile_id?: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function RepairsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRepair, setNewRepair] = useState<Omit<RepairRequest, "id" | "completed_date">>({
    room_id: "",
    room_number: "",
    description: "",
    status: "pending",
    reported_date: new Date().toISOString().split("T")[0],
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairRequest | null>(null);
  const [viewingRepair, setViewingRepair] = useState<RepairRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const tenantId = user?.tenant?.id;
  console.log("tenantId",tenantId);
    console.log("user",user);
 const { data: availableRooms = [] } = useQuery({
    queryKey: ["available-rooms-with-capacity"],
    queryFn: async () => {
      const { data: rooms, error: roomsError } = await supabase.from("rooms").select("*").order("room_number");
      if (roomsError) throw roomsError;

      const roomsWithOccupancy: RoomWithOccupancy[] = await Promise.all(
        rooms.map(async (room) => {
          const { data: occupancyData } = await supabase
            .from("occupancy")
            .select("tenant_id")
            .eq("room_id", room.id)
            .eq("is_current", true);
          return {
            ...room,
            current_occupants: occupancyData?.length || 0,
          };
        })
      );
      return roomsWithOccupancy.filter(
        (room) => room.status === "vacant" || room.current_occupants < room.capacity
      );
    },
  });
  // โหลดข้อมูลจาก supabase
  useEffect(() => {
    const fetchRepairs = async () => {
      const { data, error } = await supabase
        .from("repairs")
        .select("*")
        .order("reported_date", { ascending: false });
      if (!error && data) setRepairs(data as RepairRequest[]);
    };
    fetchRepairs();
  }, []);

  // โหลด rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, room_number, tenant_id");
      if (data) {
        setRooms(data);
      }
    };
    fetchRooms();
  }, []);

  const handleChangeRepairStatus = async (id: string, status: RepairRequest["status"]) => {
    const { error } = await supabase
      .from("repairs")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setRepairs((prev) =>
        prev.map((repair) =>
          repair.id === id ? { ...repair, status } : repair
        )
      );
      toast({
        title: "Repair Status Updated",
        description: `Status updated to ${status}`,
      });
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

   useEffect(() => {
  if (user?.role === "tenant" && user.tenant?.room_id && user.tenant?.room_number) {
    setNewRepair(prev => ({
      ...prev,
      room_id: user.tenant!.room_id,
      room_number: user.tenant!.room_number,
    }));
  }
}, [user]);

  // เพิ่มข้อมูลลง supabase
  const handleAddRepair = async () => {
  const roomId = user.role === "tenant" ? user.tenant?.room_id : newRepair.room_id;
  const roomNumber = user.role === "tenant" ? user.tenant?.room_number : newRepair.room_number;

  const isTenant = user.role === "tenant";

if (isTenant) {
  // กรณีเป็น tenant ต้องมี roomId และ roomNumber
  if (!roomId || !roomNumber) {
    toast({
      title: "Error",
      description: "กรุณาเลือกห้อง",
      variant: "destructive",
    });
    return;
  }
} else {
  // กรณีเป็น admin หรือ staff ต้องหา room จาก rooms
  const selectedRoom = rooms.find(r => r.id === roomId);
  if (!selectedRoom) {
    toast({
      title: "ไม่พบข้อมูลห้องที่เลือก",
      description: "ห้องที่เลือกไม่อยู่ในระบบ หรือถูกลบไปแล้ว",
      variant: "destructive",
    });
    return;
  }
}

 if (!newRepair.description?.trim() || !newRepair.status || !newRepair.reported_date) {
    toast({
      title: "กรอกข้อมูลไม่ครบ",
      description: "กรุณากรอกคำอธิบาย, สถานะ และวันที่แจ้งซ่อมให้ครบถ้วน",
      variant: "destructive",
    });
    return;
  }

  const { data, error } = await supabase
    .from("repairs")
    .insert([
      {
        room_id: roomId,
        room_number: roomNumber,
        description: newRepair.description,
        status: newRepair.status,
        reported_date: newRepair.reported_date,
        profile_id: user.id,
      },
    ])
    .select();

  if (!error && data) {
    const newRepairs = data.map((item) => ({
      ...item,
      status: item.status as "pending" | "in_progress" | "completed" | "cancelled",
    })) as RepairRequest[];

    setRepairs((prev) => [...prev, ...newRepairs]);

    setDialogOpen(false);
    toast({
      title: t("repairs.add") || "Repair Request Added",
      description: t("repairs.addedDesc") || `Repair request submitted.`,
    });

    setNewRepair({
      room_id: "",
      room_number: "",
      description: "",
      status: "pending",
      reported_date: new Date().toISOString().split("T")[0],
    });
  } else {
    toast({
      title: t("repairs.error") || "Error",
      description: error?.message || "Error",
      variant: "destructive",
    });
  }
};


  // ฟังก์ชันอัปเดตข้อมูล
  const handleUpdateRepair = async () => {
    if (!editingRepair) return;
    const { id, ...updateData } = editingRepair;
    const { data, error } = await supabase
      .from("repairs")
      .update(updateData)
      .eq("id", id)
      .select();
    if (!error && data) {
      setRepairs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updateData } : r))
      );
      setEditDialogOpen(false);
      toast({
        title: t("repairs.updated") || "Repair Updated",
        description: t("repairs.updatedDesc") || "Repair request updated.",
      });
    } else {
      toast({
        title: t("repairs.error") || "Error",
        description: error?.message || "Error",
        variant: "destructive",
      });
    }
  };

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      (repair.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (repair.room_number?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || !statusFilter
        ? true
        : repair.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => {
    return format(parseISO(date), "PPP");
  };


  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return t("repairs.status_pending") || "รอดำเนินการ";
      case "in_progress":
        return t("repairs.status_in_progress") || "กำลังดำเนินการ";
      case "completed":
        return t("repairs.status_completed") || "เสร็จสิ้น";
      case "cancelled":
        return t("repairs.status_cancelled") || "ยกเลิก";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("repairs.title") || "การแจ้งซ่อม"}</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("repairs.add") || "แจ้งซ่อมใหม่"}
        </Button>
      </div>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder={t("repairs.searchPlaceholder") || "ค้นหาการแจ้งซ่อม..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue
              placeholder={t("repairs.filterByStatus") || "กรองตามสถานะ"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("repairs.status_all") || "ทั้งหมด"}</SelectItem>
            <SelectItem value="pending">{t("repairs.status_pending") || "รอดำเนินการ"}</SelectItem>
            <SelectItem value="in_progress">{t("repairs.status_in_progress") || "กำลังดำเนินการ"}</SelectItem>
            <SelectItem value="completed">{t("repairs.status_completed") || "เสร็จสิ้น"}</SelectItem>
            <SelectItem value="cancelled">{t("repairs.status_cancelled") || "ยกเลิก"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>              
              <TableHead>{t("repairs.roomNumber") || "ห้อง"}</TableHead>
              <TableHead>{t("repairs.reportedDate") || "วันที่แจ้ง"}</TableHead>
              <TableHead>{t("repairs.status") || "สถานะ"}</TableHead>
              <TableHead>{t("repairs.description") || "รายละเอียด"}</TableHead>
              <TableHead className="w-[100px]">{t("common.actions") || "การจัดการ"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRepairs.map((repair) => (
              <TableRow key={repair.id}>
                <TableCell>{repair.room_number}</TableCell>
                <TableCell>
                  {format(parseISO(repair.reported_date), "PPP")}
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(repair.status)}`}>
                    {getStatusLabel(repair.status)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {repair.description}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        {t("common.actions") || "Actions"}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setViewingRepair(repair);
                          setViewDialogOpen(true);
                        }}
                      >
                        {t("common.viewDetails") || "ดูรายละเอียด"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingRepair(repair);
                          setEditDialogOpen(true);
                        }}
                      >
                        {t("common.edit") || "แก้ไข"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleChangeRepairStatus(repair.id, "in_progress")
                        }
                        disabled={repair.status !== "pending"}
                      >
                        {t("repairs.markInProgress") || "เปลี่ยนเป็นกำลังดำเนินการ"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleChangeRepairStatus(repair.id, "completed")
                        }
                        disabled={
                          repair.status === "completed" ||
                          repair.status === "cancelled"
                        }
                      >
                        {t("repairs.markCompleted") || "เปลี่ยนเป็นเสร็จสิ้น"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleChangeRepairStatus(repair.id, "cancelled")
                        }
                        disabled={
                          repair.status === "completed" ||
                          repair.status === "cancelled"
                        }
                        className="text-red-600"
                      >
                        {t("repairs.markCancelled") || "เปลี่ยนเป็นยกเลิก"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add New Repair Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>{/* Empty trigger, button is outside */}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("repairs.add")}</DialogTitle>
            <DialogDescription>
              {t("repairs.createDescription") || "Submit a new repair request."}
            </DialogDescription>
          </DialogHeader>
        <div className="space-y-4 py-4">
        {user?.role === "admin" || user?.role === "staff" ? (
        <Select
          value={newRepair.room_id}
          onValueChange={value => {
            const selectedRoom = availableRooms.find(r => r.id === value);
            setNewRepair({
              ...newRepair,
              room_id: value,
              room_number: selectedRoom?.room_number || "",
            });
          }}
        >
          <SelectTrigger id="room-select">
            <SelectValue placeholder={t("repairs.selectRoom") || "เลือกห้อง"} />
          </SelectTrigger>
          <SelectContent>
            {availableRooms.filter(room => room.current_occupants < 1).length === 0 ? (
              <div className="px-3 py-2 text-muted-foreground text-sm">
                {t("repairs.noAvailableRoom") || "ไม่มีห้องว่าง"}
              </div>
            ) : (
              availableRooms
                .filter(room => room.current_occupants < 1)
                .map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>ห้อง {room.room_number}</span>
                    </div>
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
      ) : user?.role === "tenant" ? (
        <div className="px-4 py-2 rounded border text-muted-foreground">
          ห้องพักของคุณ:{" "}
          <span className="font-semibold text-primary">
            {user.tenant?.room_number || t("repairs.noRoomInfo") || "ไม่พบข้อมูล"}
          </span>
        </div>
      ) : (
        <div className="px-4 py-2 text-muted-foreground">
          {t("repairs.noPermission") || "ไม่มีสิทธิ์เลือกห้อง"}
        </div>
      )}
      </div>
          <div className="space-y-2">
            <label htmlFor="description">{t("repairs.description")}</label>
            <Textarea
              id="description"
              value={newRepair.description}
              onChange={(e) =>
                setNewRepair({ ...newRepair, description: e.target.value })
              }
              placeholder={t("repairs.descriptionPlaceholder") || "อธิบายปัญหาที่ต้องการแจ้งซ่อม..."}

              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status">{t("repairs.status") || "สถานะ"}</label>
            {user?.role === "admin" || user?.role === "staff" ? (
              <Select
                value={newRepair.status}
                onValueChange={(value: RepairRequest["status"]) =>
                  setNewRepair({ ...newRepair, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t("repairs.status_pending") || "Pending"}</SelectItem>
                  <SelectItem value="in_progress">{t("repairs.status_in_progress") || "In Progress"}</SelectItem>
                  <SelectItem value="completed">{t("repairs.status_completed") || "Completed"}</SelectItem>
                  <SelectItem value="cancelled">{t("repairs.status_cancelled") || "Cancelled"}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div>
                <label className="font-medium text-gray-700">
                  {t("repairs.status_pending") || "Pending"}
                </label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleAddRepair}>{t("repairs.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Repair Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("repairs.edit") || "แก้ไขการแจ้งซ่อม"}</DialogTitle>
          </DialogHeader>
          {editingRepair && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit_room_id">{t("repairs.room")}</label>
                <Select
                  value={editingRepair.room_id}
                  onValueChange={(value) =>
                    setEditingRepair({ ...editingRepair, room_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกห้อง" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit_description">{t("repairs.description")}</label>
                <Textarea
                  id="edit_description"
                  value={editingRepair.description}
                  onChange={(e) =>
                    setEditingRepair({ ...editingRepair, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit_status">{t("repairs.status")}</label>
                <Select
                  value={editingRepair.status}                  onValueChange={(value: RepairRequest["status"]) =>
                    setEditingRepair({ ...editingRepair, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("repairs.status_pending") || "Pending"}</SelectItem>
                    <SelectItem value="in_progress">{t("repairs.status_in_progress") || "In Progress"}</SelectItem>
                    <SelectItem value="completed">{t("repairs.status_completed") || "Completed"}</SelectItem>
                    <SelectItem value="cancelled">{t("repairs.status_cancelled") || "Cancelled"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateRepair}>{t("repairs.saveEdit") || "บันทึกการแก้ไข"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <RepairDetailsDialog
        repair={viewingRepair}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
}
