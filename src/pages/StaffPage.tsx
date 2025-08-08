import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { Users, Plus, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StaffFormDialog from "@/components/staff/StaffFormDialog";
import { StaffCreateDialog } from "@/components/auth/StaffCreateDialog";
import StaffDetailsDialog from "@/components/staff/StaffDetailsDialog";
import { useStaffs } from "@/hooks/useStaffs";
import { Database } from "@/integrations/supabase/types";

type Staff = Database['public']['Tables']['staffs']['Row'];

interface UserManagementDialogProps {
  children: React.ReactNode;
}

const StaffPage = ({ children }: UserManagementDialogProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);

 const {
  staffs,
  isLoading,
  createStaff,
  updateStaff,
  deleteStaff,
  isCreating,
  isUpdating,
  isDeleting,
} = useStaffs();

  // Filter staff based on search term
 const filteredStaffs = staffs.filter(staff => {
  if (staff.status !== "1") return false;

  const fullName = `${staff.first_name} ${staff.last_name}`.toLowerCase();
  const email = staff.email?.toLowerCase() || "";
  const phone = staff.phone?.toLowerCase() || "";
  const department = staff.department?.toLowerCase() || "";
  const search = searchTerm.toLowerCase();

  return (
    fullName.includes(search) ||
    email.includes(search) ||
    phone.includes(search) ||
    department.includes(search)
  );
});


 const handleAddStaff = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };

    const handleViewDetails = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDetailsOpen(true);
  };

   const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  const handleDeleteStaff = (staff: Staff) => {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบ ${staff.first_name} ${staff.last_name}?`)) {
      deleteStaff(staff.id);
    }
  };

  const handleFormSubmit = (data: Database['public']['Tables']['staffs']['Insert']) => {
      if (editingStaff) {
        updateStaff({ id: editingStaff.id, updates: data });
      } else {
        createStaff(data);
      }
    };
  
  if (isLoading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูลพนักงาน...</p>
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
                <DialogTitle>จัดการผู้ใช้ระบบ</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
    
          {/* User Create Dialog */}
          <StaffCreateDialog
            open={createUserOpen}
            onOpenChange={setCreateUserOpen}
            onSuccess={() => {
              // Refresh data if needed
            }}
          />
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">จัดการพนักงาน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลพนักงานและบทบาทในหอพัก</p>
        </div>
         <div className="mt-4 md:mt-0">
          <Button  onClick={() => {
                setIsOpen(false);
                setCreateUserOpen(true);
              }}
               className="flex items-center gap-2">
            <Plus size={16} />
            เพิ่มพนักงานใหม่
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ค้นหาพนักงาน</CardTitle>
          <CardDescription>
            ค้นหาพนักงานตามชื่อ อีเมล เบอร์โทร หรือแผนก
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="ค้นหาพนักงาน..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อพนักงาน</CardTitle>
          <CardDescription>
            แสดง {filteredStaffs.length} จาก {staffs.filter(t =>  t.status == "1").length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
              <TableHead>ชื่อพนักงาน</TableHead>
              <TableHead>เบอร์โทร</TableHead>
              <TableHead>ที่อยู่</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaffs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground font-semibold">
                        ไม่พบข้อมูลพนักงาน
                      </p>
                      <p className="text-muted-foreground text-sm">
                        ไม่มีข้อมูลในตารางพนักงาน
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaffs.map((staff) => {
                  const fullName = `${staff.first_name} ${staff.last_name}`;
                  return (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`} 
                              alt={fullName} 
                            />
                            <AvatarFallback>
                              {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{fullName}</p>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{staff.phone || "-"}</TableCell>
                      <TableCell>{staff.address || "-"}</TableCell>
                      <TableCell>
                        {staff.created_at
                          ? new Date(staff.created_at).toLocaleDateString("th-TH")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(staff)}>
                                <Eye className="mr-2 h-4 w-4" />
                                ดูรายละเอียด
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                                <Edit className="mr-2 h-4 w-4" />
                                แก้ไข
                              </DropdownMenuItem>
                           <DropdownMenuItem 
                              onClick={() => handleDeleteStaff(staff)}
                              className="text-destructive"
                              disabled={isDeleting}
                              >
                              <Trash2 className="mr-2 h-4 w-4" />
                               ลบ
                           </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

       <StaffFormDialog
         open={isFormOpen}
         onOpenChange={setIsFormOpen}
         staff={editingStaff}
         onSubmit={handleFormSubmit}
         isLoading={isCreating || isUpdating}
       />
      
      <StaffDetailsDialog
         open={isDetailsOpen}
         onOpenChange={setIsDetailsOpen}
         staff={selectedStaff}
      />
    </div>
    </>
  );
}

export default StaffPage;