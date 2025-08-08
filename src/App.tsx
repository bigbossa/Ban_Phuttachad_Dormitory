import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RoomsPage from "./pages/RoomsPage";
import RepairsPage from "./pages/RepairsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import TenantsPageOld from "./pages/TenantsPageOld";
import TenantsPage from "./pages/TenantsPage";
import StaffPage from "./pages/StaffPage";
import BillingPage from "./pages/BillingPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { useAuth } from "./providers/AuthProvider";
import ProfilePage from "./pages/ProfilePage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";

// Protected route component that wraps protected pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/rooms"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <RoomsPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/tenants"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <TenantsPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
               <Route
                path="/tenantsold"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <TenantsPageOld />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/staff"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <StaffPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/billing"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <BillingPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/repairs"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <RepairsPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/announcements"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <AnnouncementsPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/reports"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/profile"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-canceled" element={<PaymentCanceled />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
