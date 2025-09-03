import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/LanguageProvider";

interface BillingStatusBadgeProps {
  status: string;
}

export default function BillingStatusBadge({
  status,
}: BillingStatusBadgeProps) {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return t("billing.status_paid");
      case "pending":
        return t("billing.status_pending");
      case "overdue":
        return t("billing.status_overdue");
      default:
        return status;
    }
  };

  return (
    <Badge className={`capitalize ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </Badge>
  );
}
