
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff" | "tenant" | "visitor";
  profile?: Profile;
  tenant?: Tenant;
};

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

const fetchUserProfile = async (userId: string, userEmail: string) => {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    // Get tenant data if user is a tenant and has tenant_id
    let tenant = null;
    let tenantAction: number | null = null;
    if (profile?.tenant_id) {
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (tenantError) {
        console.error('Error fetching tenant:', tenantError);
      } else {
        tenant = tenantData;
        tenantAction = tenantData.action ?? null;
      }
    }

    // If user is a tenant but no tenant record exists, try to find by email
    if (profile?.role === 'tenant' && !tenant) {
      const { data: tenantByEmail, error: tenantByEmailError } = await supabase
        .from('tenants')
        .select('*')
        .eq('auth_email', userEmail)
        .single();

      if (!tenantByEmailError && tenantByEmail) {
        tenant = tenantByEmail;
        tenantAction = tenantByEmail.action ?? null;

        // Update profile with tenant_id
        await supabase
          .from('profiles')
          .update({ tenant_id: tenant.id })
          .eq('id', userId);
      }
    }

    // Get staff data if user has staff_id
    let staffStatus: number | null = null;
    if (profile?.staff_id) {
      const { data: staffData, error: staffError } = await supabase
        .from('staffs')
        .select('status')
        .eq('id', profile.staff_id)
        .single();

      if (staffError) {
        console.error('Error fetching staff:', staffError);
      } else {
        staffStatus = staffData?.status ?? null;
      }
    }

    // Check action/status access permission
    // admin เข้าได้เลย
    if (profile.role !== 'admin') {
      // tenant ต้อง action === 1
      if (profile.role === 'tenant' && tenantAction !== "1") {
        console.warn('Tenant action is not 1, access denied');
        return null;
      }
      // staff ต้อง status === 1
      if (profile.role === 'staff' && staffStatus !== "1") {
        console.warn('Staff status is not 1, access denied');
        return null;
      }
    }

    return {
      id: userId,
      email: userEmail,
      name: tenant ? `${tenant.first_name} ${tenant.last_name}` : userEmail,
      role: profile.role as "admin" | "staff" | "tenant" | "visitor",
      profile,
      tenant,
      tenantAction,
      staffStatus,
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};


  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid blocking auth state
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id, session.user.email!);
            setUser(userProfile);
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        fetchUserProfile(session.user.id, session.user.email!).then((userProfile) => {
          setUser(userProfile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
  setLoading(true);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setLoading(false);
    throw error;
  }

  if (!data.user) {
    setLoading(false);
    throw new Error("ไม่พบผู้ใช้");
  }

  // เรียก fetchUserProfile ทันที
  const userProfile = await fetchUserProfile(data.user.id, email);

  if (!userProfile) {
    setLoading(false);
    throw new Error("ไม่อนุญาตให้เข้าสู่ระบบ");
  }

  setUser(userProfile);
  setLoading(false);
};


  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
