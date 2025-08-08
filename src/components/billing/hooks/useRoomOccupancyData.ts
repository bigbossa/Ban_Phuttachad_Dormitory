import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useRoomOccupancyData = (shouldFetch: boolean) => {
  const { toast } = useToast();
  const [roomOccupancies, setRoomOccupancies] = useState<any[]>([]);

  useEffect(() => {
    if (shouldFetch) {
      fetchRoomOccupancies();
    }
    // eslint-disable-next-line
  }, [shouldFetch]);

  const fetchRoomOccupancies = async () => {
    try {
      // 1. ดึง occupancy
      const { data: occupancyData, error: occErr } = await supabase
        .from('occupancy')
        .select('*')
        .eq('is_current', true);

      if (occErr) throw occErr;

      // 2. ดึง rooms
      const { data: roomsData, error: roomErr } = await supabase
        .from('rooms')
        .select('id, room_number, price, latest_meter_reading');

      if (roomErr) throw roomErr;

      // 3. ดึง tenants
      const { data: tenantsData, error: tenErr } = await supabase
        .from('tenants')
        .select('id, first_name, last_name');

      if (tenErr) throw tenErr;

      // 4. รวมข้อมูล (group by room)
      const roomMap = new Map<string, any>();
      (occupancyData || []).forEach(item => {
          const room = roomsData.find(r => r.id === item.room_id);
          const tenant = tenantsData.find(t => t.id === item.tenant_id);

          if (!roomMap.has(item.room_id)) {
            roomMap.set(item.room_id, {
              room_id: item.room_id,
              room_number: room?.room_number || 'N/A',
              room_price: room?.price || 0,
              occupant_count: 0,
              latest_meter_reading: room?.latest_meter_reading || 0, 
              occupants: []
            });
          }

          const roomObj = roomMap.get(item.room_id);
          roomObj.occupant_count += 1;
          roomObj.occupants.push({
            tenant_id: item.tenant_id,
            tenant_name: `${tenant?.first_name || ''} ${tenant?.last_name || ''}`.trim(),
            occupancy_id: item.id
          });

        if (item.latest_meter_reading && item.latest_meter_reading > roomObj.latest_meter_reading) {
          roomObj.latest_meter_reading = item.latest_meter_reading;
        }
      });

      setRoomOccupancies(Array.from(roomMap.values()));
    } catch (err) {
      console.error('Error in fetchRoomOccupancies:', err);
      toast({
        title: "Error",
        description: "Failed to fetch room occupancies",
        variant: "destructive",
      });
    }
  };

  return { roomOccupancies };
};