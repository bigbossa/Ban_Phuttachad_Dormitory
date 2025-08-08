import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { Database } from "@/integrations/supabase/types";

type Staff = Database['public']['Tables']['staffs']['Row'] ;

type StaffInsert = Database['public']['Tables']['staffs']['Insert'] & {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
};
type StaffUpdate = Database['public']['Tables']['staffs']['Update'];

export const useStaffs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, session } = useAuth();

  const {
    data: staffs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['staffs'],
    queryFn: async () => {
    console.log('Fetching staffs...');

      const { data, error } = await supabase
        .from('staffs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching staffs:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user,
  });

 const createStaffMutation = useMutation({
       mutationFn: async (newStaff: StaffInsert) => {
         console.log('Creating staff with:', newStaff);

         const { data, error } = await supabase
           .from('staffs')
           .insert({
             first_name: newStaff.first_name,
             last_name: newStaff.last_name,
             email: newStaff.email,
             phone: newStaff.phone,
             address: newStaff.address,
             emergency_contact: newStaff.emergency_contact || '',
           })
           .select()
           .single();
 
         if (error) {
           console.error('Error creating staff:', error);
           throw error;
         }
 
         return data;
       },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['staffs'] });
       toast({
         title: "สำเร็จ",
         description: "เพิ่มพนักงานใหม่เรียบร้อยแล้ว",
       });
     },
     onError: (error) => {
       console.error('Create staff error:', error);
       toast({
         title: "เกิดข้อผิดพลาด",
         description: "ไม่สามารถเพิ่มพนักงานได้",
         variant: "destructive",
       });
     },
   });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: StaffUpdate }) => {
      console.log('Updating tenant:', id, updates);
      const { data, error } = await supabase
        .from('staffs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating staff:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
      toast({
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลพนักงานเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      console.error('Update staff error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลพนักงานได้",
        variant: "destructive",
      });
    },
  });

const deleteStaffMutation = useMutation({
  mutationFn: async (staffId: string) => {
    console.log('staffId ที่จะส่งไปลบ:', staffId);

   const { data, error } = await supabase
  .from('staffs')
  .update({ status: "2" })
  .eq('id', staffId)
  .select()

  console.log('Update result data:', data);
  console.log('Update error:', error);
    if (error) {
      throw error;
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['staffs'] });
    toast({
      title: "สำเร็จ",
      description: "ลบพนักงานเรียบร้อยแล้ว ",
    });
  },
  onError: (error) => {
    console.error('Delete staff error:', error);
    toast({
      title: "เกิดข้อผิดพลาด",
      description: "ไม่สามารถลบพนักงานได้",
      variant: "destructive",
    });
  },
});

  return {
    staffs,
    isLoading,
    error,
    createStaff: createStaffMutation.mutate,
    updateStaff: updateStaffMutation.mutate,
    deleteStaff: deleteStaffMutation.mutate,
    isCreating: createStaffMutation.isPending,
    isUpdating: updateStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending,
  };
};