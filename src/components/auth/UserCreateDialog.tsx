import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useLanguage } from "@/providers/LanguageProvider";
import { ContractPreview } from "@/components/tenants/ContractPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
    if (!tambonsByAmphure[tambon.amphure_id])
      tambonsByAmphure[tambon.amphure_id] = [];
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

const userSchema = z.object({
  email: z.string().email("login.emailInvalid"),
  password: z.string().min(6, "login.passwordInvalid"),
  firstName: z.string().min(1, "profile.enterFirstName"),
  lastName: z.string().min(1, "profile.enterLastName"),
  houseNumber: z.string().min(1, "staff.houseNumber"),
  village: z.string().min(1, "staff.village"),
  street: z.string().optional(),
  subDistrict: z.string().min(1, "staff.subDistrict"),
  district: z.string().min(1, "staff.district"),
  province: z.string().min(1, "staff.province"),
  phone: z.string().optional(),
  role: z.enum(["admin", "staff", "tenant"]),
  roomId: z.string().min(1, "userCreate.roomSelection"),
  zip_code: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface RoomWithOccupancy {
  id: string;
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  current_occupants: number;
  price: number;
  status: string;
}

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  price: number;
  startDate: string;
  endDate: string;
}

export const UserCreateDialog = ({
  open,
  onOpenChange,
  onSuccess,
  price,
  startDate,
  endDate,
}: UserCreateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");
  const [formData, setFormData] = useState<
    (UserFormData & { address?: string }) | null
  >(null);
  const { session, user } = useAuth();
  const { settings } = useSystemSettings();
  const { t } = useLanguage();
  const contractRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const data = useMemo(() => transformData(), []);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
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

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
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
      role: "tenant",
      roomId: "",
      zip_code: "",
    },
  });

  const { data: availableRooms = [] } = useQuery({
    queryKey: ["available-rooms-with-capacity"],
    queryFn: async () => {
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");
      if (roomsError) throw roomsError;

      const roomsWithOccupancy: RoomWithOccupancy[] = await Promise.all(
        rooms.map(async (room) => {
          const { data: occupancyData } = await supabase
            .from("occupancy")
            .select("tenant_id")
            .eq("room_id", room.id)
            .eq("is_current", true);
          return {
            ...room,
            current_occupants: occupancyData?.length || 0,
          };
        })
      );
      return roomsWithOccupancy.filter((room) => {
        return room.status === "vacant" && room.current_occupants === 0;
      });
    },
    enabled: open,
  });

  const getRoomInfoById = (roomId: string) => {
    const room = availableRooms.find((r) => r.id === roomId);
    return room
      ? { room_number: room.room_number, price: settings.depositRate || 0 }
      : { room_number: t("userCreate.roomNotFound"), price: 0 };
  };

  const handleFormSubmit = (data: UserFormData) => {
    const streetPart = data.street
      ? `${t("staff.street")} ${data.street} `
      : `${t("staff.street")} -`;
    const fullAddress = `${t("staff.houseNumber")} ${data.houseNumber} ${t("staff.village")} ${data.village} ${streetPart} ${t("staff.subDistrict")} ${data.subDistrict} ${t("staff.district")} ${data.district} ${t("staff.province")} ${data.province} ${t("staff.zipCode")} ${selectedDistrict?.zip_code}  `;
    setFormData({ ...data, address: fullAddress });
    setStep("review");
  };

  const handleConfirmAndSave = async () => {
    if (!formData || !session?.access_token) {
      toast.error(t("userCreate.sessionError"));
      return;
    }
    if (user?.role !== "admin") {
      toast.error(t("userCreate.permissionError"));
      return;
    }

    // ตรวจสอบว่าห้องที่เลือกยังคงว่างอยู่จริง
    const { data: currentOccupancy, error: occupancyCheckError } =
      await supabase
        .from("occupancy")
        .select("tenant_id")
        .eq("room_id", formData.roomId)
        .eq("is_current", true);

    if (occupancyCheckError) {
      toast.error(t("userCreate.roomCheckError"));
      return;
    }

    if (currentOccupancy && currentOccupancy.length > 0) {
      toast.error(t("userCreate.roomOccupiedError"));
      return;
    }

    setLoading(true);
    try {
      // 1. สร้าง user
      const { data: result, error } = await supabase.functions.invoke(
        "create-user",
        {
          body: {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            role: formData.role,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error || result?.error) {
        toast.error(
          result?.error || error?.message || t("userCreate.createUserError")
        );
        setLoading(false);
        return;
      }
      const userId = result?.user?.id;
      if (!userId) {
        toast.error(t("userCreate.userIdError"));
        setLoading(false);
        return;
      }
      // 2. เพิ่ม tenant
      const roomInfo = getRoomInfoById(formData.roomId);
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          emergency_contact: "",
          residents: t("profile.tenant"),
          room_number: roomInfo.room_number,
          image: " ",
          room_id: formData.roomId,
          action: "1",
        })
        .select("id")
        .single();
      if (tenantError || !tenantData?.id) {
        toast.error(t("userCreate.tenantError"));
        setLoading(false);
        return;
      }

      // 3. เพิ่ม occupancy
      const occupancyInsert = {
        tenant_id: tenantData.id,
        room_id: formData.roomId,
        is_current: true,
        check_in_date: new Date().toISOString(),
      };
      const { error: occupancyError } = await supabase
        .from("occupancy")
        .insert(occupancyInsert);
      if (occupancyError) {
        toast.error(t("userCreate.occupancyError"));
        setLoading(false);
        return;
      }

      // 4. อัปเดตสถานะห้องให้เป็น occupied
      const { error: roomUpdateError } = await supabase
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", formData.roomId);
      if (roomUpdateError) {
        toast.error(t("userCreate.roomUpdateError"));
        setLoading(false);
        return;
      }

      // 5. เพิ่ม profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        tenant_id: tenantData.id,
        staff_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (profileError) {
        toast.error(t("userCreate.profileError"));
        setLoading(false);
        return;
      }

      // 6. สร้างและอัปโหลด PDF ไปยัง API insertimage (base64)
      if (!contractRef.current) {
        toast.error(t("userCreate.contractRefError"));
        setLoading(false);
        return;
      }

      // โหลดฟอนต์ Sarabun
      const link = document.createElement("link");
      link.href =
        "https://fonts.googleapis.com/css2?family=Sarabun&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
      await document.fonts.ready;

      // Render กรอบขาวเป็น canvas
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });
      const imgData = canvas.toDataURL("image/png");

      // สร้าง PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = {
        width: canvas.width,
        height: canvas.height,
      };
      const ratio = Math.min(
        pdfWidth / imgProps.width,
        pdfHeight / imgProps.height
      );
      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;
      pdf.addImage(
        imgData,
        "PNG",
        (pdfWidth - imgWidth) / 2,
        (pdfHeight - imgHeight) / 2,
        imgWidth,
        imgHeight
      );

      // PDF → base64
      const pdfBlob = pdf.output("blob");
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        // ส่งไป API
        const response = await fetch(
          "https://api-drombanput.onrender.com/server/insert_image",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenant_id: tenantData.id,
              image: base64data,
            }),
          }
        );
        const result = await response.json();
        if (result.status === 200) {
          toast.success(t("userCreate.success"));
          form.reset();
          setFormData(null);
          setStep("form");
          onOpenChange(false);
          queryClient.invalidateQueries({ queryKey: ["tenants"] });
          queryClient.invalidateQueries({ queryKey: ["rooms"] });
          queryClient.invalidateQueries({ queryKey: ["occupancy"] });
          queryClient.invalidateQueries({
            queryKey: ["available-rooms-with-capacity"],
          });
          onSuccess?.();
        } else {
          toast.error(
            t("userCreate.uploadPdfError") + ": " + result.message
          );
        }
        setLoading(false);
      };
      reader.readAsDataURL(pdfBlob);
    } catch (err: any) {
      toast.error(t("userCreate.unknownError") + ": " + err.message);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          step === "form" ? "max-w-[600px]" : "max-w-[1100px]"
        } max-h-[95vh] overflow-y-auto`}
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle>
            {step === "form" ? t("userCreate.title") : t("userCreate.review")}
          </DialogTitle>
        </DialogHeader>
        {step === "form" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("userCreate.firstName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("userCreate.firstName")} {...field} />
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
                      <FormLabel>{t("userCreate.lastName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("userCreate.lastName")} {...field} />
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
                    <FormLabel>{t("userCreate.email")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("userCreate.email")} {...field} />
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
                      <FormLabel>{t("userCreate.houseNumber")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("userCreate.houseNumber")} {...field} />
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
                      <FormLabel>{t("userCreate.village")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("userCreate.village")} {...field} />
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
                      <FormLabel>{t("userCreate.street")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("userCreate.street")} {...field} />
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
                      <FormLabel>{t("userCreate.province")}</FormLabel>
                      <FormControl>
                        <MySelect
                          {...field}
                          options={provinceOptions}
                          value={
                            selectedProvince
                              ? {
                                  value: selectedProvince.id,
                                  label: selectedProvince.name_th,
                                }
                              : null
                          }
                          onChange={(option) => {
                            const prov =
                              data.find((p) => p.id === option?.value) || null;
                            setSelectedProvince(prov);
                            setSelectedAmphoe(null);
                            setSelectedDistrict(null);
                            form.setValue("province", option?.label || "");
                            form.setValue("district", "");
                            form.setValue("subDistrict", "");
                          }}
                          placeholder={t("userCreate.province")}
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
                      <FormLabel>{t("userCreate.district")}</FormLabel>
                      <FormControl>
                        <MySelect
                          {...field}
                          options={amphoeOptions}
                          value={
                            selectedAmphoe
                              ? {
                                  value: selectedAmphoe.id,
                                  label: selectedAmphoe.name_th,
                                }
                              : null
                          }
                          onChange={(option) => {
                            if (!selectedProvince) return;
                            const amp =
                              selectedProvince.amphoes.find(
                                (a) => a.id === option?.value
                              ) || null;
                            setSelectedAmphoe(amp);
                            setSelectedDistrict(null);
                            form.setValue("district", option?.label || "");
                            form.setValue("subDistrict", "");
                          }}
                          placeholder={
                            selectedProvince
                              ? t("userCreate.district")
                              : t("userCreate.selectProvinceFirst")
                          }
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
                      <FormLabel>{t("userCreate.subDistrict")}</FormLabel>
                      <FormControl>
                        <MySelect
                          {...field}
                          options={districtOptions}
                          value={
                            selectedDistrict
                              ? {
                                  value: selectedDistrict.id,
                                  label: selectedDistrict.name_th,
                                }
                              : null
                          }
                          onChange={(option) => {
                            if (!selectedAmphoe) return;
                            const dist =
                              selectedAmphoe.districts.find(
                                (d) => d.id === option?.value
                              ) || null;
                            setSelectedDistrict(dist);
                            form.setValue("subDistrict", option?.label || "");
                          }}
                          placeholder={
                            selectedAmphoe
                              ? t("userCreate.subDistrict")
                              : t("userCreate.selectDistrictFirst")
                          }
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
                <label className="block mb-1 font-medium">{t("userCreate.zipCode")}</label>
                <input
                  type="text"
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={selectedDistrict?.zip_code || ""}
                  placeholder={t("userCreate.zipCode")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("userCreate.phoneOptional")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("userCreate.phoneOptional")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>{t("userCreate.role")}</FormLabel>
                  <span className="block py-2 px-3 rounded bg-muted text-muted-foreground">
                    {t("userCreate.roleTenant")}
                  </span>
                  <input type="hidden" name="role" value="tenant" />
                </FormItem>
              </div>
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("userCreate.roomSelection")}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("userCreate.roomSelectionPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {availableRooms.length === 0 ? (
                          <div className="px-3 py-2 text-muted-foreground text-sm">
                            {t("userCreate.noVacantRooms")}
                          </div>
                        ) : (
                          availableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {t("rooms.room")} {room.room_number} - {room.room_type}{" "}
                                  ({t("rooms.floor")} {room.floor})
                                </span>
                                <div className="flex items-center gap-2 ml-2">
                                  <Badge variant="secondary">{t("userCreate.roomStatus")}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {(settings.depositRate || 0).toLocaleString()}{" "}
                                    {t("userCreate.roomPrice")}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("userCreate.password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("userCreate.password")}
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
              <div className="flex justify-end pt-4">
                <Button type="submit">{t("userCreate.next")}</Button>
              </div>
            </form>
          </Form>
        )}
        {step === "review" && formData && (
          <div className="space-y-4 text-sm max-h-[600px] overflow-y-auto">
            {(() => {
              const roomInfo = getRoomInfoById(formData.roomId);
              return (
                <div
                  ref={contractRef}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    margin: "auto",
                    width: "210mm",
                    height: "297mm",
                  }}
                >
                  <ContractPreview
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                    room_number={roomInfo.room_number}
                    startDate={startDate}
                    endDate={endDate}
                    price={roomInfo.price}
                    address={formData.address}
                    phone={formData.phone}
                    email={formData.email}
                    contractDate={new Date().toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    contractPlace={t("contract.place")}
                  />
                </div>
              );
            })()}
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={handleConfirmAndSave} disabled={loading}>
                {loading ? t("userCreate.creating") : t("userCreate.confirm")}
              </Button>
              <Button variant="outline" onClick={() => setStep("form")}>
                {t("userCreate.back")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
