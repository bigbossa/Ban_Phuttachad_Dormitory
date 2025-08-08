
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Occupancy {
  id: string;
  room_id: string;
  tenant_id: string;
  check_in_date: string;
  rooms: {
    room_number: string;
    price: number;
  } | null;
  tenants: {
    first_name: string;
    last_name: string;
  } | null;
}

interface OccupancySelectorProps {
  occupancies: Occupancy[];
  selectedOccupancy: string;
  onOccupancyChange: (value: string) => void;
}

export default function OccupancySelector({ 
  occupancies, 
  selectedOccupancy, 
  onOccupancyChange 
}: OccupancySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="occupancy">เลือกห้องและผู้เช่า</Label>
      <Select value={selectedOccupancy} onValueChange={onOccupancyChange}>
        <SelectTrigger>
          <SelectValue placeholder="เลือกห้อง" />
        </SelectTrigger>
        <SelectContent>
          {occupancies.map((occ) => (
            <SelectItem key={occ.id} value={occ.id}>
              ห้อง {occ.rooms?.room_number || 'N/A'} - {occ.tenants?.first_name || ''} {occ.tenants?.last_name || ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
