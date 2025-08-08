import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  Home,
  Users,
  DoorClosed,
  Receipt,
  Wrench,
  Calendar,
  FileBarChart,
  Settings,
  UserCircle,
  Settings2,
} from "lucide-react";

interface SidebarProps {
  closeSidebar?: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const adminLinks = [
    {
      name: t("nav.dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    {
      name: t("nav.rooms"),
      href: "/rooms",
      icon: DoorClosed,
    },
    {
      name: t("nav.tenants"),
      href: "/tenants",
      icon: Users,
    },
    {
      name: t("nav.tenantsold"),
      href: "/tenantsold",
      icon: Users,
    },
    {
      name: t("nav.staff"),
      href: "/staff",
      icon: UserCircle,
    },
    {
      name: t("nav.billing"),
      href: "/billing",
      icon: Receipt,
    },
    {
      name: t("nav.repairs"),
      href: "/repairs",
      icon: Wrench,
    },
    {
      name: t("nav.announcements"),
      href: "/announcements",
      icon: Calendar,
    },
    {
      name: t("nav.reports"),
      href: "/reports",
      icon: FileBarChart,
    },
    {
      name: t("nav.settings"),
      href: "/settings",
      icon: Settings,
    },
  ];

  const staffLinks = [
    {
      name: t("nav.dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    {
      name: t("nav.rooms"),
      href: "/rooms",
      icon: DoorClosed,
    },
    {
      name: t("nav.tenants"),
      href: "/tenants",
      icon: Users,
    },
    {
      name: t("nav.billing"),
      href: "/billing",
      icon: Receipt,
    },
    {
      name: t("nav.repairs"),
      href: "/repairs",
      icon: Wrench,
    },
    {
      name: t("nav.profile"),
      href: "/profile",
      icon: UserCircle,
    },
  ];

  const tenantLinks = [
    {
      name: t("nav.dashboard"),
      href: "/dashboard",
      icon: Home,
    },
    {
      name: t("nav.billing"),
      href: "/billing",
      icon: Receipt,
    },
    {
      name: t("nav.repairs"),
      href: "/repairs",
      icon: Wrench,
    },
    {
      name: t("nav.announcements"),
      href: "/announcements",
      icon: Calendar,
    },
    {
      name: t("nav.profile"),
      href: "/profile",
      icon: UserCircle,
    },
  ];

  let navigationLinks;
  switch (user?.role) {
    case "admin":
      navigationLinks = adminLinks;
      break;
    case "staff":
      navigationLinks = staffLinks;
      break;
    case "tenant":
      navigationLinks = tenantLinks;
      break;
    default:
      navigationLinks = [];
  }

  return (
    <nav className="mt-5 px-2 space-y-1">
      {navigationLinks.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={closeSidebar}
            className={cn(
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            )}
          >
            <item.icon
              className={cn(
                isActive
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                "mr-3 flex-shrink-0 h-5 w-5"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
