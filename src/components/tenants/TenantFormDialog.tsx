import { useForm } from "react-hook-form";
import { useEffect, useState,useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import provincesRaw from "../../json/thai_provinces.json";
import amphuresRaw from "../../json/thai_amphures.json";
import tambonsRaw from "../../json/thai_tambons.json";
import MySelect from "react-select";
import type { Database } from "@/integrations/supabase/types";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"] & {
  current_room?: {
    id: string;
    room_number: string;
    room_type: string;
    floor: number;
  } | null;
};

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


const tenantSchema = z.object({
  firstName: z.string().nonempty("กรุณากรอกชื่อ"),
  lastName: z.string().nonempty("กรุณากรอกนามสกุล"),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().nonempty("กรุณากรอกเบอร์โทร"),
  id_card: z.string().optional(),
  houseNumber: z.string().nonempty("กรุณากรอกบ้านเลขที่"),
  village: z.string().nonempty("กรุณากรอกหมู่ที่"),
  street: z.string().optional(),
  subDistrict: z.string().nonempty("กรุณากรอกตำบล/แขวง"),
  district: z.string().nonempty("กรุณากรอกอำเภอ/เขต"),
  province: z.string().nonempty("กรุณากรอกจังหวัด"),
  address: z.string().optional(),
  room_id: z.string().optional(),
  room_number: z.string().optional(),
  residents: z.string().optional(),
  action: z.string().optional(),
  zip_code: z.string().optional(),
});
type TenantInsert = z.infer<typeof tenantSchema> & { id?: string };

const residentSchema = z.object({
  firstName: z.string().nonempty("กรุณากรอกชื่อ"),
  lastName: z.string().nonempty("กรุณากรอกนามสกุล"),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().nonempty("กรุณากรอกเบอร์โทร"),
  id_card: z.string().optional(),
  houseNumber: z.string().nonempty("กรุณากรอกบ้านเลขที่"),
  village: z.string().nonempty("กรุณากรอกหมู่ที่"),
  street: z.string().optional(),
  subDistrict: z.string().nonempty("กรุณากรอกตำบล/แขวง"),
  district: z.string().nonempty("กรุณากรอกอำเภอ/เขต"),
  province: z.string().nonempty("กรุณากรอกจังหวัด"),
  address: z.string().optional(),
  room_id: z.string().optional(),
  action: z.string().optional(),
  zip_code: z.string().optional(),
});
type ResidentInsert = z.infer<typeof residentSchema> & { id?: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room_id: string;
  room_number: string;
  capacity: number;
  occupantCount: number;
  tenant?: Partial<TenantInsert>;
  onTenantAdded?: () => void;
};

export default function TenantFormDialog({
  open,
  onOpenChange,
  room_id,
  room_number,
  capacity,
  occupantCount,
  tenant,
  onTenantAdded,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ฟอร์มผู้เช่า
  const tenantForm = useForm<TenantInsert>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      id_card: "",
      houseNumber: "",
      village: "",
      street: "",
      subDistrict: "",
      district: "",
      province: "",
      room_id: room_id,
      room_number,
      zip_code: "",
    },
  });


  // ฟอร์มลูกห้อง (resident)
  const residentForm = useForm<ResidentInsert>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      id_card: "",
      houseNumber: "",
      village: "",
      street: "",
      subDistrict: "",
      district: "",
      province: "",
      room_id: room_id,
      action: "1",
      zip_code: "",
    },
  });

  function parseAddress(address: string) {
    const result: Partial<TenantInsert> = {};
    if (!address) return result;

    const houseMatch = address.match(/บ้านเลขที่\s*([^ ]+)/);
    const villageMatch = address.match(/หมู่ที่\s*([^ ]+)/);
    const streetMatch = address.match(/ถนน\s*([^ ]+)/);
    const subDistrictMatch = address.match(/ตำบล\s*([^ ]+)/);
    const districtMatch = address.match(/อำเภอ\s*([^ ]+)/);
    const provinceMatch = address.match(/จังหวัด\s*([^ ]+)/);

    if (houseMatch) result.houseNumber = houseMatch[1];
    if (villageMatch) result.village = villageMatch[1];
    if (streetMatch) result.street = streetMatch[1];
    if (subDistrictMatch) result.subDistrict = subDistrictMatch[1];
    if (districtMatch) result.district = districtMatch[1];
    if (provinceMatch) result.province = provinceMatch[1];

    return result;
  }

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
    async function loadData() {
      if (!open) {
        tenantForm.reset();
        residentForm.reset();
        return;
      }

      // โหลดข้อมูลผู้เช่า (tenant) ถ้ามี
      if (tenant && tenant.id) {
        const addressParts = parseAddress(tenant.address || "");
        tenantForm.reset({
          firstName: tenant.first_name || "",
          lastName: tenant.last_name || "",
          email: tenant.email || "",
          phone: tenant.phone || "",
          houseNumber: addressParts.houseNumber || "",
          village: addressParts.village || "",
          street: addressParts.street || "",
          subDistrict: addressParts.subDistrict || "",
          district: addressParts.district || "",
          province: addressParts.province || "",
          room_id,
          room_number,
        });
      } else {
        tenantForm.reset();
      }

      // โหลดข้อมูลลูกห้องคนแรก (ถ้ามี)
      const { data: residents, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("room_id", room_id)
        .eq("action", "1") 
        .ilike("residents","ลูกเช่า")
        .limit(1)

      if (error) {
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: error.message,
        });
        residentForm.reset();
        return;
      }

      if (residents && residents.length > 0) {
        const res = residents[0];
        const addressParts = parseAddress(res.address || "");
        residentForm.reset({
          firstName: res.first_name || "",
          lastName: res.last_name || "",
          email: res.email || "",
          phone: res.phone || "",
          houseNumber: addressParts.houseNumber || "",
          village: addressParts.village || "",
          street: addressParts.street || "",
          subDistrict: addressParts.subDistrict || "",
          district: addressParts.district || "",
          province: addressParts.province || "",
          room_id,
          action: "1",
          id: res.id,
        });
      } else {
        residentForm.reset();
      }
    }

    loadData();
  }, [open, tenant, room_id]);

  const onSubmitTenant = async (data: TenantInsert) => {
    if (occupantCount >= capacity) {
      toast({
        variant: "destructive",
        title: "ไม่สามารถเพิ่มผู้เช่าได้",
        description: "ห้องนี้เต็มแล้ว",
      });
      return;
    }

     const streetPart = data.street ? `ถนน ${data.street} ` : "ถนน -";
     const fullAddress = `บ้านเลขที่ ${data.houseNumber} หมู่ที่ ${data.village} ${streetPart} ตำบล ${data.subDistrict} อำเภอ ${data.district} จังหวัด ${data.province} รหัสไปรษณีย์ ${selectedDistrict?.zip_code} `;

    const tenantPayload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      fullAddress,
      id_card: data.id_card,
      room_id,
      action: "1", 
    };

    const idToUpdate = tenant?.id;

    if (!idToUpdate) {
      toast({
        variant: "destructive",
        title: "ไม่พบผู้เช่า",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tenants")
        .update(tenantPayload)
        .eq("id", idToUpdate);

      if (error) {
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: error.message,
        });
        return;
      }

      toast({
        title: "แก้ไขข้อมูลผู้เช่าสำเร็จ",
      });

      tenantForm.reset();
      onOpenChange(false);
      onTenantAdded?.();

      queryClient.invalidateQueries(["tenants"]);
      queryClient.invalidateQueries(["rooms"]);
      queryClient.invalidateQueries(["occupancy"]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: (err as Error).message || "ไม่สามารถแก้ไขผู้เช่าได้",
      });
    }
  };

  const onSubmitResident = async (data: ResidentInsert) => {
    if (occupantCount >= capacity) {
      toast({
        variant: "destructive",
        title: "ไม่สามารถเพิ่มลูกห้องได้",
        description: "ห้องนี้เต็มแล้ว",
      });
      return;
    }

     const streetPart = data.street ? `ถนน ${data.street} ` : "ถนน -";
     const fullAddress = `บ้านเลขที่ ${data.houseNumber} หมู่ที่ ${data.village} ${streetPart} ตำบล ${data.subDistrict} อำเภอ ${data.district} จังหวัด ${data.province} รหัสไปรษณีย์ ${selectedDistrict?.zip_code} `;

    const residentPayload = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      email: data.email,
      id_card: data.id_card,
      fullAddress,
      room_id,
      action: "1", 
    };

    try {
      if (data.id) {
        // update
        const { error } = await supabase
          .from("tenants")
          .update(residentPayload)
          .eq("id", data.id);

        if (error) throw error;
        toast({ title: "แก้ไขข้อมูลลูกห้องสำเร็จ" });
      } else {
        // insert
        const { error } = await supabase.from("tenants").insert(residentPayload);
        if (error) throw error;
        toast({ title: "เพิ่มข้อมูลลูกห้องสำเร็จ" });
      }

      residentForm.reset();
      onOpenChange(false);
      onTenantAdded?.();

      queryClient.invalidateQueries(["tenants"]);
      queryClient.invalidateQueries(["rooms"]);
      queryClient.invalidateQueries(["occupancy"]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: (err as Error).message || "ไม่สามารถบันทึกข้อมูลลูกห้องได้",
      });
    }
  };

const [roomTenants, setRoomTenants] = useState<Tenant[]>([]);
 useEffect(() => {
    async function fetchRoomTenants() {
      if (!tenant?.room_id) return;

      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("room_id", tenant.room_id)
        .eq("action", "1")
        .ilike("residents", "%ลูกเช่า%")
        .neq("id", tenant.id); 

      if (!error && data) {
        setRoomTenants(data);
      }
    }

    if (open && tenant) {
      fetchRoomTenants();
    }
  }, [open, tenant]);

  
 useEffect(() => {
  if (!tenant || data.length === 0) return;

  const addressParts = parseAddress(tenant.address || "");
  console.log("addressParts", addressParts);
  console.log("data", data);

  tenantForm.reset({
    firstName: tenant.first_name || "",
    lastName: tenant.last_name || "",
    email: tenant.email || "",
    phone: tenant.phone || "",
    houseNumber: addressParts.houseNumber || "",
    village: addressParts.village || "",
    street: addressParts.street || "",
    subDistrict: addressParts.subDistrict || "",
    district: addressParts.district || "",
    province: addressParts.province || "",
    zip_code: "",
  });

  // 🔍 ตรวจสอบชื่อที่ใช้ match
  const prov = data.find((p) => p.name_th.trim() === addressParts.province?.trim());
  setSelectedProvince(prov || null);

  const amp = prov?.amphoes.find((a) => a.name_th.trim() === addressParts.district?.trim());
  setSelectedAmphoe(amp || null);

  const dist = amp?.districts.find((d) => d.name_th.trim() === addressParts.subDistrict?.trim());
  setSelectedDistrict(dist || null);
}, [tenant, data, tenantForm]);
;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>จัดการผู้เช่าและลูกห้อง</DialogTitle>
        </DialogHeader>

        {/* ฟอร์มผู้เช่า */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold mb-2">ข้อมูลผู้เช่า</h3>
          <Form {...tenantForm}>
            <form
              onSubmit={tenantForm.handleSubmit(onSubmitTenant)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tenantForm.control}
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
                  control={tenantForm.control}
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
                control={tenantForm.control}
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

              <FormField
                control={tenantForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทร</FormLabel>
                    <FormControl>
                      <Input placeholder="เบอร์โทร" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tenantForm.control}
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
                  control={tenantForm.control}
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
                  control={tenantForm.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ถนน (ไม่จำเป็น)</FormLabel>
                      <FormControl>
                        <Input placeholder="ถนน" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
            control={tenantForm.control}
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
                      tenantForm.setValue("province", option?.label || "");
                      tenantForm.setValue("district", "");
                      tenantForm.setValue("subDistrict", "");
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
            control={tenantForm.control}
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
                      tenantForm.setValue("district", option?.label || "");
                      tenantForm.setValue("subDistrict", "");
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
            control={tenantForm.control}
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
                      tenantForm.setValue("subDistrict", option?.label || "");
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

              <div className="text-sm text-muted-foreground">
                ห้องที่เลือก: <strong>{room_number}</strong>
              </div>

              <div className="flex justify-end mt-2">
                <Button type="submit">บันทึกผู้เช่า</Button>
              </div>
            </form>
          </Form>
        </div>

        {/* ฟอร์มลูกห้อง */}
      {roomTenants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">ข้อมูลลูกห้อง</h3>
          <Form {...residentForm}>
            <form
              onSubmit={residentForm.handleSubmit(onSubmitResident)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={residentForm.control}
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
                  control={residentForm.control}
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
                control={residentForm.control}
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

              <FormField
                control={residentForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทร</FormLabel>
                    <FormControl>
                      <Input placeholder="เบอร์โทร" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={residentForm.control}
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
                  control={residentForm.control}
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
                  control={residentForm.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ถนน (ไม่จำเป็น)</FormLabel>
                      <FormControl>
                        <Input placeholder="ถนน" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
            control={residentForm.control}
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
                      residentForm.setValue("province", option?.label || "");
                      residentForm.setValue("district", "");
                      residentForm.setValue("subDistrict", "");
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
            control={residentForm.control}
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
                      residentForm.setValue("district", option?.label || "");
                      residentForm.setValue("subDistrict", "");
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
            control={residentForm.control}
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
                      residentForm.setValue("subDistrict", option?.label || "");
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

              <div className="flex justify-end mt-2">
                <Button type="submit">บันทึกลูกห้อง</Button>
              </div>
            </form>
          </Form>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
