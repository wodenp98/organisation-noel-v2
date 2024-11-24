import { Gift, ChefHat } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarFooterComponent } from "@/components/Sidebar/SidebarFooterComponent";

export async function AppSidebar() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const items = [
    {
      title: "Cadeaux",
      url: "/",
      icon: Gift,
    },
    {
      title: "Manger",
      url: "/manger",
      icon: ChefHat,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooterComponent name={session.user?.name as string} />
    </Sidebar>
  );
}
