import BillingCalculationDialog from "@/components/billing/BillingCalculationDialog";
import BillingHeader from "@/components/billing/components/BillingHeader";
import BillingFilters from "@/components/billing/components/BillingFilters";
import BillingTable from "@/components/billing/components/BillingTable";
import BillingDetailDialog from "@/components/billing/components/BillingDetailDialog";
import BillingPaymentDialog from "@/components/billing/components/BillingPaymentDialog";
import { useBillingPage } from "@/components/billing/hooks/useBillingPage";
import { useBillingDetail } from "@/components/billing/hooks/useBillingDetail";
import * as XLSX from "xlsx";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/providers/LanguageProvider";

const BillingPage = () => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const {
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
    handleMarkAsPaid
  } = useBillingPage();

  const {
    selectedBilling,
    isDetailDialogOpen,
    openDetailDialog,
    closeDetailDialog,
    setIsDetailDialogOpen
  } = useBillingDetail();
  const exportToExcel = () => {
    const data = filteredBillings.map((billing) => ({
      [t("billing.month")]: new Date(billing.billing_month).toLocaleDateString("th-TH", { year: "numeric", month: "long" }),
      [t("billing.receiptNumber")]: billing.receipt_number || "-",
      [t("billing.tenantName")]: `${billing.tenants.first_name} ${billing.tenants.last_name}`,
      [t("billing.room")]: billing.rooms.room_number,
      [t("billing.roomRent")]: billing.room_rent,
      [t("billing.waterCost")]: billing.water_cost,
      [t("billing.electricityCost")]: billing.electricity_cost,
      [t("billing.total")]: billing.sum,
      [t("billing.dueDate")]: new Date(billing.due_date).toLocaleDateString("th-TH"),
      [t("billing.status")]: billing.status,
      [t("billing.paidDate")]: billing.paid_date ? new Date(billing.paid_date).toLocaleDateString("th-TH") : t("billing.notPaid"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Billings");
    XLSX.writeFile(wb, "billings.xlsx");
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentDialog(false);
    await fetchBillings();
    toast({
      title: t("billing.paymentSuccess"),
      description: t("billing.paymentSuccessDesc"),
    });
  };

  const handlePayClick = (billing: any) => {
    openDetailDialog(billing);
    setShowPaymentDialog(true);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get("success");
  const paymentCanceled = urlParams.get("canceled");
  const billingId = urlParams.get("billing_id");

  if (paymentSuccess && billingId) {
    window.location.replace(`/payment-success?billing_id=${billingId}`);
  }
  if (paymentCanceled) {
    window.location.replace(`/payment-canceled`);
  }

  if (loading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <BillingHeader onOpenCalculationDialog={() => setShowCalculationDialog(true)} exportToExcel={exportToExcel} />

      <BillingFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <BillingTable
        billings={billings}
        filteredBillings={filteredBillings}
        onMarkAsPaid={handleMarkAsPaid}
        onViewDetails={openDetailDialog}
        onPayClick={handlePayClick}
      />

      <BillingCalculationDialog
        open={showCalculationDialog}
        onOpenChange={setShowCalculationDialog}
        onBillingCreated={fetchBillings}
      />

      <BillingDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        billing={selectedBilling}
      />

      <BillingPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        billing={selectedBilling}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BillingPage;
