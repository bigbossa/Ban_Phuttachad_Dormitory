import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BillingStatusBadge from "@/components/billing/BillingStatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import BillingEditDialog from "@/components/billing/components/BillingEditDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/providers/LanguageProvider";

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
  fullname: string | null;
  rooms: { room_number: string };
  tenants: { first_name: string; last_name: string };
}

interface BillingTableProps {
  billings: BillingRecord[];
  filteredBillings: BillingRecord[];
  onMarkAsPaid: (billingId: string) => void;
  onViewDetails: (billing: BillingRecord) => void;
  onPayClick: (billing: BillingRecord) => void;
}

export default function BillingTable({
  billings,
  filteredBillings,
  onMarkAsPaid,
  onViewDetails,
  onPayClick,
}: BillingTableProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isTenant = user?.role === 'tenant';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('th-TH');

  const formatMonth = (dateString: string) =>
    new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
    });

  const visibleBillings = filteredBillings.filter((billing) => {
    if (isAdmin || isStaff) return true;
    if (isTenant) return billing.tenant_id === user?.profile?.tenant_id;
    return false;
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null);
  const onEdit = (billing: BillingRecord) => {
    setSelectedBilling(billing);
    setOpenEditDialog(true);
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBillingForPayment, setSelectedBillingForPayment] = useState<BillingRecord | null>(null);

  const handleConfirmMarkAsPaid = (billing: BillingRecord) => {
    setSelectedBillingForPayment(billing);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (selectedBillingForPayment) {
      onMarkAsPaid(selectedBillingForPayment.id);
      setShowConfirmDialog(false);
      setSelectedBillingForPayment(null);
    }
  };

  const [billing, setBillings] = useState([]);
  const fetchBillings = async () => {
    const { data, error } = await supabase
      .from("billing")
      .select("*"); 

    if (!error) setBillings(data);
  };

  useEffect(() => {
    fetchBillings();
  }, []);

  

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("billing.listTitle")}</CardTitle>
        <CardDescription>
          {t("billing.showCount", { count: visibleBillings.length })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("billing.month")}</TableHead>
                <TableHead>{t("billing.receiptNumber")}</TableHead>
                <TableHead>{t("billing.tenant")}</TableHead>
                <TableHead>{t("billing.room")}</TableHead>
                <TableHead>{t("billing.roomRent")}</TableHead>
                <TableHead>{t("billing.waterCost")}</TableHead>
                <TableHead>{t("billing.electricityCost")}</TableHead>
                <TableHead>{t("billing.total")}</TableHead>
                <TableHead>{t("billing.dueDate")}</TableHead>
                <TableHead>{t("billing.status")}</TableHead>
                <TableHead>{t("billing.paidDate")}</TableHead>
                <TableHead className="text-right">{t("billing.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBillings.map((billing) => (
                <TableRow key={billing.id}>
                  <TableCell className="font-medium">{formatMonth(billing.billing_month)}</TableCell>
                  <TableCell className="font-medium">{billing.receipt_number || '-'}</TableCell>
                  <TableCell>{billing.fullname}</TableCell>
                  <TableCell>{billing.rooms.room_number}</TableCell>
                  <TableCell>{formatCurrency(billing.room_rent)}</TableCell>
                  <TableCell>
                    {formatCurrency(billing.water_cost)}
                    <div className="text-xs text-muted-foreground">{billing.water_units} {t("billing.personUnit")}</div>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(billing.electricity_cost)}
                    <div className="text-xs text-muted-foreground">{billing.electricity_units} {t("billing.electricityUnit")}</div>
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(billing.sum)}</TableCell>
                  <TableCell>{formatDate(billing.due_date)}</TableCell>
                  <TableCell><BillingStatusBadge status={billing.status} /></TableCell>
                  <TableCell>{billing.paid_date ? formatDate(billing.paid_date) : '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(billing)}>
                          {t("billing.viewDetails")}
                        </DropdownMenuItem>
                       {(isAdmin || isStaff) && billing.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => onEdit(billing)}>
                            {t("billing.edit")}
                          </DropdownMenuItem>
                        )}

                        {isAdmin && billing.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => handleConfirmMarkAsPaid(billing)}>
                            {t("billing.markAsPaid")}
                          </DropdownMenuItem>
                        )}
                        {isTenant && billing.status !== 'paid' && (
                          <DropdownMenuItem onClick={() => onPayClick(billing)}>
                            {t("billing.pay")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {visibleBillings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4">
                    {t("billing.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedBilling && (
          <BillingEditDialog
            open={openEditDialog}
            onOpenChange={setOpenEditDialog}
            billing={selectedBilling}
            onSave={() => {
              fetchBillings();
              setOpenEditDialog(false);
            }}
          />
        )}

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("billing.confirmMarkAsPaid")}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("billing.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAction}>
                {t("billing.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
