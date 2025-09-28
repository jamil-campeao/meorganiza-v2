// src/pages/Dashboard/DashboardPage.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";

import { DashboardOverview } from "../../components/dashboard-overview";
import {
  TransactionChart,
  MonthlyData,
  CategoryData,
} from "../../components/transaction-chart";
import { QuickTransactionForm } from "../../components/quick-transaction-form";
import { RecentTransactions } from "../../components/recent-transactions";
import { BillAlerts } from "../../components/bill-alerts";
import { InvestmentSummary } from "../../components/investment-summary";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Toaster } from "../../components/ui/sonner";
import {
  BarChart3,
  DollarSign,
  PlusCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { SideBarMenu } from "../../components/SideBarMenu";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";

interface Transaction {
  id: string;
  date: string;
  description: string;
  value: string;
  type: "RECEITA" | "DESPESA";
  category: string;
}

interface SummaryData {
  balance: number;
  income: number;
  expenses: number;
  forecast: number;
}

export function DashboardPage() {
  const { token, logout } = useAuth();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyData[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<CategoryData[]>(
    []
  );

  // ... (mantenha sua lógica de fetch e formatação de dados aqui)
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const transactionsResponse = await fetch(
          `${API_BASE_URL}/transaction`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (transactionsResponse.status === 401) {
          logout();
          return;
        }
        if (!transactionsResponse.ok)
          throw new Error("Erro ao obter transações");

        const transactions: any[] = await transactionsResponse.json();
        setRecentTransactions(transactions.slice(0, 4));

        const totalIncome = transactions
          .filter((t) => t.type === "RECEITA")
          .reduce((sum, t) => sum + parseFloat(t.value), 0);

        const totalExpenses = transactions
          .filter((t) => t.type === "DESPESA")
          .reduce((sum, t) => sum + parseFloat(t.value), 0);

        const currentBalance = totalIncome - totalExpenses;

        const forecast = 0;

        setSummaryData({
          balance: currentBalance,
          income: totalIncome,
          expenses: totalExpenses,
          forecast: forecast,
        });

        const monthlySummary: {
          [key: string]: { receitas: number; despesas: number };
        } = {};
        const monthNames = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];

        transactions.forEach((t) => {
          const monthIndex = new Date(t.date).getMonth();
          const monthName = monthNames[monthIndex];

          if (!monthlySummary[monthName]) {
            monthlySummary[monthName] = { receitas: 0, despesas: 0 };
          }

          if (t.type === "RECEITA") {
            monthlySummary[monthName].receitas += parseFloat(t.value);
          } else {
            monthlySummary[monthName].despesas += parseFloat(t.value);
          }
        });

        const processedMonthlyData: MonthlyData[] = Object.keys(
          monthlySummary
        ).map((month) => ({
          month,
          receitas: monthlySummary[month].receitas,
          despesas: monthlySummary[month].despesas,
        }));

        setMonthlyChartData(processedMonthlyData);

        const categorySummary: { [key: string]: number } = {};
        const colors = [
          "#DC2626",
          "#3B82F6",
          "#F59E0B",
          "#22C55E",
          "#8B5CF6",
          "#ec4899",
        ];
        let colorIndex = 0;

        transactions
          .filter((t: any) => t.type === "DESPESA")
          .forEach((t: any) => {
            const categoryName = t.category.description;
            if (!categorySummary[categoryName]) {
              categorySummary[categoryName] = 0;
            }
            categorySummary[categoryName] += parseFloat(t.value);
          });

        const processedCategoryData: CategoryData[] = Object.keys(
          categorySummary
        ).map((name) => ({
          name,
          value: categorySummary[name],
          color: colors[colorIndex++ % colors.length],
        }));

        setCategoryChartData(processedCategoryData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, logout]);

  if (isLoading) {
    return <div className="p-6">Carregando dados...</div>;
  }

  if (error) {
    return <div className="p-6">Erro ao carregar dados: {error}</div>;
  }

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              {summaryData && <DashboardOverview summaryData={summaryData} />}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-[#475569] rounded-lg p-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-[#8B3A3A] data-[state=active]:text-[#F8FAFC] text-[#E2E8F0] flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="data-[state=active]:bg-[#8B3A3A] data-[state=active]:text-[#F8FAFC] text-[#E2E8F0] flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" /> Transações
                </TabsTrigger>
                <TabsTrigger
                  value="add"
                  className="data-[state=active]:bg-[#8B3A3A] data-[state=active]:text-[#F8FAFC] text-[#E2E8F0] flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" /> Adicionar
                </TabsTrigger>
                <TabsTrigger
                  value="bills"
                  className="data-[state=active]:bg-[#8B3A3A] data-[state=active]:text-[#F8FAFC] text-[#E2E8F0] flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" /> Contas
                </TabsTrigger>
                <TabsTrigger
                  value="investments"
                  className="data-[state=active]:bg-[#8B3A3A] data-[state=active]:text-[#F8FAFC] text-[#E2E8F0] flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" /> Investimentos
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="data-[state=active]:bg-[#8B3A3A] data-[state=active]:text-[#F8FAFC] text-[#E2E8F0] flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" /> Relatórios
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <TransactionChart
                  monthlyData={monthlyChartData}
                  categoryData={categoryChartData}
                />
                <div className="grid gap-6 md:grid-cols-2">
                  <RecentTransactions transactions={recentTransactions} />
                  <BillAlerts />
                </div>
              </TabsContent>

              <TabsContent value="transactions">
                <RecentTransactions transactions={recentTransactions} />
              </TabsContent>

              <TabsContent value="add">
                <QuickTransactionForm />
              </TabsContent>

              <TabsContent value="bills">
                <BillAlerts />
              </TabsContent>

              <TabsContent value="investments">
                <InvestmentSummary />
              </TabsContent>

              <TabsContent value="reports">
                <TransactionChart
                  monthlyData={monthlyChartData}
                  categoryData={categoryChartData}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Toaster theme="dark" />
      </SidebarInset>
    </SidebarProvider>
  );
}
