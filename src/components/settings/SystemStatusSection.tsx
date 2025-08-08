
import { Badge } from "@/components/ui/badge";

export function SystemStatusSection() {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">สถานะระบบ</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">ฐานข้อมูล</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ปกติ
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">การเชื่อมต่อ</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ปกติ
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">พื้นที่จัดเก็บข้อมูล</span>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            ใช้ไป 65%
          </Badge>
        </div>
      </div>
    </div>
  );
}
