
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { Database } from "@/integrations/supabase/types";
import { Action } from "@radix-ui/react-toast";


type Tenant = Database['public']['Tables']['tenants']['Row'] & {
    current_room?: {
    id: string;
    room_number: string;
    room_type: string;
    floor: number;
  } | null;
};
type TenantInsert = Database['public']['Tables']['tenants']['Insert']& {
   id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
};
type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

type RoomUpdate = Database['public']['Tables']['rooms']['Update']& {
   tenant_id?: string;
};

export const useTenants = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user , session} = useAuth();

  const {
    data: tenants = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      console.log('Fetching tenants...');
      
      // First get all tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) {
        console.error('Error fetching tenants:', tenantsError);
        throw tenantsError;
      }

      console.log('Tenants fetched:', tenantsData);

      // Then get current occupancy with room details for each tenant
      const tenantsWithRooms = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          const { data: occupancyData } = await supabase
            .from('occupancy')
            .select(`
              room_id,
              rooms!occupancy_room_id_fkey(
                id,
                room_number,
                room_type,
                floor
              )
            `)
            .eq('tenant_id', tenant.id)
            .eq('is_current', true)
            .maybeSingle();

          const current_room = occupancyData?.rooms ? {
            id: occupancyData.rooms.id,
            room_number: occupancyData.rooms.room_number,
            room_type: occupancyData.rooms.room_type,
            floor: occupancyData.rooms.floor,
          } : null;

          return {
            ...tenant,
            current_room
          };
        })
      );

      console.log('Tenants with room info:', tenantsWithRooms);
      return tenantsWithRooms;
    },
    enabled: !!user,
  });

const createTenantMutation = useMutation({
  mutationFn: async (newTenant: TenantInsert) => {
    // 1. Insert ลง tenants ก่อน
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        first_name: newTenant.first_name,
        last_name: newTenant.last_name,
        email: newTenant.email,
        phone: newTenant.phone,
        address: newTenant.address,
        emergency_contact: newTenant.emergency_contact || "",
        room_id: newTenant.room_id || "",
        room_number: newTenant.room_number || "",
        residents: newTenant.residents || "",
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 2. หา room_id และ capacity จาก room_number
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("id, capacity")
      .eq("room_number", tenantData.room_number)
      .single();

    if (roomError || !roomData) throw new Error("ไม่พบหมายเลขห้องในระบบ");

    const room_id = roomData.id;

    // 3. เช็คก่อนว่า tenant นี้ถูกผูกอยู่กับห้องนี้อยู่แล้วหรือไม่
    const { count: existingOccupancyCount, error: existingError } = await supabase
      .from("occupancy")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantData.id)
      .eq("room_id", room_id)
      .eq("is_current", true);

    if (existingError) throw existingError;

    if (existingOccupancyCount === 0) {
      // 4. Insert occupancy
      const { error: occupancyError } = await supabase
        .from("occupancy")
        .insert({
          tenant_id: tenantData.id,
          room_id: room_id,
          check_in_date: new Date().toISOString().split("T")[0],
          is_current: true,
        });

      if (occupancyError) throw occupancyError;
    }

    // 5. ดึง count ผู้เช่าปัจจุบันในห้องนี้
    const { count: currentOccupantCount, error: countError } = await supabase
      .from("occupancy")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room_id)
      .eq("is_current", true);

    if (countError) throw countError;

    // 👉 Debug log
    console.log(`ห้อง ${newTenant.room_number} มีผู้พักอาศัย ${currentOccupantCount}/${roomData.capacity}`);

   // 6. ถ้าผู้เช่าถึง capacity ค่อยอัปเดตสถานะห้อง
    if (currentOccupantCount >= roomData.capacity) {
      const { error: statusError } = await supabase
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", room_id);
      if (statusError) throw statusError;
    } else {
      // ถ้ายังไม่เต็ม ต้องอัปเดตกลับเป็น vacant เพื่อป้องกันขึ้นผิด
      await supabase
        .from("rooms")
        .update({ status: "vacant" })
        .eq("id", room_id);
    }

    return tenantData;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    queryClient.invalidateQueries({ queryKey: ["available-rooms-with-capacity"] });
    queryClient.invalidateQueries({ queryKey: ["system-stats"] });
    toast({
      title: "สำเร็จ",
      description: "เพิ่มผู้เช่าและเชื่อมห้องเรียบร้อยแล้ว",
    });
  },

  onError: (error) => {
    toast({
      title: "เกิดข้อผิดพลาด",
      description: error.message || "ไม่สามารถเพิ่มผู้เช่าได้",
      variant: "destructive",
    });
  },
});


  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TenantUpdate }) => {
      console.log('Updating tenant:', id, updates);
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tenant:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลผู้เช่าเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      console.error('Update tenant error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลผู้เช่าได้",
        variant: "destructive",
      });
    },
  });

const deleteTenantMutation = useMutation({
  mutationFn: async (tenantId: string) => {
    console.log("tenantId ที่จะลบ:", tenantId);

    // 1. ดึง tenant หลัก เพื่อหา room_id และ room_number
    const { data: tenant, error: tenantFetchError } = await supabase
      .from("tenants")
      .select("id, room_id, room_number")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenantFetchError || !tenant) {
      throw new Error("ไม่พบข้อมูลผู้เช่า");
    }

    const { room_id: roomId, room_number: roomNumber } = tenant;

    if (!roomId) {
      throw new Error("ผู้เช่าไม่มี room_id");
    }

    // 2. ดึง tenant ทุกคนที่อยู่ใน room เดียวกัน
    const { data: tenantsInRoom, error: tenantsError } = await supabase
      .from("tenants")
      .select("id")
      .eq("room_id", roomId);

    if (tenantsError || !tenantsInRoom) {
      throw new Error("ไม่สามารถดึงรายชื่อผู้เช่าในห้องนี้ได้");
    }

    const tenantIds = tenantsInRoom.map((t) => t.id);

    // 3. ดึง profiles ที่เชื่อมกับ tenant พวกนี้
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, tenant_id")
      .in("tenant_id", tenantIds);

    if (profilesError) {
      throw new Error("ไม่สามารถดึง profiles ได้");
    }

    const userIds = profiles.map((p) => p.id);

    // 4. ลบ tenant_id, staff_id ออกจาก profiles
    if (userIds.length > 0) {
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ tenant_id: null, staff_id: null })
        .in("id", userIds);

      if (updateProfileError) {
        throw new Error("ไม่สามารถล้าง tenant_id ใน profiles ได้");
      }
    }

    // 5. เช็คเอาต์จาก occupancy
    const { error: checkoutError } = await supabase
      .from("occupancy")
      .update({
        is_current: false,
        check_out_date: new Date().toISOString().split("T")[0],
      })
      .in("tenant_id", tenantIds)
      .eq("is_current", true);

    if (checkoutError) {
      throw new Error("ไม่สามารถอัปเดต check-out occupancy ได้");
    }

    // 6. ลบ room_id / room_number จาก tenants
    // const { error: clearTenantRoomError } = await supabase
    //   .from("tenants")
    //   .update({ room_id: "", room_number: "" })
    //   .in("id", tenantIds);

    // if (clearTenantRoomError) {
    //   throw new Error("ไม่สามารถลบความสัมพันธ์ห้องจาก tenants ได้");
    // }

    // 7. ลบ tenants
    const { error: deleteTenantError } = await supabase
      .from("tenants")
      .update({action: 2})
      .in("id", tenantIds);

    if (deleteTenantError) {
      throw new Error("ไม่สามารถลบผู้เช่าได้");
    }

    // 8. อัปเดตสถานะห้องเป็น vacant
    const { error: updateRoomStatusError } = await supabase
      .from("rooms")
      .update({ status: "vacant" })
      .eq("id", roomId);

    if (updateRoomStatusError) {
      throw new Error("ไม่สามารถอัปเดตสถานะห้องเป็นว่างได้");
    }
    // 9. ลบบัญชีผู้ใช้จาก Supabase Auth
  //   if (userIds.length > 0) {
  //     const resp = await fetch(
  //       "https://mnsotnlftoumjwjlvzus.functions.supabase.co/manage-auth-users",
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${session?.access_token}`,
  //           apikey: "YOUR_API_KEY", // ปรับให้ใช้จาก env ถ้าเป็น production
  //         },
  //         body: JSON.stringify({ user_ids: userIds }),
  //       }
  //     );

  //     if (!resp.ok) {
  //       const data = await resp.json();
  //       throw new Error(data.error || "ไม่สามารถลบบัญชีผู้ใช้ได้");
  //     }
  //   }
  // },

  // onSuccess: () => {
  //   queryClient.invalidateQueries({ queryKey: ["tenants"] });
  //   queryClient.invalidateQueries({ queryKey: ["rooms"] });
  //   toast({
  //     title: "สำเร็จ",
  //     description: "ลบผู้เช่าทั้งหมดในห้องนี้เรียบร้อยแล้ว",
  //   });
  // },

  // onError: (error: any) => {
  //   console.error("Delete tenant error:", error);
  //   toast({
  //     title: "เกิดข้อผิดพลาด",
  //     description: error.message || "ไม่สามารถลบผู้เช่าหรือบัญชีผู้ใช้ได้",
  //     variant: "destructive",
  //   });
      return "ลบผู้เช่าเรียบร้อยแล้ว";
  },

  onSuccess: (message) => {
    // อัปเดต query cache เพื่อรีเฟรชข้อมูล (ถ้าใช้ React Query)
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    queryClient.invalidateQueries({ queryKey: ["rooms"] });

    // แสดง toast แจ้งเตือน
    toast({
      title: "สำเร็จ",
      description: message || "ลบผู้เช่าทั้งหมดในห้องนี้เรียบร้อยแล้ว",
    });
  },

  onError: (error: any) => {
    console.error("Delete tenant error:", error);
    toast({
      title: "เกิดข้อผิดพลาด",
      description: error.message || "ไม่สามารถลบผู้เช่าหรือบัญชีผู้ใช้ได้",
      variant: "destructive",
    });
  },
});

const deleteRentedchildMutation = useMutation({
  mutationFn: async (tenantId: string) => {
    console.log("tenantId ที่จะลบ:", tenantId);

    // 1. ดึง tenant หลัก เพื่อหา room_id
    const { data: tenant, error: tenantFetchError } = await supabase
      .from("tenants")
      .select("id, room_id, room_number, residents")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenantFetchError || !tenant) {
      throw new Error("ไม่พบข้อมูลผู้เช่า");
    }

    const { room_id: roomId } = tenant;

    if (!roomId) {
      throw new Error("ผู้เช่าไม่มี room_id");
    }

    // 2. ดึง tenants ทั้งหมดในห้องเดียวกัน (พร้อม residents)
    const { data: tenantsInRoom, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, residents") 
      .eq("room_id", roomId);

    if (tenantsError || !tenantsInRoom) {
      throw new Error("ไม่สามารถดึงรายชื่อผู้เช่าในห้องนี้ได้");
    }

    // 3. กรองเฉพาะ tenant ที่เป็นลูกเช่า (มี residents และไม่ใช่ tenant หลัก)
    const rentedChildTenants = tenantsInRoom.filter(
      (t) => t.residents !== null && t.id !== tenantId
    );

    const tenantIdsToDelete = rentedChildTenants.map((t) => t.id);

    if (tenantIdsToDelete.length === 0) {
      throw new Error("ไม่มีลูกเช่าให้ลบในห้องนี้");
    }

    // 4. เช็คเอาต์จาก occupancy
    const { error: checkoutError } = await supabase
      .from("occupancy")
      .update({
        is_current: false,
        check_out_date: new Date().toISOString().split("T")[0],
      })
      .in("tenant_id", tenantIdsToDelete)
      .eq("is_current", true);

    if (checkoutError) {
      throw new Error("ไม่สามารถอัปเดต check-out occupancy ได้");
    }

    // 5. ลบ tenants
    const { error: deleteTenantError } = await supabase
      .from("tenants")
      .update({action: 2})
      .in("id", tenantIdsToDelete);

    if (deleteTenantError) {
      throw new Error("ไม่สามารถลบผู้เช่าได้");
    }
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
    window.location.reload();
    toast({
      title: "สำเร็จ",
      description: "ลบลูกเช่าทั้งหมดในห้องนี้เรียบร้อยแล้ว",
    });
  },

  onError: (error: any) => {
    console.error("Delete tenant error:", error);
    toast({
      title: "เกิดข้อผิดพลาด",
      description: error.message || "ไม่สามารถลบลูกเช่าหรือบัญชีผู้ใช้ได้",
      variant: "destructive",
    });
  },
});


const assignRoomMutation = useMutation({
  mutationFn: async ({ tenantId, roomId }: { tenantId: string; roomId: string }) => {
    console.log('Assigning room:', { tenantId, roomId });

    // 1. ดึงข้อมูลห้อง
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('capacity, room_number')
      .eq('id', roomId)
      .single();

    if (roomError) throw roomError;

    // 2. นับจำนวนผู้เช่าในห้องนี้ (is_current = true)
    const { data: currentOccupancy, error: occupancyError } = await supabase
      .from('occupancy')
      .select('tenant_id')
      .eq('room_id', roomId)
      .eq('is_current', true);

    if (occupancyError) throw occupancyError;

    const currentOccupants = currentOccupancy?.length || 0;
    if (currentOccupants >= roomData.capacity) {
      throw new Error('ห้องนี้เต็มแล้ว ไม่สามารถเพิ่มผู้เช่าได้');
    }

    // 3. เช็คเอาต์จากห้องเดิม (ถ้ามี)
    await supabase
      .from('occupancy')
      .update({
        is_current: false,
        check_out_date: new Date().toISOString().split('T')[0],
      })
      .eq('tenant_id', tenantId)
      .eq('is_current', true);

    // 4. เช็คอินห้องใหม่
    const { data, error } = await supabase
      .from('occupancy')
      .insert({
        tenant_id: tenantId,
        room_id: roomId,
        check_in_date: new Date().toISOString().split('T')[0],
        is_current: true,
      })
      .select()
      .single();

    if (error) throw error;

    // 5. อัปเดต tenant ด้วย room_number
    const { error: updateTenantError } = await supabase
      .from('tenants')
      .update({ room_number: roomData.room_number ,room_id: roomId})
      .eq('id', tenantId);

    if (updateTenantError) throw updateTenantError;

    // ✅ ลบ tenant_id ออกจากห้องเก่า (ถ้ามี) → ข้ามขั้นตอนนี้ เพราะเราไม่ใช้ tenant_id ใน rooms แล้ว

    // 6. อัปเดตสถานะห้องเป็น occupied เสมอ
    await supabase
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', roomId);


    return data;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tenants'] });
    queryClient.invalidateQueries({ queryKey: ['available-rooms-with-capacity'] });
    queryClient.invalidateQueries({ queryKey: ['system-stats'] });
    toast({
      title: "สำเร็จ",
      description: "กำหนดห้องให้ผู้เช่าเรียบร้อยแล้ว",
    });
  },

  onError: (error) => {
    toast({
      title: "เกิดข้อผิดพลาด",
      description: error.message || "ไม่สามารถกำหนดห้องได้",
      variant: "destructive",
    });
  },
});

  return {
    tenants,
    isLoading,
    error,
    createTenant: createTenantMutation.mutate,
    updateTenant: updateTenantMutation.mutate,
    deleteTenant: deleteTenantMutation.mutate,
    deleteRentedchild: deleteRentedchildMutation.mutate,
    assignRoom: (tenantId: string, roomId: string) => assignRoomMutation.mutate({ tenantId, roomId }),
    isCreating: createTenantMutation.isPending,
    isUpdating: updateTenantMutation.isPending,
    isDeleting: deleteTenantMutation.isPending,
    isAssigningRoom: assignRoomMutation.isPending,
  };
};
