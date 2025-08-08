
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";

interface RoleSelectorProps {
  control: Control<any>;
  name: string;
}

export const RoleSelector = ({ control, name }: RoleSelectorProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>บทบาท</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="tenant">ผู้เช่า (Tenant)</SelectItem>
              <SelectItem value="staff">พนักงาน (Staff)</SelectItem>
              <SelectItem value="admin">ผู้ดูแลระบบ (Admin)</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
