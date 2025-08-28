# 🔄 การแก้ไขให้หน้า Announcements แสดงข้อมูลเหมือนกับ Dashboard

## 🎯 **เป้าหมาย:**

ทำให้หน้า Announcements แสดงข้อมูลประกาศเหมือนกับ Dashboard ของผู้เช่า โดยใช้เงื่อนไขการดึงข้อมูลและการกรองเดียวกัน

## 🔍 **การเปลี่ยนแปลงที่ทำไปแล้ว:**

### 1. **เพิ่ม Limit การดึงข้อมูล:**

```typescript
// ก่อนแก้ไข
.order("publish_date", { ascending: false });

// หลังแก้ไข
.order("publish_date", { ascending: false })
.limit(10); // ดึงมาเยอะหน่อย แล้วค่อยกรอง
```

### 2. **แก้ไขเงื่อนไขการกรองข้อมูล:**

```typescript
// ก่อนแก้ไข - กรองแค่ 7 วันล่าสุด
const filtered = data.filter((a) => isWithinLast7Days(a.publish_date));

// หลังแก้ไข - กรอง 7 วันล่าสุด + action = "1" หรือ null
const filtered = data.filter(
  (a) =>
    isWithinLast7Days(a.publish_date) && (a.action === "1" || a.action === null)
);
```

### 3. **ปรับปรุง Console Logging:**

```typescript
// ก่อนแก้ไข
console.log("Fetched announcements:", filtered);

// หลังแก้ไข
console.log("AnnouncementsPage - Fetched announcements:", filtered);
```

### 4. **ลบการกรองซ้ำใน Recent Announcements:**

```typescript
// ก่อนแก้ไข - กรองซ้ำ
{announcements
  .filter((a) => isWithinLast7Days(a.publish_date))  // ← กรองซ้ำ
  .sort(...)
  .slice(0, 6)
  .map(...)}

// หลังแก้ไข - ไม่กรองซ้ำ เพราะข้อมูลถูกกรองแล้ว
{announcements
  .sort(...)
  .slice(0, 6)
  .map(...)}
```

## 📊 **เงื่อนไขการทำงานที่ตรงกัน:**

### ✅ **Dashboard และหน้า Announcements ใช้เงื่อนไขเดียวกัน:**

1. **การดึงข้อมูล:**

   - ดึงข้อมูล 10 รายการล่าสุดจากฐานข้อมูล
   - เรียงลำดับตาม `publish_date` จากใหม่ไปเก่า

2. **การกรองข้อมูล:**

   - กรองเฉพาะประกาศที่อยู่ใน 7 วันล่าสุด
   - กรองเฉพาะประกาศที่ `action = "1"` หรือ `action = null`
   - ประกาศที่ `action = "2"` จะไม่แสดง (หมดอายุแล้ว)

3. **การแสดงผล:**
   - แสดงข้อมูลตามฐานข้อมูลจริง
   - รองรับประกาศที่สำคัญ (important)
   - แสดงวันที่ในรูปแบบที่อ่านง่าย

## 🎨 **การแสดงผลที่ตรงกัน:**

### 1. **Calendar View:**

- แสดงจุดสีส้มในวันที่ที่มีประกาศ
- ใช้ข้อมูลที่กรองแล้ว (ไม่แสดงประกาศที่หมดอายุ)

### 2. **Recent Announcements:**

- แสดงประกาศ 6 รายการล่าสุด
- ไม่มีการกรองซ้ำ (ข้อมูลถูกกรองแล้วจาก useEffect)

### 3. **Announcements for Selected Date:**

- แสดงประกาศตามวันที่ที่เลือกในปฏิทิน
- ใช้ข้อมูลที่กรองแล้ว

## 🔧 **การทำงานใหม่:**

### 1. **Data Flow:**

```
Database → fetchAnnouncements() → filter() → setAnnouncements() → UI
```

### 2. **Filtering Logic:**

```typescript
const filtered = data.filter(
  (a) =>
    isWithinLast7Days(a.publish_date) && // ← 7 วันล่าสุด
    (a.action === "1" || a.action === null) // ← ประกาศที่ยังใช้งานได้
);
```

### 3. **State Management:**

- `announcements` state เก็บข้อมูลที่กรองแล้ว
- ไม่มีการกรองซ้ำในส่วนแสดงผล
- ข้อมูลจะอัปเดตเมื่อมีการเปลี่ยนแปลงในฐานข้อมูล

## 🧪 **การทดสอบ:**

### 1. **ตรวจสอบ Console Logs:**

```
Dashboard - Fetched announcements: [...]
AnnouncementsPage - Fetched announcements: [...]
```

### 2. **ตรวจสอบจำนวนประกาศ:**

- Dashboard และหน้า Announcements ควรแสดงจำนวนประกาศเท่ากัน
- ประกาศที่หมดอายุ (action = "2") จะไม่แสดง

### 3. **ตรวจสอบการกรอง:**

- ประกาศที่เกิน 7 วันจะไม่แสดง
- ประกาศที่ action = "1" หรือ null จะแสดง

## 📝 **หมายเหตุ:**

การแก้ไขนี้ทำให้หน้า Announcements และ Dashboard แสดงข้อมูลประกาศที่ตรงกัน โดยใช้เงื่อนไขการดึงข้อมูลและการกรองเดียวกัน การลบการกรองซ้ำทำให้โค้ดมีประสิทธิภาพมากขึ้น และการแสดงผลมีความสอดคล้องกัน
