# การจัดการแปลภาษาและธีมสำหรับ UserCreateDialog

## ภาพรวม

ได้เพิ่มการจัดการแปลภาษาและธีมให้กับส่วน "สร้างบัญชีผู้ใช้ใหม่" (UserCreateDialog) ใน Tenant Management เพื่อให้ระบบรองรับหลายภาษาและธีมได้อย่างสมบูรณ์

## การเปลี่ยนแปลงที่ทำ

### 1. เพิ่ม useLanguage Hook

```typescript
import { useLanguage } from "@/providers/LanguageProvider";

export const UserCreateDialog = ({ ... }) => {
  const { t } = useLanguage();
  // ... rest of the component
};
```

### 2. เพิ่มการแปลภาษาใน LanguageProvider

#### ภาษาไทย (th)

```typescript
// UserCreateDialog translations
"userCreate.title": "สร้างบัญชีผู้ใช้ใหม่",
"userCreate.review": "ตรวจสอบก่อนยืนยัน",
"userCreate.firstName": "ชื่อ",
"userCreate.lastName": "นามสกุล",
"userCreate.email": "อีเมล",
"userCreate.password": "รหัสผ่าน",
"userCreate.houseNumber": "บ้านเลขที่",
"userCreate.village": "หมู่ที่",
"userCreate.street": "ถนน",
"userCreate.province": "จังหวัด",
"userCreate.district": "อำเภอ/เขต",
"userCreate.subDistrict": "ตำบล/แขวง",
"userCreate.phone": "เบอร์โทร",
"userCreate.phoneOptional": "เบอร์โทร (ไม่บังคับ)",
"userCreate.role": "บทบาท",
"userCreate.roleTenant": "ผู้เช่า (Tenant)",
"userCreate.roomSelection": "เลือกห้องว่าง (ไม่มีคนเช่า)",
"userCreate.roomSelectionPlaceholder": "เลือกห้องว่างที่ไม่มีคนเช่า",
"userCreate.noVacantRooms": "ไม่มีห้องว่างที่ไม่มีคนเช่า",
"userCreate.zipCode": "รหัสไปรษณีย์",
"userCreate.selectProvinceFirst": "กรุณาเลือกจังหวัดก่อน",
"userCreate.selectDistrictFirst": "กรุณาเลือกอำเภอก่อน",
"userCreate.next": "ถัดไป",
"userCreate.confirm": "ยืนยันลงชื่อและสร้างบัญชี",
"userCreate.creating": "กำลังสร้าง...",
"userCreate.back": "ย้อนกลับ",
```

#### ภาษาอังกฤษ (en)

```typescript
// UserCreateDialog translations
"userCreate.title": "Create New User Account",
"userCreate.review": "Review Before Confirmation",
"userCreate.firstName": "First Name",
"userCreate.lastName": "Last Name",
"userCreate.email": "Email",
"userCreate.password": "Password",
"userCreate.houseNumber": "House Number",
"userCreate.village": "Village",
"userCreate.street": "Street",
"userCreate.province": "Province",
"userCreate.district": "District/Area",
"userCreate.subDistrict": "Sub-district/Sub-area",
"userCreate.phone": "Phone",
"userCreate.phoneOptional": "Phone (Optional)",
"userCreate.role": "Role",
"userCreate.roleTenant": "Tenant",
"userCreate.roomSelection": "Select Vacant Room (No Tenant)",
"userCreate.roomSelectionPlaceholder": "Select vacant room with no tenant",
"userCreate.noVacantRooms": "No vacant rooms without tenants",
"userCreate.zipCode": "Postal Code",
"userCreate.selectProvinceFirst": "Please select province first",
"userCreate.selectDistrictFirst": "Please select district first",
"userCreate.next": "Next",
"userCreate.confirm": "Confirm and Create Account",
"userCreate.creating": "Creating...",
"userCreate.back": "Back",
```

### 3. แก้ไขข้อความใน UserCreateDialog

#### ส่วนหัว (Header)

```typescript
// เดิม
{
  step === "form" ? "สร้างบัญชีผู้ใช้ใหม่" : "ตรวจสอบก่อนยืนยัน";
}

// ใหม่
{
  step === "form" ? t("userCreate.title") : t("userCreate.review");
}
```

#### ฟอร์มข้อมูลส่วนตัว

```typescript
// เดิม
<FormLabel>ชื่อ</FormLabel>
<Input placeholder="ชื่อ" {...field} />

// ใหม่
<FormLabel>{t("userCreate.firstName")}</FormLabel>
<Input placeholder={t("userCreate.firstName")} {...field} />
```

#### ฟอร์มที่อยู่

```typescript
// เดิม
<FormLabel>จังหวัด</FormLabel>
<MySelect placeholder="เลือกจังหวัด" />

// ใหม่
<FormLabel>{t("userCreate.province")}</FormLabel>
<MySelect placeholder={t("userCreate.province")} />
```

#### ฟอร์มข้อมูลติดต่อ

```typescript
// เดิม
<FormLabel>เบอร์โทร (ไม่บังคับ)</FormLabel>
<FormLabel>บทบาท</FormLabel>
<span>ผู้เช่า (Tenant)</span>

// ใหม่
<FormLabel>{t("userCreate.phoneOptional")}</FormLabel>
<FormLabel>{t("userCreate.role")}</FormLabel>
<span>{t("userCreate.roleTenant")}</span>
```

#### ฟอร์มเลือกห้อง

```typescript
// เดิม
<FormLabel>เลือกห้องว่าง (ไม่มีคนเช่า)</FormLabel>
<SelectValue placeholder="เลือกห้องว่างที่ไม่มีคนเช่า" />
<div>ไม่มีห้องว่างที่ไม่มีคนเช่า</div>

// ใหม่
<FormLabel>{t("userCreate.roomSelection")}</FormLabel>
<SelectValue placeholder={t("userCreate.roomSelectionPlaceholder")} />
<div>{t("userCreate.noVacantRooms")}</div>
```

#### ปุ่มดำเนินการ

```typescript
// เดิม
<Button type="submit">ถัดไป</Button>
<Button>{loading ? "กำลังสร้าง..." : "ยืนยันลงชื่อและสร้างบัญชี"}</Button>
<Button variant="outline">ย้อนกลับ</Button>

// ใหม่
<Button type="submit">{t("userCreate.next")}</Button>
<Button>{loading ? t("userCreate.creating") : t("userCreate.confirm")}</Button>
<Button variant="outline">{t("userCreate.back")}</Button>
```

## ธีม (Theme)

### การรองรับธีม

UserCreateDialog รองรับธีมผ่าน CSS classes ที่ใช้จากระบบ UI components:

- **Light Theme**: ใช้ CSS variables และ classes มาตรฐาน
- **Dark Theme**: ใช้ CSS variables และ classes สำหรับ dark mode
- **Responsive Design**: รองรับการแสดงผลบนอุปกรณ์ต่างๆ

### CSS Classes ที่ใช้

```css
/* Dialog */
.dialog-content {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

/* Form Elements */
.form-label {
  color: hsl(var(--foreground));
}

.form-input {
  background: hsl(var(--input));
  border-color: hsl(var(--border));
  color: hsl(var(--foreground));
}

/* Buttons */
.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.btn-outline {
  border-color: hsl(var(--border));
  color: hsl(var(--foreground));
}
```

## ประโยชน์ของการเปลี่ยนแปลง

### 1. การรองรับหลายภาษา

- **ภาษาไทย**: สำหรับผู้ใช้ในประเทศไทย
- **ภาษาอังกฤษ**: สำหรับผู้ใช้ต่างชาติหรือการใช้งานสากล
- **ง่ายต่อการเพิ่มภาษาใหม่**: เพียงเพิ่มใน LanguageProvider

### 2. การจัดการธีม

- **Light/Dark Mode**: รองรับการเปลี่ยนธีมตามการตั้งค่าของผู้ใช้
- **Consistent UI**: ใช้ระบบ UI components เดียวกันกับส่วนอื่นของระบบ
- **Accessibility**: รองรับการเข้าถึงสำหรับผู้ใช้ที่มีความต้องการพิเศษ

### 3. การบำรุงรักษา

- **Centralized Translations**: การแปลภาษาอยู่ในที่เดียว
- **Easy Updates**: แก้ไขข้อความได้ง่ายโดยไม่ต้องแก้ไขในหลายไฟล์
- **Consistent Naming**: ใช้ naming convention ที่สอดคล้องกัน

## วิธีการใช้งาน

### สำหรับผู้พัฒนา

1. เพิ่มข้อความใหม่ใน `LanguageProvider.tsx`
2. ใช้ `t("key")` ใน component
3. ทดสอบการแสดงผลทั้งสองภาษา

### สำหรับผู้ใช้

1. เปลี่ยนภาษาผ่าน Language Switcher
2. ระบบจะแสดงข้อความตามภาษาที่เลือก
3. ธีมจะเปลี่ยนตามการตั้งค่าของระบบ

## หมายเหตุ

- การแปลภาษาจะทำงานทันทีเมื่อเปลี่ยนภาษา
- ธีมจะเปลี่ยนตามการตั้งค่าของระบบ
- ระบบรองรับการเพิ่มภาษาใหม่ในอนาคต
- การแสดงผลจะสอดคล้องกับส่วนอื่นของระบบ
