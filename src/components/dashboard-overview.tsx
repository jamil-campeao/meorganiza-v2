import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  LucideIcon,
} from "lucide-react";

interface OverviewCard {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
}
interface DashboardOverviewProps {
  summaryData: {
    balance: number;
    income: number;
    expenses: number;
    forecast: number;
  };
}

// Função para formatar os números como moeda (Real Brasileiro)
const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export function DashboardOverview({ summaryData }: DashboardOverviewProps) {
  // 4. Transformamos os dados recebidos no formato que o componente precisa para renderizar.
  const overviewData: OverviewCard[] = [
    {
      title: "Saldo Total",
      value: formatCurrency(summaryData.balance),
      icon: Wallet,
      color: "#3B82F6",
    },
    {
      title: "Receitas do Mês",
      value: formatCurrency(summaryData.income),
      trend: "up",
      icon: TrendingUp,
      color: "#22C55E",
    },
    {
      title: "Despesas do Mês",
      value: formatCurrency(summaryData.expenses),
      trend: "down",
      icon: TrendingDown,
      color: "#DC2626",
    },
    {
      title: "Previsão de Saldo",
      value: formatCurrency(summaryData.forecast),
      icon: Target,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {overviewData.map((item) => (
        <Card key={item.title} className="border border-[#64748B] bg-[#3F4A5C]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#E2E8F0]">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4" style={{ color: item.color }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E2E8F0]">
              {item.value}
            </div>
            {item.change && (
              <p
                className={`text-xs ${
                  item.trend === "up" ? "text-[#22C55E]" : "text-[#DC2626]"
                }`}
              >
                {item.change}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
