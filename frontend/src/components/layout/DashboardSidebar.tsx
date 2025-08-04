import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  Building2,
  Target,
  Bell,
  Settings,
  Menu,
  TrendingUp,
  FileText,
  Lightbulb
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: "Kommunikation",
    url: "/communication",
    icon: MessageSquare,
    badge: 5,
    items: [
      { title: "ToDo-Listen", url: "/communication/todos", icon: FileText },
      { title: "Marketing-Partner", url: "/communication/partners", icon: Users },
      { title: "KI-Impulse", url: "/communication/ai-insights", icon: Lightbulb }
    ]
  },
  {
    title: "LinkedIn Planer",
    url: "/linkedin",
    icon: Calendar,
    badge: 3,
    items: [
      { title: "Post-Editor", url: "/linkedin/editor", icon: FileText },
      { title: "Kalender", url: "/linkedin/calendar", icon: Calendar },
      { title: "Analytics", url: "/linkedin/analytics", icon: BarChart3 }
    ]
  },
  {
    title: "Projekte",
    url: "/projects",
    icon: Building2,
    badge: 8,
    items: [
      { title: "Immobilien", url: "/projects/properties", icon: Building2 },
      { title: "Kampagnen", url: "/projects/campaigns", icon: Target },
      { title: "Leads & CRM", url: "/projects/leads", icon: Users },
      { title: "Terminplanung", url: "/projects/calendar", icon: Calendar }
    ]
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: TrendingUp,
    badge: null
  },
  {
    title: "Benachrichtigungen",
    url: "/notifications",
    icon: Bell,
    badge: 12
  },
  {
    title: "Einstellungen",
    url: "/settings",
    icon: Settings,
    badge: null
  }
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (group: any) => {
    if (isActive(group.url)) return true;
    return group.items?.some((item: any) => isActive(item.url));
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(g => g !== title)
        : [...prev, title]
    );
  };

  const getNavClasses = (isActive: boolean) =>
    isActive
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-card`}
      collapsible="icon"
    >
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-sm">Immobilien Dashboard</h1>
            <p className="text-xs text-muted-foreground">Sarah Weber</p>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isGroupActiveState = isGroupActive(item);
                const isExpanded = expandedGroups.includes(item.title) || isGroupActiveState;

                return (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        {item.items ? (
                          <button
                            onClick={() => toggleGroup(item.title)}
                            className={`w-full flex items-center justify-between ${getNavClasses(isGroupActiveState)}`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              {!collapsed && <span className="text-sm">{item.title}</span>}
                            </div>
                            {!collapsed && (
                              <div className="flex items-center gap-2">
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                                <div className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                                  ▶
                                </div>
                              </div>
                            )}
                          </button>
                        ) : (
                          <NavLink
                            to={item.url}
                            className={({ isActive }) => `flex items-center justify-between w-full ${getNavClasses(isActive)}`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              {!collapsed && <span className="text-sm">{item.title}</span>}
                            </div>
                            {!collapsed && item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Sub-items */}
                    {item.items && isExpanded && !collapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.items.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={subItem.url}
                                className={({ isActive }) => `flex items-center gap-3 text-sm ${getNavClasses(isActive)}`}
                              >
                                <subItem.icon className="h-3 w-3" />
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}