# การเชื่อมต่อค่าเช่าหน้า Room กับหน้า Settings

## ภาพรวม

ระบบได้เชื่อมต่อค่าเช่าหน้า Room กับหน้า Settings ผ่าน `useSystemSettings` hook แล้ว โดยเมื่อมีการเปลี่ยนแปลงค่าเช่าในหน้า Settings จะอัปเดตไปยังทุกส่วนของระบบที่เกี่ยวข้องกับราคาเช่า

## การทำงานของระบบ

### 1. หน้า Settings (SystemConfigSection)

- มีการตั้งค่า `depositRate` (ค่าเช่ารายเดือน)
- ค่าจะถูกบันทึกลงฐานข้อมูล `system_settings` และ localStorage
- ใช้ `useSystemSettings` hook สำหรับการจัดการข้อมูล

### 2. หน้า Room (RoomsPage)

- แสดงราคาเช่าจาก `settings.depositRate` แทน `room.price`
- เมื่อสร้างห้องใหม่จะใช้ค่าจาก settings
- ตารางแสดงราคาเช่าจะอัปเดตตามการตั้งค่าใหม่

### 3. ระบบอื่นๆ ที่ใช้ค่าเช่า

- **RoomDetailsDialog**: แสดงราคาเช่าจาก settings
- **RoomEditDialog**: อัปเดตราคาเช่าตาม settings
- **RoomAssignmentDialog**: แสดงราคาเช่าจาก settings
- **UserCreateDialog**: ใช้ราคาเช่าจาก settings
- **ระบบบิล**: คำนวณค่าเช่าจาก settings

## ไฟล์ที่ได้รับการแก้ไข

### 1. src/pages/RoomsPage.tsx

- แก้ไขการแสดงราคาในตารางให้ใช้ `settings.depositRate`
- แก้ไขฟอร์มเพิ่มห้องใหม่ให้แสดงราคาจาก settings
- แก้ไขการสร้างห้องใหม่ให้ใช้ราคาจาก settings

### 2. src/components/rooms/RoomDetailsDialog.tsx

- แก้ไขการแสดงราคาให้ใช้ `settings.depositRate`
- ใช้ `roomRent` ที่มาจาก settings

### 3. src/components/rooms/RoomEditDialog.tsx

- เพิ่ม import `useSystemSettings`
- แก้ไขการอัปเดตราคาให้ใช้ค่าจาก settings

### 4. src/components/tenants/RoomAssignmentDialog.tsx

- เพิ่ม import `useSystemSettings`
- แก้ไขการแสดงราคาให้ใช้ค่าจาก settings

### 5. src/components/auth/UserCreateDialog.tsx

- ใช้ `settings.depositRate` สำหรับการแสดงราคา
- แก้ไขฟังก์ชัน `getRoomInfoById` ให้ใช้ราคาจาก settings

## การใช้งาน

### สำหรับผู้ดูแลระบบ

1. ไปที่หน้า **Settings**
2. แก้ไขค่าในช่อง **ค่าเช่ารายเดือน**
3. กด **บันทึกการตั้งค่า**
4. ระบบจะอัปเดตราคาเช่าในทุกส่วนโดยอัตโนมัติ

### สำหรับผู้ใช้ทั่วไป

- ราคาเช่าที่แสดงในหน้า Room จะเป็นค่าล่าสุดจากหน้า Settings
- ไม่สามารถแก้ไขราคาเช่าได้โดยตรงในหน้า Room

## ประโยชน์ของการเชื่อมต่อ

1. **ความสอดคล้อง**: ราคาเช่าในทุกส่วนของระบบจะตรงกัน
2. **ง่ายต่อการจัดการ**: แก้ไขราคาในที่เดียว ระบบจะอัปเดตทุกที่
3. **ลดข้อผิดพลาด**: ไม่มีการป้อนราคาซ้ำในหลายที่
4. **การบำรุงรักษา**: ง่ายต่อการอัปเดตและแก้ไขปัญหา

## หมายเหตุ

- ระบบจะใช้ค่าเริ่มต้นจาก `defaultSettings` หากไม่มีการตั้งค่าในฐานข้อมูล
- ค่าจะถูกเก็บใน localStorage เป็น backup หากฐานข้อมูลมีปัญหา
- การเปลี่ยนแปลงราคาเช่าจะมีผลทันทีในทุกส่วนของระบบ
