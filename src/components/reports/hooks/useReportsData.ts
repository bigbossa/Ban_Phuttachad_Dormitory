import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type RoomTypeData = {
  name: string;
  value: number;
  color: string;
};

type OccupancyData = {
  month: string;
  occupancy: number;
};

type RevenueData = {
  month: string;
  revenue: number;
};

type EventAttendanceData = {
  month: string;
  events: number;
  attendees: number;
  averageAttendance: number;
};

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#64748b"];

export const useReportsData = (selectedReport: string) => {
  const [roomTypeDistribution, setRoomTypeDistribution] = useState<RoomTypeData[]>([]);
  const [repairTypeDistribution, setRepairTypeDistribution] = useState<RoomTypeData[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [eventAttendanceData, setEventAttendanceData] = useState<EventAttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoomTypeDistribution = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('room_type');
        
        if (error) {
          console.error('Error fetching room types:', error);
          return;
        }

        if (data && data.length) {
          const roomTypeCounts: { [key: string]: number } = {};
          data.forEach((room) => {
            roomTypeCounts[room.room_type] = (roomTypeCounts[room.room_type] || 0) + 1;
          });

          const formattedData: RoomTypeData[] = Object.entries(roomTypeCounts).map(([roomType, count], index) => ({
            name: roomType,
            value: count,
            color: colors[index % colors.length]
          }));
          
          setRoomTypeDistribution(formattedData);
        }
      } catch (err) {
        console.error('Error in fetchRoomTypeDistribution:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRepairStatusDistribution = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('repairs')
          .select('status');
        
        if (error) {
          console.error('Error fetching repair statuses:', error);
          return;
        }

        if (data && data.length) {
          const repairStatusCounts: { [key: string]: number } = {};
          data.forEach((repair) => {
            repairStatusCounts[repair.status] = (repairStatusCounts[repair.status] || 0) + 1;
          });

          const formattedData: RoomTypeData[] = Object.entries(repairStatusCounts).map(([repairStatus, count], index) => ({
            name: repairStatus.charAt(0).toUpperCase() + repairStatus.slice(1),
            value: count,
            color: colors[index % colors.length]
          }));
          
          setRepairTypeDistribution(formattedData);
        }
      } catch (err) {
        console.error('Error in fetchRepairStatusDistribution:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchOccupancyData = async () => {
      setIsLoading(true);
      try {
        // Get total rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('id');

        if (roomsError) {
          console.error('Error fetching rooms:', roomsError);
          return;
        }

        const totalRooms = roomsData?.length || 0;

        // Get occupancy data for the last 12 months
        const monthlyData: OccupancyData[] = [];
        const today = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
          
          const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

          const { data: occupancyData, error: occupancyError } = await supabase
            .from('occupancy')
            .select('room_id')
            .lte('check_in_date', endOfMonth.toISOString().split('T')[0])
            .or(`check_out_date.is.null,check_out_date.gte.${startOfMonth.toISOString().split('T')[0]}`);

          if (occupancyError) {
            console.error('Error fetching occupancy data:', occupancyError);
            continue;
          }

          const occupiedRooms = occupancyData?.length || 0;
          const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

          monthlyData.push({
            month: monthName,
            occupancy: occupancyRate
          });
        }

        setOccupancyData(monthlyData);
      } catch (err) {
        console.error('Error in fetchOccupancyData:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRevenueData = async () => {
      setIsLoading(true);
      try {
        const monthlyData: RevenueData[] = [];
        const today = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
          
          const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

          const { data: billingData, error: billingError } = await supabase
            .from('billing')
            .select('sum')
            .eq('status', 'paid') 
            .gte('billing_month', startOfMonth.toISOString().split('T')[0])
            .lte('billing_month', endOfMonth.toISOString().split('T')[0]);
          if (billingError) {
            console.error('Error fetching billing data:', billingError);
            continue;
          }

          const totalRevenue = billingData?.reduce((total, bill) => total + Number(bill.sum), 0) || 0;

          monthlyData.push({
            month: monthName,
            revenue: totalRevenue
          });
        }

        setRevenueData(monthlyData);
      } catch (err) {
        console.error('Error in fetchRevenueData:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEventAttendanceData = async () => {
      setIsLoading(true);
      try {
        const monthlyData: EventAttendanceData[] = [];
        const today = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
          
          const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

          // Get events in this month
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('id')
            .gte('event_date', startOfMonth.toISOString().split('T')[0])
            .lte('event_date', endOfMonth.toISOString().split('T')[0]);

          if (eventsError) {
            console.error('Error fetching events:', eventsError);
            continue;
          }

          const eventIds = eventsData?.map(event => event.id) || [];
          let totalAttendees = 0;

          if (eventIds.length > 0) {
            // Get attendance for these events
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('event_attendance')
              .select('id')
              .in('event_id', eventIds)
              .eq('attended', true);

            if (attendanceError) {
              console.error('Error fetching attendance:', attendanceError);
            } else {
              totalAttendees = attendanceData?.length || 0;
            }
          }

          const averageAttendance = eventIds.length > 0 ? Math.round(totalAttendees / eventIds.length) : 0;

          monthlyData.push({
            month: monthName,
            events: eventIds.length,
            attendees: totalAttendees,
            averageAttendance: averageAttendance
          });
        }

        setEventAttendanceData(monthlyData);
      } catch (err) {
        console.error('Error in fetchEventAttendanceData:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedReport === 'rooms') {
      fetchRoomTypeDistribution();
    } else if (selectedReport === 'repairs') {
      fetchRepairStatusDistribution();
    } else if (selectedReport === 'occupancy') {
      fetchOccupancyData();
    } else if (selectedReport === 'revenue') {
      fetchRevenueData();
    } else if (selectedReport === 'events') {
      fetchEventAttendanceData();
    }

  }, [selectedReport]);

  return {
    roomTypeDistribution,
    repairTypeDistribution,
    occupancyData,
    revenueData,
    eventAttendanceData,
    isLoading
  };
};
