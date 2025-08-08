import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
});

type TenantInsert = z.infer<typeof tenantSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room_id: string;
  room_number: string;
  capacity: number;
  occupantCount: number;
  onTenantAdded?: () => void;
};

export default function RentedchildFormDialog({
  open,
  onOpenChange,
  room_id,
  room_number,
  capacity,
  occupantCount,
  onTenantAdded,
}: Props) {
  const { toast } = useToast();

  const form = useForm<TenantInsert>({
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
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  const onSubmit = async (data: TenantInsert) => {
    if (occupantCount >= capacity) {
      toast({
        variant: "destructive",
        title: "ไม่สามารถเพิ่มลูกเช่าได้",
        description: "ห้องนี้เต็มแล้ว",
      });
      return;
    }

    const addressParts = [
      data.houseNumber ? `บ้านเลขที่ ${data.houseNumber}` : null,
      data.village ? `หมู่ที่ ${data.village}` : null,
      data.street ? `ถนน ${data.street}` : null,
      data.subDistrict ? `ตำบล ${data.subDistrict}` : null,
      data.district ? `อำเภอ ${data.district}` : null,
      data.province ? `จังหวัด ${data.province}` : null,
    ].filter(Boolean);

    const address = addressParts.join(" ");

    const tenantPayload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address,
      room_id,
      room_number,
      residents: "ลูกเช่า",
      action: "1",
    };

    try {
      const { data: tenantRes, error } = await supabase
        .from("tenants")
        .insert(tenantPayload)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: error.message,
        });
        return;
      }

      await supabase.from("occupancy").insert({
        tenant_id: tenantRes.id,
        room_id,
        check_in_date: new Date().toISOString(),
        is_current: true,
      });

      toast({
        title: "เพิ่มลูกเช่าสำเร็จ",
      });

      onOpenChange(false);
      onTenantAdded?.();

      window.location.reload();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: (err as Error).message || "ไม่สามารถเพิ่มลูกเช่าได้",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มลูกเช่า</DialogTitle>
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

            <FormField
              control={form.control}
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
                    <FormLabel>ถนน (ไม่จำเป็น)</FormLabel>
                    <FormControl>
                      <Input placeholder="ถนน" {...field} />
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
                      <Input placeholder="ตำบล/แขวง" {...field} />
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
                      <Input placeholder="อำเภอ/เขต" {...field} />
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
                      <Input placeholder="จังหวัด" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              ห้องที่เลือก: <strong>{room_number}</strong>
            </div>

            <div className="flex justify-end">
              <Button type="submit">บันทึก</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
