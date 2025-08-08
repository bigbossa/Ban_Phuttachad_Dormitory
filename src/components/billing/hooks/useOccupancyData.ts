
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Occupancy {
  id: string;
  room_id: string;
  tenant_id: string;
  check_in_date: string;
  rooms: {
    room_number: string;
    price: number;
  } | null;
  tenants: {
    first_name: string;
    last_name: string;
  } | null;
}

export const useOccupancyData = (shouldFetch: boolean) => {
  const { toast } = useToast();
  const [occupancies, setOccupancies] = useState<Occupancy[]>([]);

  useEffect(() => {
    if (shouldFetch) {
      fetchOccupancies();
    }
  }, [shouldFetch]);

  const fetchOccupancies = async () => {
    try {
      const { data, error } = await supabase
        .from('occupancy')
        .select(`
          id,
          room_id,
          tenant_id,
          check_in_date,
          rooms!occupancy_room_id_fkey (
            room_number,
            price
          ),
          tenants!occupancy_tenant_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('is_current', true);

      if (error) {
        console.error('Error fetching occupancies:', error);
        toast({
          title: "Error",
          description: "Failed to fetch room occupancies",
          variant: "destructive",
        });
        return;
      }

      // Type-safe mapping with null checks
      const mappedOccupancies: Occupancy[] = (data || []).map(item => ({
        id: item.id,
        room_id: item.room_id,
        tenant_id: item.tenant_id,
        check_in_date: item.check_in_date,
        rooms: item.rooms || null,
        tenants: item.tenants || null
      }));

      setOccupancies(mappedOccupancies);
    } catch (err) {
      console.error('Error in fetchOccupancies:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { occupancies };
};
