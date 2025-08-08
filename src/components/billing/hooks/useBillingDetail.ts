
import { useState } from "react";

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
  rooms: {
    room_number: string;
  };
  tenants: {
    first_name: string;
    last_name: string;
  };
}

export const useBillingDetail = () => {
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const openDetailDialog = (billing: BillingRecord) => {
    setSelectedBilling(billing);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedBilling(null);
  };

  return {
    selectedBilling,
    isDetailDialogOpen,
    openDetailDialog,
    closeDetailDialog,
    setIsDetailDialogOpen
  };
};
