import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BillingRecord {
  id: string;
  billing_month: string;
  tenant_id: string;
  room_rent: number;
  water_units: number;
  water_cost: number;
  electricity_units: number;
  electricity_cost: number;
  sum: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  receipt_number: string;
  rooms: {
    room_number: string;
  };
  tenants: {
    first_name: string;
    last_name: string;
  };
}

export const useBillingPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [billings, setBillings] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculationDialog, setShowCalculationDialog] = useState(false);

  const fetchBillings = useCallback(async () => {
    try {
      setLoading(true);

      // 1. ดึงข้อมูล billing ทั้งหมด
      const { data: billingData, error: billingError } = await supabase
        .from('billing')
        .select('*')
        .order('created_at', { ascending: false });
      if (billingError) throw billingError;

      // 2. ดึงข้อมูล rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, room_number');
      if (roomsError) throw roomsError;

      // 3. ดึงข้อมูล tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, first_name, last_name');
      if (tenantsError) throw tenantsError;

      // 4. ประกบข้อมูลเข้ากับ billing
      const result = (billingData || []).map(bill => ({
        ...bill,
        rooms: roomsData?.find(r => String(r.id) === String(bill.room_id)) || { room_number: '-' },
        tenants: tenantsData?.find(t => String(t.id) === String(bill.tenant_id)) || { first_name: '-', last_name: '-' }
      }));

      setBillings(result);
    } catch (err) {
      console.error('Error in fetchBillings:', err);
      toast({
        title: "Error",
        description: "Failed to fetch billing records",
        variant: "destructive",
      });
      setBillings([]); // กันไว้ไม่ให้เป็น undefined
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  const filteredBillings = billings.filter(billing => {
    const billingDate = new Date(billing.billing_month);
    const matchesSearch = 
      billing.tenants.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.tenants.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (`${billing.tenants.first_name} ${billing.tenants.last_name}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.rooms.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || billing.status === statusFilter;
    
    const matchesMonth = 
      billingDate.getMonth() === selectedMonth.getMonth() && 
      billingDate.getFullYear() === selectedMonth.getFullYear();
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleMarkAsPaid = async (billingId: string) => {
    try {
      const { error } = await supabase
        .from('billing')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', billingId);

      if (error) {
        console.error('Error updating billing status:', error);
        toast({
          title: "Error",
          description: "Failed to update payment status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Payment Updated",
        description: "Billing marked as paid successfully",
      });

      fetchBillings();
    } catch (err) {
      console.error('Error in handleMarkAsPaid:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    billings,
    filteredBillings,
    loading,
    showCalculationDialog,
    setShowCalculationDialog,
    fetchBillings,
    handleMarkAsPaid,
  };
};
