import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const staffSchema = z.object({
   email: z.string().email("กรุณาใส่อีเมลที่ถูกต้อง"),
   password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
   firstName: z.string().min(1, "กรุณาใส่ชื่อ"),
   lastName: z.string().min(1, "กรุณาใส่นามสกุล"),
   houseNumber: z.string().min(1, "กรุณาใส่บ้านเลขที่"),
   village: z.string().min(1, "กรุณาใส่หมู่บ้าน"),
   street: z.string().optional(),
   subDistrict: z.string().min(1, "กรุณาใส่ตำบล/แขวง"),
   district: z.string().min(1, "กรุณาใส่อำเภอ/เขต"),
   province: z.string().min(1, "กรุณาใส่จังหวัด"),
   phone: z.string().optional(),
   role: z.enum(["admin", "staff", "tenant"]),
   zip_code: z.string().optional(),
 });

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const StaffCreateDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: StaffCreateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { session, user } = useAuth();
  const queryClient = useQueryClient();
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
 
 

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
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

  const onSubmit = async (data: StaffFormData) => {
    if (!session?.access_token) {
      toast.error("ไม่พบ session การเข้าสู่ระบบ");
      return;
    }

    if (user?.role !== "admin") {
      toast.error("คุณไม่มีสิทธิ์ในการสร้างบัญชีผู้ใช้ใหม่");
      return;
    }

    setLoading(true);
    try {
      // 1. สร้างบัญชีผู้ใช้ผ่าน Edge Function
      const { data: result, error } = await supabase.functions.invoke(
        "create-user",
        {
          body: {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error || result?.error) {
        console.log("Edge Function result:", result);
        console.log("Edge Function error:", error);
        const errorMessage =
          result?.error || error?.message || "ไม่สามารถสร้างบัญชีผู้ใช้ได้";
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // สมมติว่า result.user.id คือ user id (UUID) ที่ได้จาก Edge Function
      const userId = result?.user?.id;
      if (!userId) {
        toast.error("ไม่สามารถดึง user id ได้");
        setLoading(false);
        return;
      }
     const streetPart = data.street ? `ถนน ${data.street} ` : "ถนน -";
     const fullAddress = `บ้านเลขที่ ${data.houseNumber} หมู่ที่ ${data.village} ${streetPart} ตำบล ${data.subDistrict} อำเภอ ${data.district} จังหวัด ${data.province} รหัสไปรษณีย์ ${selectedDistrict?.zip_code} `;
      // 2. เพิ่มข้อมูลลงในตาราง staffs
      const { data: staffData, error: staffError } = await supabase
        .from("staffs")
        .insert({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone ?? null,
            address: fullAddress,
            status: "1",
          })
        .select("id")
        .single();

     if (staffError) {
      console.error('Insert staff failed:', staffError);
      toast.error("สร้างบัญชีสำเร็จ แต่ไม่สามารถเพิ่มพนักงานได้");
    } else {

      // ➤ 3. เพิ่มข้อมูลลงในตาราง profiles พร้อม tenant_id
      const { data: profilesData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            staff_id: staffData.id,
          });
      console.log('profilesData', data);
      if (profileError) {
        console.error('Insert profile failed:', profileError);
        toast.error("สร้างบัญชีสำเร็จ แต่ไม่สามารถเพิ่มข้อมูลโปรไฟล์ได้");
      } else {
        toast.success("สร้างบัญชีผู้ใช้และเพิ่มพนักงานสำเร็จ!");
      }
    }

      form.reset();
      onOpenChange(false);
      onSuccess?.();

      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    } catch (error: any) {
      toast.error(error.message || "ไม่สามารถสร้างบัญชีผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างบัญชีพนักงานใหม่</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "กำลังสร้าง..." : "สร้างบัญชี"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};