import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserCreateDialog } from "@/components/auth/UserCreateDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * ตัวอย่างการใช้งานฟีเจอร์การสร้างบัญชีผู้ใช้ใหม่
 *
 * ฟีเจอร์นี้จะ:
 * 1. แสดงเฉพาะห้องที่ไม่มีคนเช่าเลย
 * 2. ตรวจสอบสถานะห้องก่อนสร้างบัญชี
 * 3. อัปเดตสถานะห้องหลังจากสร้างบัญชีสำเร็จ
 */
export const UserCreationExample: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDate] = useState(new Date());

  // ตัวอย่างข้อมูลวันที่สัญญา
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];
  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          ระบบสร้างบัญชีผู้ใช้ใหม่
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ระบบที่ปรับปรุงใหม่นี้จะช่วยให้คุณสร้างบัญชีผู้ใช้ได้เฉพาะห้องที่ไม่มีคนเช่าเลยเท่านั้น
          เพื่อป้องกันการซ้ำซ้อนและการจัดการห้องพักที่แม่นยำ
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ฟีเจอร์หลัก */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-blue-600">✨</span>
              ฟีเจอร์หลัก
            </CardTitle>
            <CardDescription>
              ความสามารถใหม่ของระบบการสร้างบัญชีผู้ใช้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ✓
              </Badge>
              <span>กรองห้องว่างเฉพาะที่ไม่มีคนเช่าเลย</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ✓
              </Badge>
              <span>ตรวจสอบสถานะห้องก่อนสร้างบัญชี</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ✓
              </Badge>
              <span>อัปเดตสถานะห้องอัตโนมัติ</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                ✓
              </Badge>
              <span>สร้างสัญญาเช่าอัตโนมัติ</span>
            </div>
          </CardContent>
        </Card>

        {/* ข้อจำกัด */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-orange-600">⚠️</span>
              ข้อจำกัด
            </CardTitle>
            <CardDescription>สิ่งที่ระบบจะไม่ทำ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                ✗
              </Badge>
              <span>ไม่สามารถเลือกห้องที่มีคนเช่าอยู่แล้ว</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                ✗
              </Badge>
              <span>ไม่สามารถเลือกห้องที่อยู่ระหว่างซ่อมแซม</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                ✗
              </Badge>
              <span>ไม่สามารถสร้างบัญชีซ้ำในห้องเดียวกัน</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* การทำงานของระบบ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-purple-600">🔄</span>
            ขั้นตอนการทำงาน
          </CardTitle>
          <CardDescription>
            กระบวนการสร้างบัญชีผู้ใช้ใหม่แบบทีละขั้นตอน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">
                ขั้นตอนที่ 1-5: การเตรียมข้อมูล
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>ผู้ดูแลระบบเข้าสู่ระบบ</li>
                <li>เปิดฟอร์มสร้างบัญชีผู้ใช้ใหม่</li>
                <li>เลือกห้องว่างจากรายการ</li>
                <li>กรอกข้อมูลผู้ใช้</li>
                <li>ระบบตรวจสอบสถานะห้อง</li>
              </ol>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">
                ขั้นตอนที่ 6-10: การสร้างบัญชี
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>สร้างบัญชีใน Supabase Auth</li>
                <li>เพิ่มข้อมูลผู้เช่า</li>
                <li>เพิ่มข้อมูลการเข้าพัก</li>
                <li>อัปเดตสถานะห้อง</li>
                <li>สร้างสัญญาเช่า PDF</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ปุ่มทดสอบ */}
      <div className="text-center">
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          🚀 ทดสอบฟีเจอร์ใหม่
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          คลิกเพื่อเปิดฟอร์มสร้างบัญชีผู้ใช้ใหม่
        </p>
      </div>

      {/* ข้อมูลเพิ่มเติม */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-green-600">ℹ️</span>
            ข้อมูลเพิ่มเติม
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">การแสดงผล</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• แสดงหมายเลขห้อง</li>
                <li>• ประเภทห้องและชั้น</li>
                <li>• ราคาและสถานะ</li>
                <li>• Badge แสดงสถานะ "ว่าง"</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">
                การจัดการข้อมูล
              </h5>
              <ul className="space-y-1 text-gray-600">
                <li>• อัปเดตข้อมูลห้องทันที</li>
                <li>• รีเฟรชข้อมูลอัตโนมัติ</li>
                <li>• บันทึกประวัติการเข้าพัก</li>
                <li>• สร้างสัญญาเช่าอัตโนมัติ</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">ความปลอดภัย</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• ตรวจสอบสิทธิ์ admin</li>
                <li>• ตรวจสอบสถานะห้อง</li>
                <li>• ป้องกันการซ้ำซ้อน</li>
                <li>• บันทึกการดำเนินการ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog สำหรับทดสอบ */}
      <UserCreateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        price={5000}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default UserCreationExample;
