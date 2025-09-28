import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Coins,
  LogOut,
  User,
  Settings,
  Tags,
  Landmark,
  CreditCard,
  Bell,
  Receipt,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export function SideBarMenu() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#8B3A3A] rounded-lg flex items-center justify-center">
            <Wallet className="h-6 w-6 text-[#F8FAFC]" />
          </div>
          <h1 className="text-xl font-bold text-[#E2E8F0]">MeOrganiza</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/dashboard"}
            >
              <Link to="/dashboard">
                <LayoutDashboard />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/categories"}
            >
              <Link to="/categories">
                <Tags />
                Categorias
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/accounts"}
            >
              <Link to="/accounts">
                <Landmark />
                Contas
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/cards"}
            >
              <Link to="/cards">
                <CreditCard />
                Cartões
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/bills"}
            >
              <Link to="/bills">
                <Bell />
                Contas a Pagar
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/transactions"}
            >
              <Link to="/transactions">
                <ArrowRightLeft />
                Transações
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/investments"}
            >
              <Link to="/investments">
                <Coins />
                Investimentos
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/invoices"}
            >
              <Link to="/invoices">
                <Receipt />
                Faturas
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/profile"}
            >
              <Link to="/profile">
                <User />
                Meu Perfil
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === "/settings"}
            >
              <Link to="/settings">
                <Settings />
                Configurações
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sair">
              <LogOut />
              Sair
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
