import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BillingStatusBadge from "../BillingStatusBadge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import React from "react";

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
  rooms: {
    room_number: string;
  };
  tenants: {
    first_name: string;
    last_name: string;
  };
}

interface BillingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billing: BillingRecord | null;
}

export default function BillingDetailDialog({ 
  open, 
  onOpenChange, 
  billing 
}: BillingDetailDialogProps) {
  if (!billing) return null;

  const printRef = React.useRef<HTMLDivElement>(null);
  const fullname = `${billing.tenants.first_name} ${billing.tenants.last_name}`;

  const handlePrint = () => {
    // TODO: Customize print style for receipt only
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle className="flex items-center gap-2">
                รายละเอียดบิล - {formatMonth(billing.billing_month)}
                <BillingStatusBadge status={billing.status} />
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-1">
                  <p>เลขที่ใบเสร็จ: {billing.receipt_number || '-'}</p>
                  <p>บิลสำหรับห้อง {billing.rooms.room_number} - {fullname}</p>
                </div>
              </DialogDescription>
              <Button variant="outline" size="sm" onClick={handlePrint} className="ml-4">
                <Printer className="mr-2" size={16} />
                ปริ้นใบเสร็จ
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div ref={printRef} className="space-y-6">
          {/* ข้อมูลผู้เช่าและห้อง */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลผู้เช่า</CardTitle>
            </CardHeader>            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">เลขที่ใบเสร็จ</p>
                <p className="text-base">{billing.receipt_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">หมายเลขห้อง</p>
                <p className="text-base">{billing.rooms.room_number}</p>
              </div>              <div>
                <p className="text-sm font-medium text-muted-foreground">ชื่อผู้เช่า</p>
                <p className="text-base">{fullname}</p>
              </div>
            </CardContent>
          </Card>

          {/* รายละเอียดค่าใช้จ่าย */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายละเอียดค่าใช้จ่าย</CardTitle>
              <CardDescription>
                ประจำเดือน {formatMonth(billing.billing_month)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>ค่าห้อง</span>
                <span className="font-medium">{formatCurrency(billing.room_rent)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span>ค่าน้ำ</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({billing.water_units} คน × 100 บาท)
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(billing.water_cost)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span>ค่าไฟ</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({billing.electricity_units} หน่วย × 8 บาท)
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(billing.electricity_cost)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>รวมทั้งสิ้น</span>
                <span className="text-primary">{formatCurrency(billing.sum)}</span>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลการชำระเงิน */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันครบกำหนดชำระ</p>
                <p className="text-base">{formatDate(billing.due_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันที่ชำระ</p>
                <p className="text-base">
                  {billing.paid_date ? formatDate(billing.paid_date) : "ยังไม่ได้ชำระ"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">สถานะ</p>
                <div className="mt-1">
                  <BillingStatusBadge status={billing.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันที่สร้างบิล</p>
                <p className="text-base">{formatDate(billing.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
