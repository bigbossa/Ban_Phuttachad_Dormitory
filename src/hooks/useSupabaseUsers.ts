import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface SupabaseUser {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  source_table: string;
}

export function useSupabaseUsers() {
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const combinedUsers: SupabaseUser[] = [];

      // ดึงข้อมูลจาก staffs table
      const { data: staffs, error: staffsError } = await supabase
        .from("staffs")
        .select("*")
        .order("created_at", { ascending: false });

      if (staffsError) {
        console.warn("Could not fetch staffs:", staffsError);
      } else if (staffs) {
        console.log("Fetched staffs:", staffs.length);
        staffs.forEach((staff) => {
          combinedUsers.push({
            id: staff.id,
            email: staff.email,
            phone: staff.phone,
            display_name: `${staff.first_name} ${staff.last_name}`,
            created_at: staff.created_at || new Date().toISOString(),
            last_sign_in_at: null,
            role: staff.role,
            source_table: "staffs",
          });
        });
      }

      // ดึงข้อมูลจาก tenants table
      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (tenantsError) {
        console.warn("Could not fetch tenants:", tenantsError);
      } else if (tenants) {
        console.log("Fetched tenants:", tenants.length);
        tenants.forEach((tenant) => {
          combinedUsers.push({
            id: tenant.id,
            email: tenant.email || tenant.auth_email,
            phone: tenant.phone,
            display_name: `${tenant.first_name} ${tenant.last_name}`,
            created_at: tenant.created_at || new Date().toISOString(),
            last_sign_in_at: null,
            role: "tenant",
            source_table: "tenants",
          });
        });
      }

      // ดึงข้อมูลจาก profiles table (ถ้ามี)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.warn("Could not fetch profiles:", profilesError);
      } else if (profiles) {
        console.log("Fetched profiles:", profiles.length);
        profiles.forEach((profile) => {
          // ตรวจสอบว่า profile นี้มีอยู่ใน staffs หรือ tenants แล้วหรือไม่
          const existingUser = combinedUsers.find(
            (user) => user.id === profile.id
          );
          if (!existingUser) {
            combinedUsers.push({
              id: profile.id,
              email: null,
              phone: null,
              display_name: null,
              created_at: profile.created_at,
              last_sign_in_at: null,
              role: profile.role,
              source_table: "profiles",
            });
          }
        });
      }

      // เรียงลำดับตามวันที่สร้าง (ใหม่สุดก่อน)
      combinedUsers.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log("Total combined users:", combinedUsers.length);
      setUsers(combinedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
