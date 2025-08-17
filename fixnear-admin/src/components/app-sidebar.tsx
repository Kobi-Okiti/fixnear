import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";

interface RouteItem {
  title: string;
  url: string;
}

const routes: RouteItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Users",
    url: "/users",
  },
  {
    title: "Artisans",
    url: "/artisans",
  },
  {
    title: "Reports",
    url: "/reports",
  },
];

export const AppSidebar: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <Sidebar className="border-none">
      <SidebarHeader className="bg-gray-800" />
      <SidebarContent className="bg-gray-800">
        <SidebarGroup className="flex flex-col gap-5">
          <SidebarGroupLabel className="text-3xl text-white">FixNear</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((item) => {
                const isActive = pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-gray-200 !text-gray-800 font-medium"
                            : "!text-white hover:bg-gray-100 hover:!text-gray-800"
                        }`}
                      >
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-gray-800" />
    </Sidebar>
  );
};
