import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  Wrench,
  Calendar,
  FileBarChart,
} from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

const availableReports: ReportItem[] = [
  {
    id: "occupancy",
    title: "Occupancy Trends",
    icon: Users,
    description: "Monthly dormitory occupancy rates"
  },
  {
    id: "revenue",
    title: "Revenue Analysis",
    icon: DollarSign,
    description: "Monthly revenue breakdown"
  },
  {
    id: "rooms",
    title: "Room Type Distribution",
    icon: FileBarChart,
    description: "Distribution of different room types"
  },
  {
    id: "repairs",
    title: "Repair Request Analysis",
    icon: Wrench,
    description: "Types of repair requests received"
  },
  {
    id: "events",
    icon: Calendar,
    title: "Event Attendance",
    description: "Dormitory event participation metrics"
  },
];



interface ReportSelectorProps {
  selectedReport: string;
  setSelectedReport: (value: string) => void;
}

export const ReportSelector = ({ 
  selectedReport, 
  setSelectedReport
}: ReportSelectorProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Report Options</CardTitle>
        <CardDescription>
          Select the report type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <label className="text-sm font-medium mb-1 block">Report Type</label>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {availableReports.map(report => (
                <SelectItem key={report.id} value={report.id}>
                  <span className="flex items-center gap-2">
                    <report.icon className="h-4 w-4" />
                    {report.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {availableReports.find(r => r.id === selectedReport)?.description || 'Select a report type to view data'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
