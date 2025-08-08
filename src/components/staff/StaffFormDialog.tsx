import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import provincesRaw from "../../json/thai_provinces.json";
import amphuresRaw from "../../json/thai_amphures.json";
import tambonsRaw from "../../json/thai_tambons.json";
import MySelect from "react-select";

interface Tambon {
  id: number;
  name_th: string;
  zip_code: number;
  amphure_id: number;
}

interface Amphure {
  id: number;
  name_th: string;
  province_id: number;
  districts: Tambon[];
}

interface Province {
  id: number;
  name_th: string;
  amphoes: Amphure[];
}

function transformData(): Province[] {
  const tambonsByAmphure: Record<number, Tambon[]> = {};
  tambonsRaw.forEach((tambon: Tambon) => {
    if (!tambonsByAmphure[tambon.amphure_id]) tambonsByAmphure[tambon.amphure_id] = [];
    tambonsByAmphure[tambon.amphure_id].push(tambon);
  });

  const amphoesWithDistricts: Amphure[] = amphuresRaw.map((amp: any) => ({
    ...amp,
    districts: tambonsByAmphure[amp.id] || [],
  }));

  return provincesRaw.map((prov: any) => ({
    ...prov,
    amphoes: amphoesWithDistricts.filter((amp) => amp.province_id === prov.id),
  }));
}

type Staff = Database['public']['Tables']['staffs']['Row'];
type StaffInsert = Database['public']['Tables']['staffs']['Insert'];

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  onSubmit: (data: StaffInsert) => void;
  isLoading?: boolean;
}

export default function StaffFormDialog({
  open,
  onOpenChange,
  staff,
  onSubmit,
  isLoading = false,
}: StaffFormDialogProps) {
  const form = useForm<StaffInsert>({
    defaultValues: {
      first_name: staff?.first_name || "",
      last_name: staff?.last_name || "",
      email: staff?.email || "",
      phone: staff?.phone || "",
      address: staff?.address || "",
      emergency_contact: staff?.emergency_contact || "",
      houseNumber: "",
      village: "",
      street: "",
      subDistrict: "",
      district: "",
      province: "",
      phone: "",
      role: "staff",
      zip_code: "",
    },
  });

   function parseAddress(address: string) {
  const result: Partial<StaffInsert> = {};

  if (!address) return result;

  const houseMatch = address.match(/บ้านเลขที่\s*(\S+)/);
  const villageMatch = address.match(/หมู่ที่\s*(\S+)/);
  const streetMatch = address.match(/ถนน\s*(\S+)/);
  const subDistrictMatch = address.match(/ตำบล\s*(\S+)/);
  const districtMatch = address.match(/อำเภอ\s*(\S+)/);
  const provinceMatch = address.match(/จังหวัด\s*(\S+)/);

  if (houseMatch) result.houseNumber = houseMatch[1];
  if (villageMatch) result.village = villageMatch[1];
  if (streetMatch) result.street = streetMatch[1];
  if (subDistrictMatch) result.subDistrict = subDistrictMatch[1];
  if (districtMatch) result.district = districtMatch[1];
  if (provinceMatch) result.province = provinceMatch[1];

  return result;
}

useEffect(() => {
  if (!staff) return;

  const addressParts = parseAddress(staff.address || "");

  form.reset({
      firstName: staff?.first_name || "",
      lastName: staff?.last_name || "",
      email: staff?.email || "",
      phone: staff?.phone || "",
      houseNumber: addressParts.houseNumber || "",
      village: addressParts.village || "",
      street: addressParts.street || "",
      subDistrict: addressParts.subDistrict || "",
      district: addressParts.district || "",
      province: addressParts.province || "",
      emergency_contact: staff.emergency_contact || "",
  });
}, [staff, form]);

  const handleSubmit = (data: StaffInsert) => {
  console.log("Form submitted:", data);
  onSubmit(data);
  form.reset();
  onOpenChange(false);
};

const data = useMemo(() => transformData(), []);
 
   const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
   const [selectedAmphoe, setSelectedAmphoe] = useState<Amphure | null>(null);
   const [selectedDistrict, setSelectedDistrict] = useState<Tambon | null>(null);
 
   // ตัวเลือกสำหรับ React Select
   const provinceOptions = data.map((p) => ({ value: p.id, label: p.name_th }));
   const amphoeOptions = selectedProvince
     ? selectedProvince.amphoes.map((a) => ({ value: a.id, label: a.name_th }))
     : [];
   const districtOptions = selectedAmphoe
     ? selectedAmphoe.districts.map((d) => ({ value: d.id, label: d.name_th }))
     : [];

 useEffect(() => {
  if (!staff || data.length === 0) return;

  const addressParts = parseAddress(staff.address || "");
  console.log("addressParts", addressParts);
  console.log("data", data);

  form.reset({
    firstName: staff.first_name || "",
    lastName: staff.last_name || "",
    email: staff.email || "",
    phone: staff.phone || "",
    houseNumber: addressParts.houseNumber || "",
    village: addressParts.village || "",
    street: addressParts.street || "",
    subDistrict: addressParts.subDistrict || "",
    district: addressParts.district || "",
    province: addressParts.province || "",
    emergency_contact: staff.emergency_contact || "",
    role: "staff",
    zip_code: "",
  });

  // 🔍 ตรวจสอบชื่อที่ใช้ match
  const prov = data.find((p) => p.name_th.trim() === addressParts.province?.trim());
  setSelectedProvince(prov || null);

  const amp = prov?.amphoes.find((a) => a.name_th.trim() === addressParts.district?.trim());
  setSelectedAmphoe(amp || null);

  const dist = amp?.districts.find((d) => d.name_th.trim() === addressParts.subDistrict?.trim());
  setSelectedDistrict(dist || null);
}, [staff, data, form]);
;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ</FormLabel>
                      <FormControl>
                        <Input placeholder="ชื่อ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>นามสกุล</FormLabel>
                      <FormControl>
                        <Input placeholder="นามสกุล" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="อีเมล" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>บ้านเลขที่</FormLabel>
                      <FormControl>
                        <Input placeholder="บ้านเลขที่" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมู่ที่</FormLabel>
                      <FormControl>
                        <Input placeholder="หมู่ที่" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ถนน</FormLabel>
                      <FormControl>
                        <Input placeholder="ถนน" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จังหวัด</FormLabel>
                <FormControl>
                  <MySelect 
                    {...field}
                    options={provinceOptions}
                    value={selectedProvince ? { value: selectedProvince.id, label: selectedProvince.name_th } : null}
                    onChange={(option) => {
                      const prov = data.find((p) => p.id === option?.value) || null;
                      setSelectedProvince(prov);
                      setSelectedAmphoe(null);
                      setSelectedDistrict(null);
                      form.setValue("province", option?.label || "");
                      form.setValue("district", "");
                      form.setValue("subDistrict", "");
                    }}
                    placeholder="เลือกจังหวัด"
                    isClearable
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>อำเภอ/เขต</FormLabel>
                <FormControl>
                  <MySelect 
                    {...field}
                    options={amphoeOptions}
                    value={selectedAmphoe ? { value: selectedAmphoe.id, label: selectedAmphoe.name_th } : null}
                    onChange={(option) => {
                      if (!selectedProvince) return;
                      const amp = selectedProvince.amphoes.find((a) => a.id === option?.value) || null;
                      setSelectedAmphoe(amp);
                      setSelectedDistrict(null);
                      form.setValue("district", option?.label || "");
                      form.setValue("subDistrict", "");
                    }}
                    placeholder={selectedProvince ? "เลือกอำเภอ" : "กรุณาเลือกจังหวัดก่อน"}
                    isClearable
                    isDisabled={!selectedProvince}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subDistrict"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ตำบล/แขวง</FormLabel>
                <FormControl>
                  <MySelect 
                    {...field}
                    options={districtOptions}
                    value={selectedDistrict ? { value: selectedDistrict.id, label: selectedDistrict.name_th } : null}
                    onChange={(option) => {
                      if (!selectedAmphoe) return;
                      const dist = selectedAmphoe.districts.find((d) => d.id === option?.value) || null;
                      setSelectedDistrict(dist);
                      form.setValue("subDistrict", option?.label || "");
                    }}
                    placeholder={selectedAmphoe ? "เลือกตำบล" : "กรุณาเลือกอำเภอก่อน"}
                    isClearable
                    isDisabled={!selectedAmphoe}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
              </div>
             <div>
              <label className="block mb-1 font-medium">รหัสไปรษณีย์</label>
              <input
                type="text"
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={selectedDistrict?.zip_code || ""}
                placeholder="รหัสไปรษณีย์"
              />
            </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เบอร์โทร (ไม่บังคับ)</FormLabel>
                      <FormControl>
                        <Input placeholder="เบอร์โทร" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormItem>
              <FormLabel>บทบาท</FormLabel>
              <span className="block py-2 px-3 rounded bg-muted text-muted-foreground">
                ผู้ช่วย (Staff)
              </span>
              <input
                type="hidden"
                {...form.register("role")}
                value="staff"
                readOnly
              />
            </FormItem>

              </div>      
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "กำลังบันทึก..." : staff ? "อัปเดต" : "เพิ่ม"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
