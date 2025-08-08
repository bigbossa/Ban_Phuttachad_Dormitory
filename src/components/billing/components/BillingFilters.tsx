import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Label } from "@/components/ui/label";

interface BillingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  selectedMonth: Date;
  onMonthChange: (value: Date) => void;
}

export default function BillingFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedMonth,
  onMonthChange
}: BillingFiltersProps) {
  // Format date to YYYY-MM for input type="month"
  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 7);
  };

  // Handle month input change
  const handleMonthChange = (value: string) => {
    const date = new Date(value + "-01"); // Add day to make valid date
    onMonthChange(date);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>ค้นหาและกรอง</CardTitle>
        <CardDescription>
          ค้นหาบิลตามชื่อผู้เช่าหรือหมายเลขห้อง และกรองตามเดือน/ปี
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="ค้นหาบิล..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="md:max-w-xs"
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="กรองตามสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="paid">ชำระแล้ว</SelectItem>
                  <SelectItem value="pending">รอชำระ</SelectItem>
                  <SelectItem value="overdue">เกินกำหนด</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Input
                id="billingMonth"
                type="month"
                value={formatDateForInput(selectedMonth)}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
