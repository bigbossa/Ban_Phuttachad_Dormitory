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
  const [newRepair, setNewRepair] = useState<
    Omit<RepairRequest, "id" | "completed_date">
  >({
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
  const [editingRepair, setEditingRepair] = useState<RepairRequest | null>(
    null
  );
  const [viewingRepair, setViewingRepair] = useState<RepairRequest | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const tenantId = user?.tenant?.id;
  console.log("tenantId", tenantId);
  console.log("user", user);
  const {
    data: availableRooms = [],
    isLoading: isLoadingRooms,
    error: roomsError,
  } = useQuery({
    queryKey: ["available-rooms-with-capacity", user?.role],
    queryFn: async () => {
      // Get all rooms regardless of status for admin users
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");
      if (roomsError) throw roomsError;

      console.log(
        `Fetched ${rooms?.length || 0} rooms from database:`,
        rooms?.map((r) => `${r.room_number}(${r.status})`)
      );
      console.log("Room status values found:", [
        ...new Set(rooms?.map((r) => r.status) || []),
      ]);
      console.log("Room capacity values found:", [
        ...new Set(rooms?.map((r) => r.capacity) || []),
      ]);

      const roomsWithOccupancy: RoomWithOccupancy[] = await Promise.all(
        rooms.map(async (room) => {
          try {
            const { data: occupancyData, error: occupancyError } =
              await supabase
                .from("occupancy")
                .select("tenant_id")
                .eq("room_id", room.id)
                .eq("is_current", true);

            if (occupancyError) {
              console.error(
                `Error fetching occupancy for room ${room.room_number}:`,
                occupancyError
              );
            }

            const roomWithOccupancy = {
              ...room,
              current_occupants: occupancyData?.length || 0,
            };

            console.log(`Processed room ${room.room_number}:`, {
              id: room.id,
              status: room.status,
              capacity: room.capacity,
              current_occupants: roomWithOccupancy.current_occupants,
            });

            return roomWithOccupancy;
          } catch (error) {
            console.error(`Error processing room ${room.room_number}:`, error);
            return {
              ...room,
              current_occupants: 0,
            };
          }
        })
      );
      // For admin/staff users, show all rooms. For tenants, only show available rooms
      let finalRooms;
      if (user?.role === "admin" || user?.role === "staff") {
        finalRooms = roomsWithOccupancy;
        console.log(`Admin/Staff: Showing all ${finalRooms.length} rooms`);
      } else {
        // For tenants, filter to only show available rooms
        finalRooms = roomsWithOccupancy.filter((room) => {
          const cap = Math.max(room.capacity ?? 2, 2);
          const isAvailable =
            room.status === "vacant" || room.current_occupants < cap;
          console.log(
            `Room ${room.room_number}: status=${room.status}, occupants=${room.current_occupants}, capacity=${room.capacity}, cap=${cap}, isAvailable=${isAvailable}`
          );
          return isAvailable;
        });
        console.log(`Tenant: Filtered to ${finalRooms.length} available rooms`);
      }

      console.log(
        "Final rooms to display:",
        finalRooms.map(
          (r) =>
            `${r.room_number}(${r.status}/${r.current_occupants}/${r.capacity})`
        )
      );
      return finalRooms;
    },
  });
  // โหลดข้อมูลจาก supabase
  useEffect(() => {
    const fetchRepairs = async () => {
      let query = supabase
        .from("repairs")
        .select("*")
        .order("reported_date", { ascending: false });

      // ถ้าเป็นผู้เช่า ให้แสดงเฉพาะห้องของตนเอง
      if (user?.role === "tenant" && user.tenant?.room_id) {
        query = query.eq("room_id", user.tenant.room_id);
      }

      const { data, error } = await query;
      if (!error && data) setRepairs(data as RepairRequest[]);
    };
    fetchRepairs();
  }, [user]);

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

  const handleChangeRepairStatus = async (
    id: string,
    status: RepairRequest["status"]
  ) => {
    // ตรวจสอบสิทธิ์ - เฉพาะ admin/staff เท่านั้นที่เปลี่ยนสถานะได้
    if (user?.role !== "admin" && user?.role !== "staff") {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะการแจ้งซ่อม",
        variant: "destructive",
      });
      return;
    }

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
        title: "อัปเดตสถานะสำเร็จ",
        description: `สถานะถูกเปลี่ยนเป็น ${getStatusLabel(status)}`,
      });
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (
      user?.role === "tenant" &&
      user.tenant?.room_id &&
      user.tenant?.room_number
    ) {
      setNewRepair((prev) => ({
        ...prev,
        room_id: user.tenant!.room_id,
        room_number: user.tenant!.room_number,
      }));
    }
  }, [user]);

  // เพิ่มข้อมูลลง supabase
  const handleAddRepair = async () => {
    console.log("handleAddRepair called");
    console.log("User role:", user?.role);
    console.log("newRepair:", newRepair);
    console.log("availableRooms:", availableRooms);
    console.log("isLoadingRooms:", isLoadingRooms);
    console.log("roomsError:", roomsError);

    // ตรวจสอบว่าข้อมูลห้องโหลดเสร็จแล้วหรือยัง
    if (isLoadingRooms) {
      toast({
        title: "กำลังโหลดข้อมูลห้อง",
        description:
          user?.role === "tenant"
            ? "กำลังโหลดข้อมูลห้องพักของคุณ กรุณารอสักครู่..."
            : "กรุณารอสักครู่...",
        variant: "destructive",
      });
      return;
    }

    if (roomsError) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description:
          user?.role === "tenant"
            ? "ไม่สามารถโหลดข้อมูลห้องพักได้ กรุณาลองใหม่อีกครั้ง"
            : "ไม่สามารถโหลดข้อมูลห้องได้",
        variant: "destructive",
      });
      return;
    }

    const roomId =
      user.role === "tenant" ? user.tenant?.room_id : newRepair.room_id;
    const roomNumber =
      user.role === "tenant" ? user.tenant?.room_number : newRepair.room_number;

    console.log("Selected roomId:", roomId);
    console.log("Selected roomNumber:", roomNumber);

    const isTenant = user.role === "tenant";

    if (isTenant) {
      // กรณีเป็น tenant ต้องมี roomId และ roomNumber
      if (!roomId || !roomNumber) {
        toast({
          title: "ไม่พบข้อมูลห้องพัก",
          description: "กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบข้อมูลห้องพักของคุณ",
          variant: "destructive",
        });
        return;
      }
    } else {
      // กรณีเป็น admin หรือ staff ต้องหา room จาก availableRooms
      console.log("Checking admin/staff room selection");
      console.log(
        "Looking for roomId:",
        roomId,
        "in availableRooms:",
        availableRooms.map((r) => ({ id: r.id, room_number: r.room_number }))
      );

      const selectedRoom = availableRooms.find((r) => r.id === roomId);
      console.log("Found selectedRoom:", selectedRoom);

      if (!selectedRoom) {
        console.log("Room not found in availableRooms");
        toast({
          title: "ไม่พบข้อมูลห้องที่เลือก",
          description:
            "ห้องที่เลือกไม่อยู่ในระบบ หรือถูกลบไปแล้ว กรุณาเลือกห้องใหม่",
          variant: "destructive",
        });
        return;
      }
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!newRepair.description?.trim()) {
      toast({
        title: "กรอกข้อมูลไม่ครบ",
        description:
          user?.role === "tenant"
            ? "กรุณากรอกคำอธิบายปัญหาที่ต้องการแจ้งซ่อม"
            : "กรุณากรอกคำอธิบายการแจ้งซ่อม",
        variant: "destructive",
      });
      return;
    }

    if (!newRepair.status) {
      toast({
        title: "กรอกข้อมูลไม่ครบ",
        description:
          user?.role === "tenant"
            ? "สถานะการแจ้งซ่อมจะถูกตั้งเป็น 'รอดำเนินการ' โดยอัตโนมัติ"
            : "กรุณาเลือกสถานะการแจ้งซ่อม",
        variant: "destructive",
      });
      return;
    }

    if (!newRepair.reported_date) {
      toast({
        title: "กรอกข้อมูลไม่ครบ",
        description:
          user?.role === "tenant"
            ? "วันที่แจ้งซ่อมจะถูกตั้งเป็นวันปัจจุบันโดยอัตโนมัติ"
            : "กรุณาเลือกวันที่แจ้งซ่อม",
        variant: "destructive",
      });
      return;
    }

    // ตรวจสอบว่า Admin/Staff ได้เลือกห้องหรือไม่
    if (
      (user?.role === "admin" || user?.role === "staff") &&
      !newRepair.room_id
    ) {
      toast({
        title: "กรุณาเลือกห้อง",
        description: "กรุณาเลือกห้องที่ต้องการแจ้งซ่อม",
        variant: "destructive",
      });
      return;
    }

    // ตรวจสอบว่าผู้เช่ามีข้อมูลห้องหรือไม่
    if (user?.role === "tenant" && (!roomId || !roomNumber)) {
      toast({
        title: "ไม่พบข้อมูลห้องพัก",
        description: "กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบข้อมูลห้องพักของคุณ",
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
        status: item.status as
          | "pending"
          | "in_progress"
          | "completed"
          | "cancelled",
      })) as RepairRequest[];

      setRepairs((prev) => [...prev, ...newRepairs]);

      setDialogOpen(false);
      toast({
        title:
          user?.role === "tenant"
            ? "ส่งคำขอแจ้งซ่อมสำเร็จ"
            : t("repairs.add") || "Repair Request Added",
        description:
          user?.role === "tenant"
            ? `คำขอแจ้งซ่อมสำหรับห้อง ${roomNumber} ถูกส่งเรียบร้อยแล้ว`
            : t("repairs.addedDesc") || `Repair request submitted.`,
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
        title:
          user?.role === "tenant"
            ? "เกิดข้อผิดพลาด"
            : t("repairs.error") || "Error",
        description:
          user?.role === "tenant"
            ? "ไม่สามารถส่งคำขอแจ้งซ่อมได้ กรุณาลองใหม่อีกครั้ง"
            : error?.message || "Error",
        variant: "destructive",
      });
    }
  };

  // ฟังก์ชันอัปเดตข้อมูล
  const handleUpdateRepair = async () => {
    if (!editingRepair) return;

    // ตรวจสอบสิทธิ์ - เฉพาะ admin/staff เท่านั้นที่แก้ไขได้
    if (user?.role !== "admin" && user?.role !== "staff") {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "คุณไม่มีสิทธิ์ในการแก้ไขการแจ้งซ่อม",
        variant: "destructive",
      });
      return;
    }

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
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตการแจ้งซ่อมได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      (repair.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (repair.room_number?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

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
        <h1 className="text-3xl font-bold">
          {t("repairs.title") || "การแจ้งซ่อม"}
        </h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {user?.role === "tenant"
            ? "แจ้งซ่อมใหม่"
            : t("repairs.add") || "แจ้งซ่อมใหม่"}
        </Button>
      </div>
      {/* แสดงข้อมูลห้องสำหรับผู้เช่า */}
      {user?.role === "tenant" && user.tenant?.room_number && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md hidden">
          <p className="text-blue-800 font-medium ">
            กำลังแสดงการแจ้งซ่อมสำหรับห้อง:{" "}
            <span className="font-bold">{user.tenant.room_number}</span>
          </p>
        </div>
      )}

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
            <SelectItem value="all">
              {t("repairs.status_all") || "ทั้งหมด"}
            </SelectItem>
            <SelectItem value="pending">
              {t("repairs.status_pending") || "รอดำเนินการ"}
            </SelectItem>
            <SelectItem value="in_progress">
              {t("repairs.status_in_progress") || "กำลังดำเนินการ"}
            </SelectItem>
            <SelectItem value="completed">
              {t("repairs.status_completed") || "เสร็จสิ้น"}
            </SelectItem>
            <SelectItem value="cancelled">
              {t("repairs.status_cancelled") || "ยกเลิก"}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("repairs.roomNumber") || "ห้อง"}</TableHead>
              {/* <TableHead className="hidden md:table-cell">Room ID</TableHead> */}
              <TableHead>{t("repairs.reportedDate") || "วันที่แจ้ง"}</TableHead>
              <TableHead>{t("repairs.status") || "สถานะ"}</TableHead>
              <TableHead>{t("repairs.description") || "รายละเอียด"}</TableHead>
              <TableHead className="w-[100px]">
                {t("common.actions") || "การจัดการ"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRepairs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {user?.role === "tenant" ? (
                    <div className="text-center">
                      <div className="text-gray-500 text-lg mb-2">
                        ไม่มีการแจ้งซ่อมสำหรับห้อง {user.tenant?.room_number}
                      </div>
                      <div className="text-gray-400 text-sm">
                        ใช้ปุ่ม "แจ้งซ่อมใหม่" เพื่อสร้างการแจ้งซ่อมครั้งแรก
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-500 text-lg mb-2">
                        ไม่พบการแจ้งซ่อม
                      </div>
                      <div className="text-gray-400 text-sm">
                        ใช้ปุ่ม "แจ้งซ่อมใหม่" เพื่อสร้างการแจ้งซ่อม
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>{repair.room_number}</TableCell>
                  {/* <TableCell className="hidden md:table-cell font-mono text-sm">
                    {repair.room_id}
                  </TableCell> */}
                  <TableCell>
                    {format(parseISO(repair.reported_date), "dd/MM/yyyy")}
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
                          className="hidden"
                          onClick={() => {
                            navigator.clipboard.writeText(repair.room_id);
                            toast({
                              title: "คัดลอก Room ID แล้ว",
                              description: `คัดลอก Room ID: ${repair.room_id}`,
                            });
                          }}
                        >
                          คัดลอก Room ID
                        </DropdownMenuItem>
                        {/* แสดงปุ่มแก้ไขเฉพาะ admin/staff เท่านั้น */}
                        {(user?.role === "admin" || user?.role === "staff") && (
                          <>
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
                                handleChangeRepairStatus(
                                  repair.id,
                                  "in_progress"
                                )
                              }
                              disabled={repair.status !== "pending"}
                            >
                              {t("repairs.markInProgress") ||
                                "เปลี่ยนเป็นกำลังดำเนินการ"}
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
                              {t("repairs.markCompleted") ||
                                "เปลี่ยนเป็นเสร็จสิ้น"}
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
                              {t("repairs.markCancelled") ||
                                "เปลี่ยนเป็นยกเลิก"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add New Repair Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {/* Empty trigger, button is outside */}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user?.role === "tenant"
                ? "แจ้งซ่อมใหม่"
                : t("repairs.add") || "แจ้งซ่อมใหม่"}
            </DialogTitle>
            <DialogDescription>
              {user?.role === "tenant"
                ? "ส่งคำขอแจ้งซ่อมสำหรับห้องพักของคุณ"
                : t("repairs.createDescription") ||
                  "Submit a new repair request."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Debug Info - Visible for admin users */}
            {(user?.role === "admin" || user?.role === "staff") && (
              <div className="p-2 bg-blue-50 rounded text-xs border border-blue-200 hidden">
                <div className="font-medium text-blue-800 mb-1">
                  ข้อมูลการแก้ไขปัญหา:
                </div>
                <div>User Role: {user?.role}</div>
                <div>Available Rooms: {availableRooms.length}</div>
                <div>Loading: {isLoadingRooms ? "Yes" : "No"}</div>
                <div>Error: {roomsError ? "Yes" : "No"}</div>
                <div className="mt-1 text-blue-600">
                  ห้องทั้งหมด:{" "}
                  {availableRooms.map((r) => r.room_number).join(", ")}
                </div>
                <div className="mt-1 text-blue-600">
                  ข้อมูลห้อง:{" "}
                  {availableRooms
                    .map(
                      (r) =>
                        `${r.room_number}(${r.status}/${r.current_occupants}/${r.capacity})`
                    )
                    .join(", ")}
                </div>
              </div>
            )}

            {user?.role === "admin" || user?.role === "staff" ? (
              <div className="space-y-3">
                <Select
                  value={newRepair.room_id}
                  onValueChange={(value) => {
                    console.log("Room selected:", value);
                    const selectedRoom = availableRooms.find(
                      (r) => r.id === value
                    );
                    console.log("Found room:", selectedRoom);
                    setNewRepair({
                      ...newRepair,
                      room_id: value,
                      room_number: selectedRoom?.room_number || "",
                    });
                  }}
                >
                  <SelectTrigger id="room-select">
                    <SelectValue
                      placeholder={t("repairs.selectRoom") || "เลือกห้อง"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRooms ? (
                      <div className="px-3 py-2 text-muted-foreground text-sm">
                        กำลังโหลดข้อมูลห้อง...
                      </div>
                    ) : roomsError ? (
                      <div className="px-3 py-2 text-red-500 text-sm">
                        เกิดข้อผิดพลาดในการโหลดข้อมูลห้อง
                      </div>
                    ) : availableRooms.length === 0 ? (
                      <div className="px-3 py-2 text-muted-foreground text-sm">
                        {t("repairs.noAvailableRoom") || "ไม่มีห้องในระบบ"}
                      </div>
                    ) : (
                      availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2">
                              {room.room_number}
                              <span
                                className={`text-xs px-2 py-1 rounded-full hidden ${
                                  room.status === "vacant"
                                    ? "bg-green-100 text-green-800"
                                    : room.status === "occupied"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {room.status === "vacant"
                                  ? "ว่าง"
                                  : room.status === "occupied"
                                  ? "มีคนพัก"
                                  : room.status === "maintenance"
                                  ? "ซ่อมแซม"
                                  : room.status}
                              </span>
                            </span>
                            <div className="flex flex-col items-end text-xs text-muted-foreground hidden">
                              <span>
                                {room.current_occupants > 0
                                  ? `${room.current_occupants}/${
                                      room.capacity || 2
                                    } คน`
                                  : "ไม่มีผู้พัก"}
                              </span>
                              <span className="text-xs opacity-70">
                                ชั้น {room.floor || "N/A"} | ความจุ:{" "}
                                {room.capacity || 2}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* แสดงข้อมูลห้องที่เลือก */}
                {newRepair.room_id && (
                  <div className="p-3 bg-muted rounded-md hidden">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">ห้องที่เลือก:</span>
                        <span className="font-semibold">
                          {newRepair.room_number}
                        </span>
                      </div>
                      <div className="flex justify-between hidden">
                        <span className="text-muted-foreground">Room ID:</span>
                        <span className="font-mono text-xs">
                          {newRepair.room_id}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 hidden">
                        ห้องนี้อยู่ใน availableRooms:{" "}
                        {availableRooms.some((r) => r.id === newRepair.room_id)
                          ? "✅ ใช่"
                          : "❌ ไม่ใช่"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : user?.role === "tenant" ? (
              <div className="px-4 py-2 rounded border bg-blue-50 border-blue-200">
                <div className="text-blue-800 font-medium">
                  ห้องพักของคุณ:{" "}
                  <span className="font-semibold text-blue-900">
                    {user.tenant?.room_number ||
                      t("repairs.noRoomInfo") ||
                      "ไม่พบข้อมูล"}
                  </span>
                </div>
                <div className="text-blue-600 text-sm mt-1">
                  การแจ้งซ่อมจะถูกส่งสำหรับห้องนี้โดยอัตโนมัติ
                </div>
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
              placeholder={
                t("repairs.descriptionPlaceholder") ||
                "อธิบายปัญหาที่ต้องการแจ้งซ่อม..."
              }
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
                  <SelectItem value="pending">
                    {t("repairs.status_pending") || "Pending"}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {t("repairs.status_in_progress") || "In Progress"}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t("repairs.status_completed") || "Completed"}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("repairs.status_cancelled") || "Cancelled"}
                  </SelectItem>
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
            <Button onClick={handleAddRepair} disabled={isLoadingRooms}>
              {isLoadingRooms
                ? "กำลังโหลด..."
                : user?.role === "tenant"
                ? "ส่งคำขอแจ้งซ่อม"
                : t("repairs.add") || "แจ้งซ่อมใหม่"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Repair Dialog - เฉพาะ admin/staff เท่านั้น */}
      {(user?.role === "admin" || user?.role === "staff") && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("repairs.edit") || "แก้ไขการแจ้งซ่อม"}
              </DialogTitle>
            </DialogHeader>
            {editingRepair && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit_room_id">{t("repairs.room")}</label>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-orange-800">
                        ห้อง {editingRepair.room_number}
                      </span>
                      <span className="text-xs text-orange-600 hidden">
                        Room ID: {editingRepair.room_id}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_description">
                    {t("repairs.description")}
                  </label>
                  <Textarea
                    id="edit_description"
                    value={editingRepair.description}
                    onChange={(e) =>
                      setEditingRepair({
                        ...editingRepair,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_status">{t("repairs.status")}</label>
                  <Select
                    value={editingRepair.status}
                    onValueChange={(value: RepairRequest["status"]) =>
                      setEditingRepair({ ...editingRepair, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        {t("repairs.status_pending") || "Pending"}
                      </SelectItem>
                      <SelectItem value="in_progress">
                        {t("repairs.status_in_progress") || "In Progress"}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("repairs.status_completed") || "Completed"}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("repairs.status_cancelled") || "Cancelled"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUpdateRepair}>
                {t("repairs.saveEdit") || "บันทึกการแก้ไข"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Details Dialog */}
      <RepairDetailsDialog
        repair={viewingRepair}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
}
