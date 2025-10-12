"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "@/components/auth/logout-button";
import { DashboardIcon, ExitIcon, GearIcon, BarChartIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { ChevronDown, Home } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import Link from "next/link";



export const UserButton = () => {
  const user = useCurrentUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
            <Avatar>
            {user?.image ? (
              <AvatarImage src={user.image} alt="User Avatar" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
              {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            </Avatar>
          <span className="hidden md:inline">{user?.name || "Guest"}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LINKS.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href} className="flex items-center gap-4">
              {link.logo}
              <span>
                {link.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="h-4 w-4 mr-2" />
            <span className="ml-2">
            Logout
            </span>
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


const LINKS = [
  { label: "Home", href: "/", logo: <Home className="h-5 w-5" /> },
  { label: "Dashboard", href: "/dashboard", logo: <DashboardIcon className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", logo: <GearIcon className="h-5 w-5" /> },
  { label: "Payroll", href: "/payments", logo: <BarChartIcon className="h-5 w-5" /> },
];