
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSystemStats = () => {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      console.log('Fetching system stats...');
      
      // Get total rooms
      const { count: totalRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      // Get occupied rooms
      const { count: occupiedRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'occupied');

      // Get total tenants
      const { count: totalTenants } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true });

      // Get pending repairs
      const { count: pendingRepairs } = await supabase
        .from('repairs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate monthly revenue from current occupancy - fix the relationship query
      const { data: currentOccupancy } = await supabase
        .from('occupancy')
        .select(`
          room_id,
          rooms!occupancy_room_id_fkey(price)
        `)
        .eq('is_current', true);

      const monthlyRevenue = currentOccupancy?.reduce((total, occupancy) => {
        return total + (occupancy.rooms?.price || 0);
      }, 0) || 0;

      const stats = {
        totalRooms: totalRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        totalTenants: totalTenants || 0,
        pendingRepairs: pendingRepairs || 0,
        monthlyRevenue: monthlyRevenue
      };

      console.log('System stats fetched:', stats);
      return stats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
