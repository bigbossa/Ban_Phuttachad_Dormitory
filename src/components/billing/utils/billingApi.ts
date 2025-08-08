import { supabase } from "@/integrations/supabase/client";

// Simple receipt number generator function
const generateBasicReceiptNumber = () => {
  const timestamp = new Date().getTime();
  return `RCP${timestamp}`;
};

interface CreateRoomBillingParams {
  selectedRoomData: {
    room_id: string;
    room_number: string;
    room_price: number;
    occupant_count: number;
    occupants: Array<{
      tenant_id: string;
      tenant_name: string;
      occupancy_id: string;
    }>;
  };
  billingMonth: string;
  roomRent: number;
  waterUnits: number;
  waterCost: number;
  electricityUnits: number;
  electricityCost: number;
  totalAmount: number;
  dueDate: string;
  occupantCount: number;
}

export const createRoomBillingRecord = async (params: CreateRoomBillingParams) => {
  const {
    selectedRoomData,
    billingMonth,
    roomRent,
    waterUnits,
    waterCost,
    electricityUnits,
    electricityCost,
    totalAmount,
    dueDate
  } = params;

  // Create one billing record for the room (using the first occupant as representative)
  const primaryOccupant = selectedRoomData.occupants[0];
  
  // Get tenant details to create fullname
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('first_name, last_name')
    .eq('id', primaryOccupant.tenant_id)
    .single();

  if (tenantError) {
    console.error('Error fetching tenant details:', tenantError);
    throw new Error(tenantError.message);
  }

  const fullname = `${tenantData.first_name} ${tenantData.last_name}`;
  
  // Convert billingMonth from YYYY-MM-DD format to proper date string for database
  // If billingMonth is in YYYY-MM format, convert to YYYY-MM-01
  const billingDate = billingMonth.length === 7 ? billingMonth + '-01' : billingMonth;
  // Generate a basic receipt number
  const receiptNumber = generateBasicReceiptNumber();
  
  const { error } = await supabase
    .from('billing')
    .insert({
      room_id: selectedRoomData.room_id,
      tenant_id: primaryOccupant.tenant_id,
      occupancy_id: primaryOccupant.occupancy_id,
      billing_month: billingDate,
      room_rent: roomRent,
      water_units: waterUnits,
      water_cost: waterCost,
      electricity_units: electricityUnits,
      electricity_cost: electricityCost,      sum: totalAmount,
      due_date: dueDate,
      status: 'pending',
      receipt_number: receiptNumber,
      fullname: fullname
    });

  if (error) {
    console.error('Error creating billing record:', error);
    throw new Error(error.message);
  }
};
