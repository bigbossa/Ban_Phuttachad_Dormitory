import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, MoreHorizontal, Eye, Edit, Trash2, Home, UserPlus } from "lucide-react";
import { useTenants } from "@/hooks/useTenants";
import TenantFormDialog from "@/components/tenants/TenantFormDialog";
import TenantDetailsDialog from "@/components/tenants/TenantDetailsDialog";
import RoomAssignmentDialog from "@/components/tenants/RoomAssignmentDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCreateDialog } from "../components/auth/UserCreateDialog";
import ViewContractDialog from "@/components/tenants/ViewContractDialog";
import ContractImageDialog from '../components/tenants/ContractImageDialog';
import RentedchildFormDialog from "@/components/tenants/RentedchildFormDialog";
import { supabase } from "@/integrations/supabase/client";

const TenantsPage = ({ children }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRoomAssignOpen, setIsRoomAssignOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isRentedChildFormOpen, setIsRentedChildFormOpen] = useState(false);

  const [occupancyMap, setOccupancyMap] = useState({});
  const [roomCapacityMap, setRoomCapacityMap] = useState({});

  const {
    tenants,
    isLoading,
    createTenant,
    updateTenant,
    deleteRentedchild,
    deleteTenant,
    assignRoom,
    isCreating,
    isUpdating,
    isDeleting,
    isAssigningRoom,
  } = useTenants();

  const filteredTenants = tenants
  .filter(t =>  t.action ==="1")
  .filter(t => {
    const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
    const email = t.email?.toLowerCase() || "";
    const phone = t.phone?.toLowerCase() || "";
    const roomNumber = t.current_room?.room_number?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      roomNumber.includes(search)
    );
  });

  const [reloadFlag, setReloadFlag] = useState(false);

  // ดึงจำนวน occupants ปัจจุบัน จากตาราง occupancy
  useEffect(() => {
    const fetchOccupancy = async () => {
      const { data, error } = await supabase
        .from("occupancy")
        .select("room_id")
        .eq("is_current", true);

      if (!error && data) {
        const counts = {};
        data.forEach((item) => {
          if (item.room_id) {
            counts[item.room_id] = (counts[item.room_id] || 0) + 1;
          }
        });
        setOccupancyMap(counts);
      } else {
        console.error("ไม่สามารถโหลดข้อมูลผู้พักได้", error);
      }
    };
    fetchOccupancy();
  }, [reloadFlag]);

  // ดึงข้อมูล capacity ห้องจากตาราง rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, capacity");

      if (!error && data) {
        const capacityMap = {};
        data.forEach(room => {
          capacityMap[room.id] = room.capacity || 0;
        });
        setRoomCapacityMap(capacityMap);
      } else {
        console.error("ไม่สามารถโหลดข้อมูลห้องได้", error);
      }
    };
    fetchRooms();
  }, [reloadFlag]);

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setSelectedRoom(tenant.current_room ? {
      id: tenant.current_room.id,
      room_number: tenant.current_room.room_number,
    } : null);
    setIsFormOpen(true);
  };

  const handleViewDetails = (tenant) => {
    setSelectedTenant(tenant);
    setIsDetailsOpen(true);
  };

  const handleAssignRoom = (tenant) => {
    setSelectedTenant(tenant);
    setIsRoomAssignOpen(true);
  };

  const handleAddContractImage = (tenant) => {
    setSelectedTenant(tenant);
    setIsContractDialogOpen(true);
  };

  const handleViewContractImage = (tenant) => {
    setSelectedTenant(tenant);
    setSelectedFileName(tenant.image);
    setContractDialogOpen(true);
  };

  const handleDeleteTenant = (tenant) => {
    if (confirm(`${t("tenants.deleteConfirm", { name: `${tenant.first_name} ${tenant.last_name}` })}`)) {
      deleteTenant(tenant.id);
    }
  };

  const handleDeleteRentedchild = (tenant) => {
    if (confirm(`${t("tenants.deleteChildConfirm", { name: `${tenant.first_name} ${tenant.last_name}` })}`)) {
      deleteRentedchild(tenant.id);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t("loadingTenants")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("manageSystemUsers")}</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>

    {/* User Create Dialog */}
    <UserCreateDialog
      open={createUserOpen}
      onOpenChange={setCreateUserOpen}
    />

    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("tenants.management")}</h1>
          <p className="text-muted-foreground">{t("tenants.managementDesc")}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
            <Button
              onClick={() => {
                setIsOpen(false);
                setCreateUserOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              {t("tenants.add")}
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("tenants.searchTitle")}</CardTitle>
          <CardDescription>
            {t("tenants.searchDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder={t("tenants.searchPlaceholder")} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("tenants.listTitle")}</CardTitle>
          <CardDescription>
            {t("tenants.showCount", { count: filteredTenants.length, total: tenants.filter(t =>  t.action == "1").length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tenants.name")}</TableHead>
                  <TableHead>{t("tenants.phone")}</TableHead>
                  <TableHead>{t("tenants.room")}</TableHead>
                  <TableHead>{t("tenants.address")}</TableHead>
                  <TableHead>{t("tenants.createdAt")}</TableHead>
                  <TableHead className="w-[100px]">{t("Actions.text")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">{t("tenants.noData")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // รวมผู้เช่าตาม room_id
                  (() => {
                    // สร้าง object สำหรับ group ผู้เช่า ตาม room_id
                    const tenantsByRoom = filteredTenants.reduce<Record<string, typeof filteredTenants>>((acc, tenant) => {
                      const roomId = tenant.current_room?.id || "no_room";
                      if (!acc[roomId]) acc[roomId] = [];
                      acc[roomId].push(tenant);
                      return acc;
                    }, {});

                    return Object.entries(tenantsByRoom).map(([roomId, tenants]) => {
                      const firstTenant = tenants.find(t => t.residents === "ผู้เช่า") || tenants[0];
                      const roomInfo = firstTenant.current_room;
                      const currentOccupants = occupancyMap[roomId] || 0;
                      const roomCapacity = roomCapacityMap[roomId] || 0;
                      const isRoomFull = currentOccupants >= roomCapacity;

                      return (
                       <TableRow key={roomId}>
                        <TableCell>
                        <div className="flex flex-col gap-4 max-h-48 overflow-y-auto">
                          {["ผู้เช่า", "ลูกเช่า"].map((type) => {
                            const filtered = tenants.filter((t) => t.residents === type);
                            if (filtered.length === 0) return null;
                            return (
                              <div key={type}>
                                <h6 className="text-sx font-semibold text-primary mt-2">
                                  {type === "ผู้เช่า" ? t("tenants.main") : t("tenants.child")}
                                </h6>
                                {filtered.map((tenant) => {
                                  const fullName = `${tenant.first_name} ${tenant.last_name}`;
                                  return (
                                    <div key={tenant.id} className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarImage
                                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                                          alt={fullName}
                                        />
                                        <AvatarFallback>
                                          {tenant.first_name.charAt(0)}
                                          {tenant.last_name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{fullName}</p>
                                        <p className="text-sm text-muted-foreground">{tenant.email}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-4">
                          {["ผู้เช่า", "ลูกเช่า"].map((type) => {
                            const filtered = tenants.filter((t) => t.residents === type);
                            if (filtered.length === 0) return null;
                            return (
                              <div key={type}>
                                {filtered.map((t) => (
                                  <p key={t.id} className="text-sm">
                                    {t.phone || "-"}
                                    {type === "ลูกเช่า" && (
                                      <span className="text-xs text-muted-foreground ml-2"></span>
                                    )}
                                  </p>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        {roomInfo ? (
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <Badge variant="secondary" className="text-xs">
                                {t("tenants.room")} {roomInfo.room_number}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {roomInfo.room_type} • {t("tenants.floor")} {roomInfo.floor}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t("tenants.notRented")}</span>
                        )}
                      </TableCell>

                      <TableCell className="max-w-[150px] truncate">
                        <div className="flex flex-col gap-4">
                          {["ผู้เช่า", "ลูกเช่า"].map((type) => {
                            const filtered = tenants.filter((t) => t.residents === type);
                            if (filtered.length === 0) return null;
                            return (
                              <div key={type}>
                                {filtered.map((t) => (
                                  <p key={t.id} className="text-sm truncate">
                                    {t.address || "-"}
                                    {type === "ลูกเช่า" && (
                                      <span className="text-xs text-muted-foreground ml-2"></span>
                                    )}
                                  </p>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-4">
                          {["ผู้เช่า", "ลูกเช่า"].map((type) => {
                            const filtered = tenants.filter((t) => t.residents === type);
                            if (filtered.length === 0) return null;
                            return (
                              <div key={type}>
                                {filtered.map((t) => (
                                  <p key={t.id} className="text-sm">
                                    {new Date(t.created_at!).toLocaleDateString("th-TH")}
                                    {type === "ลูกเช่า" && (
                                      <span className="text-xs text-muted-foreground ml-2"></span>
                                    )}
                                  </p>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                       <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(firstTenant)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("view_details")}
                            </DropdownMenuItem>
                            {!isRoomFull && firstTenant.current_room && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRoom({
                                    id: firstTenant.current_room.id,
                                    room_number: firstTenant.current_room.room_number,
                                  });
                                  setEditingTenant(firstTenant);
                                  setIsFormOpen(false);
                                  setIsRentedChildFormOpen(true);
                                }}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                {t("tenants.addChild")}
                              </DropdownMenuItem>
                            )}
                            {firstTenant.image && (
                              <DropdownMenuItem onClick={() => handleViewContractImage(firstTenant)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("tenants.viewContractImage")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEditTenant(firstTenant)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTenant(firstTenant)}
                              className="text-destructive"
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("tenants.delete")}
                            </DropdownMenuItem>
                            {tenants.length > 1 && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteRentedchild(firstTenant)}
                                className="text-destructive"
                                disabled={isDeleting}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("tenants.deleteChild")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                          </TableRow>
                        );
                      });
                    })()
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

       <TenantFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          tenant={editingTenant}
          room_id={selectedRoom?.id || ""}
          room_number={selectedRoom?.room_number || ""}
          isLoading={isCreating || isUpdating}
        />

        <RentedchildFormDialog
          open={isRentedChildFormOpen}
          onOpenChange={setIsRentedChildFormOpen}
          tenant={editingTenant}
          room_id={selectedRoom?.id || ""}
          room_number={selectedRoom?.room_number || ""}
          isLoading={isCreating || isUpdating}
        />

        <TenantDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        tenant={selectedTenant}
      />

        <ContractImageDialog
          open={isContractDialogOpen}
          onOpenChange={setIsContractDialogOpen}
          tenant={selectedTenant}
        />

        <ViewContractDialog
          open={contractDialogOpen}
          onOpenChange={setContractDialogOpen}
          tenantId={selectedTenant?.id || null}
        />

        <RoomAssignmentDialog
          open={isRoomAssignOpen}
          onOpenChange={setIsRoomAssignOpen}
          tenant={selectedTenant}
          onAssignRoom={assignRoom}
          isLoading={isAssigningRoom}
        />
      </div>
    </>
  );
};

export default TenantsPage;



