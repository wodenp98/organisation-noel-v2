"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions";
import { ToggleDarkMode } from "@/components/Theme/Theme";
import { SidebarFooter } from "@/components/ui/sidebar";
export const SidebarFooterComponent = ({ name }: { name: string }) => {
  return (
    <SidebarFooter>
      <div className="flex items-center justify-evenly">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span className="cursor-pointer">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => logout()}
            >
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ToggleDarkMode />
      </div>
    </SidebarFooter>
  );
};
