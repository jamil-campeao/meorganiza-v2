import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { CalendarIcon, BarChart2 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Toaster, toast } from "sonner";
import {
  TransactionChart,
  MonthlyData,
  CategoryData,
} from "../../components/transaction-chart";
import { Label } from "../../components/ui/label";
import { cn } from "../../components/ui/utils";

export function ReportsPage() {
  const { token, logout } = useAuth();
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Estados para os dados dos gráficos
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = async () => {
    if (!token) return;
    if (!date?.from || !date?.to) {
      toast.error("Por favor, selecione um período de datas.");
      return;
    }

    setIsLoading(true);
    try {
      const year = date.from.getFullYear();
      const startDate = format(date.from, "yyyy-MM-dd");
      const endDate = format(date.to, "yyyy-MM-dd");

      // Busca os dois relatórios em paralelo
      const [monthlyResponse, categoryResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/report/monthly-summary?year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_BASE_URL}/report/expenses-by-category?startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      if (!monthlyResponse.ok || !categoryResponse.ok) {
        throw new Error("Não foi possível gerar os relatórios.");
      }

      const monthlyResult = await monthlyResponse.json();
      const categoryResult = await categoryResponse.json();

      // Adiciona cores ao relatório de categoria para o gráfico de pizza
      const colors = [
        "#DC2626",
        "#3B82F6",
        "#F59E0B",
        "#22C55E",
        "#8B5CF6",
        "#ec4899",
      ];
      const categoryDataWithColors = categoryResult.map(
        (item: any, index: number) => ({
          ...item,
          color: colors[index % colors.length],
        })
      );

      setMonthlyData(monthlyResult);
      setCategoryData(categoryDataWithColors);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gera o relatório inicial ao carregar a página
  useEffect(() => {
    generateReport();
  }, [token]);

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Relatórios</h1>
            </div>

            {/* Filtros */}
            <Card className="mb-6 border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {" "}
                              {format(date.from, "dd/MM/yyyy")} -{" "}
                              {format(date.to, "dd/MM/yyyy")}{" "}
                            </>
                          ) : (
                            format(date.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Selecione um período</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  onClick={generateReport}
                  disabled={isLoading}
                  className="self-end bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  {isLoading ? "Gerando..." : "Gerar Relatório"}
                </Button>
              </CardContent>
            </Card>

            {/* Gráficos */}
            {isLoading ? (
              <p className="text-center py-8">Carregando relatórios...</p>
            ) : (
              <TransactionChart
                monthlyData={monthlyData}
                categoryData={categoryData}
              />
            )}
          </div>
        </div>
      </SidebarInset>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
