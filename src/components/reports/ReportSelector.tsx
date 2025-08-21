import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Wrench, TrendingUp } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

interface ReportItem {
  id: string;
  titleKey: string;
  icon: React.ElementType;
  descriptionKey: string;
}

const availableReports: ReportItem[] = [
  {
    id: "revenue",
    titleKey: "reports.revenueTitle",
    icon: DollarSign,
    descriptionKey: "reports.revenueDesc",
  },
  {
    id: "revenueYearly",
    titleKey: "reports.revenueYearlyTitle",
    icon: TrendingUp,
    descriptionKey: "reports.revenueYearlyDesc",
  },
  {
    id: "repairs",
    titleKey: "reports.repairTitle",
    icon: Wrench,
    descriptionKey: "reports.repairDesc",
  },
];

interface ReportSelectorProps {
  selectedReport: string;
  setSelectedReport: (value: string) => void;
}

export const ReportSelector = ({
  selectedReport,
  setSelectedReport,
}: ReportSelectorProps) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("reports.options")}</CardTitle>
        <CardDescription>{t("reports.selectType")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <label className="text-sm font-medium mb-1 block">
            {t("reports.type")}
          </label>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger>
              <SelectValue placeholder={t("reports.selectTypePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {availableReports.map((report) => (
                <SelectItem key={report.id} value={report.id}>
                  <span className="flex items-center gap-2">
                    <report.icon className="h-4 w-4" />
                    {t(report.titleKey)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              availableReports.find((r) => r.id === selectedReport)
                ?.descriptionKey || "reports.selectTypeDesc"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
