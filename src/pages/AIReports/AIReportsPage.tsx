import React, { useState, useEffect, FormEvent, useCallback } from "react";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "sonner";
import {
  Bot,
  Send,
  Loader2,
  AlertTriangle,
  FileText,
  Trash2,
  History,
  HelpCircle,
} from "lucide-react";
import { API_BASE_URL } from "../../constants/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

interface GeneratedReport {
  id: string;
  title: string;
  displayType: string;
  data: any;
  userQuestion: string | null;
  createdAt: string;
}
import { CartesianGrid } from "recharts";

type Status = "idle" | "loading" | "success" | "error";
type HistoryStatus = "loading" | "success" | "error";

// Cores padrão para gráficos de pizza
const PIE_COLORS = [
  "#8B3A3A",
  "#DC2626",
  "#F59E0B",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#ec4899",
  "#64748B",
];

export function AIReportsPage() {
  const { token, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [generatedReport, setGeneratedReport] =
    useState<GeneratedReport | null>(null);
  const [historicalReports, setHistoricalReports] = useState<GeneratedReport[]>(
    []
  );
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  // --- Funções da API ---

  const fetchHistoricalReports = useCallback(async () => {
    if (!token) return;
    setHistoryStatus("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/report/ai-generated`, {
        // Endpoint para buscar histórico
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        throw new Error("Não foi possível carregar o histórico de relatórios.");
      }
      let reports: GeneratedReport[] = await response.json();

      reports = reports.map((report) => {
        if (typeof report.data === "string") {
          try {
            return { ...report, data: JSON.parse(report.data) };
          } catch {
            return report;
          }
        }
        return report;
      });

      setHistoricalReports(
        reports.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setHistoryStatus("success");
    } catch (err: any) {
      setHistoryStatus("error");
      toast.error("Erro ao buscar histórico: " + err.message);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchHistoricalReports();
  }, [fetchHistoricalReports]);

  const handleGenerateReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) {
      toast.error("Por favor, digite sua pergunta para gerar o relatório.");
      return;
    }
    if (!token) return;

    setStatus("loading");
    setError(null);
    setGeneratedReport(null);

    try {
      const response = await fetch(`${API_BASE_URL}/report/ai-generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Não foi possível gerar o relatório via IA."
        );
      }

      let result: GeneratedReport = await response.json();

      if (typeof result.data === "string") {
        try {
          result.data = JSON.parse(result.data);
        } catch (parseError) {
          console.warn(
            "Falha ao parsear 'data' do relatório gerado como JSON:",
            parseError
          );
        }
      }

      setGeneratedReport(result);
      setStatus("success");
      setQuery("");
      fetchHistoricalReports();
      toast.success("Relatório gerado com sucesso!");
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      toast.error(err.message);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!token) return;

    const originalReports = [...historicalReports];
    setHistoricalReports((reports) => reports.filter((r) => r.id !== reportId));

    try {
      const response = await fetch(
        `${API_BASE_URL}/report/ai-generated/${reportId}`,
        {
          // Endpoint de delete
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        throw new Error("Não foi possível excluir o relatório.");
      }

      toast.success("Relatório excluído com sucesso!");
    } catch (err: any) {
      setHistoricalReports(originalReports);
      toast.error("Erro ao excluir relatório: " + err.message);
    }
  };

  // --- Funções de Renderização ---

  const renderReportData = (report: GeneratedReport | null) => {
    if (!report) return null;

    let parsedData = report.data;
    if (typeof parsedData === "string") {
      try {
        parsedData = JSON.parse(parsedData);
      } catch {}
    }

    const formatValue = (value: any): string => {
      const num = Number(value);
      if (!isNaN(num)) {
        return num.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      }
      return String(value);
    };

    const formatDateSimple = (value: any): string => {
      if (typeof value === "string") {
        try {
          return new Date(value).toLocaleDateString("pt-BR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        } catch {
          return value;
        }
      }
      return String(value);
    };

    switch (report.displayType) {
      case "text":
        if (
          typeof parsedData === "object" &&
          parsedData !== null &&
          parsedData.hasOwnProperty("value")
        ) {
          return (
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {formatValue(parsedData.value)}
            </p>
          );
        }
        return (
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {String(parsedData)}
          </p>
        );

      case "list":
      case "table":
        if (
          Array.isArray(parsedData) &&
          parsedData.length > 0 &&
          typeof parsedData[0] === "object" &&
          parsedData[0] !== null
        ) {
          const headers = Object.keys(parsedData[0]);
          return (
            <ScrollArea className="max-h-96 w-full overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-[#64748B]/50 text-gray-300 sticky top-0">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-4 py-2 whitespace-nowrap"
                      >
                        {header === "date"
                          ? "Data"
                          : header === "value"
                          ? "Valor"
                          : header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#64748B] hover:bg-[#475569]/50"
                    >
                      {headers.map((header) => (
                        <td
                          key={`${index}-${header}`}
                          className="px-4 py-2 whitespace-nowrap"
                        >
                          {row[header] !== null && row[header] !== undefined
                            ? header === "value"
                              ? formatValue(row[header])
                              : header === "date"
                              ? formatDateSimple(row[header])
                              : String(row[header])
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          );
        }
        if (
          typeof parsedData === "object" &&
          parsedData !== null &&
          parsedData.hasOwnProperty("value")
        ) {
          return (
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {formatValue(parsedData.value)}
            </p>
          );
        }
        return (
          <p className="text-sm text-gray-400">
            Dados indisponíveis ou em formato inesperado para lista/tabela.
          </p>
        );

      case "bar_chart":
        if (
          !Array.isArray(parsedData) ||
          parsedData.length === 0 ||
          !parsedData[0]?.name ||
          parsedData[0]?.value === undefined
        ) {
          return (
            <p className="text-sm text-gray-400">
              Dados do gráfico de barras inválidos ou vazios (esperado: [{"{"}
              name: string, value: number{"}"}]).
            </p>
          );
        }
        const barChartData = parsedData.map((item) => ({
          ...item,
          value: Number(item.value) || 0,
        }));
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#64748B" />
              <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} />
              <YAxis
                stroke="#cbd5e1"
                fontSize={12}
                tickFormatter={(value) => `R$${value}`}
              />
              <RechartsTooltip // Usando o alias RechartsTooltip
                contentStyle={{
                  backgroundColor: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
                formatter={(value: number) => [
                  `R$ ${value.toFixed(2)}`,
                  "Valor",
                ]}
                cursor={{ fill: "#64748B", fillOpacity: 0.3 }}
              />
              <Bar dataKey="value" fill="#8B3A3A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie_chart":
        if (
          !Array.isArray(parsedData) ||
          parsedData.length === 0 ||
          !parsedData[0]?.name ||
          parsedData[0]?.value === undefined
        ) {
          return (
            <p className="text-sm text-gray-400">
              Dados do gráfico de pizza inválidos ou vazios (esperado: [{"{"}
              name: string, value: number{"}"}]).
            </p>
          );
        }
        const pieChartData = parsedData.map((item) => ({
          ...item,
          value: Number(item.value) || 0,
        }));
        const totalValue = pieChartData.reduce(
          (sum, entry) => sum + entry.value,
          0
        );

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip // Usando o alias RechartsTooltip
                contentStyle={{
                  backgroundColor: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
                formatter={(value: number, name) => [
                  `${formatValue(value)} (${
                    totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0
                  }%)`,
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        if (typeof parsedData === "object" && parsedData !== null) {
          return (
            <pre className="text-xs bg-[#2F3748] p-2 rounded overflow-x-auto">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          );
        }
        return (
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {String(parsedData)}
          </p>
        );
    }
  };

  const renderHistory = () => {
    if (historyStatus === "loading") {
      return (
        <div className="text-center py-4">
          <Loader2 className="h-5 w-5 animate-spin inline-block text-gray-400" />{" "}
          Carregando histórico...
        </div>
      );
    }
    if (historyStatus === "error") {
      return (
        <div className="text-center py-4 text-red-400">
          Erro ao carregar histórico.
        </div>
      );
    }
    if (historicalReports.length === 0) {
      return (
        <p className="text-sm text-center text-gray-400 py-4">
          Nenhum relatório gerado anteriormente.
        </p>
      );
    }
    return (
      <ScrollArea className="h-96 pr-4 -mr-4">
        <div className="space-y-4">
          {historicalReports.map((report) => (
            <Card
              key={report.id}
              className="border-[#64748B] bg-[#475569]/50 overflow-hidden"
            >
              <CardHeader className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400 mt-1">
                      "{report.userQuestion || "Consulta anterior"}" -{" "}
                      {new Date(report.createdAt).toLocaleString("pt-BR")}
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:bg-red-900/50 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este relatório gerado?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/80"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="p-3 border-t border-[#64748B]">
                {renderReportData(report)}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderCurrentReportArea = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#8B3A3A]" />
            <p className="text-gray-300">Gerando relatório...</p>
          </div>
        );
      case "error":
        return (
          <div className="text-center py-8 text-red-400">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-semibold">Erro ao gerar relatório</p>
            <p className="text-sm">{error}</p>
          </div>
        );
      case "success":
        if (!generatedReport) return null;
        return (
          <Card className="border-[#64748B] bg-[#475569]/50 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                {generatedReport.title}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Resultado para: "{generatedReport.userQuestion || query}"
                (Gerado em:{" "}
                {new Date(generatedReport.createdAt).toLocaleString("pt-BR")})
              </CardDescription>
            </CardHeader>
            <CardContent>{renderReportData(generatedReport)}</CardContent>
          </Card>
        );
      case "idle":
      default:
        return (
          <div className="text-center py-12 text-gray-400 border-dashed border-2 border-[#64748B] rounded-lg mt-6">
            <Bot size={40} className="mx-auto mb-3 text-gray-500" />
            <p className="text-sm">
              O resultado do seu relatório aparecerá aqui.
            </p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Relatórios com I.A.</h1>

            {/* Seção de Geração de Relatório */}
            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot />
                  Gerador de Relatórios Inteligentes
                </CardTitle>
                <CardDescription>
                  Faça perguntas em linguagem natural sobre seus dados
                  financeiros. A I.A. pode gerar textos, totais, listas, tabelas
                  e gráficos (barras ou pizza). Veja exemplos no ícone de ajuda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-query">Sua Pergunta:</Label>
                    <div className="flex gap-2 items-center">
                      {" "}
                      {/* Adicionado items-center */}
                      <Input
                        id="ai-query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ex: Gráfico de pizza das despesas por categoria..."
                        className="flex-1"
                        disabled={status === "loading"}
                      />
                      {/* ÍCONE DE AJUDA COM TOOLTIP */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-gray-400 hover:text-gray-200"
                              aria-label="Exemplos de perguntas"
                            >
                              <HelpCircle className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          {/* TOOLTIP COM ESTILO bg-popover */}
                          <TooltipContent
                            side="top"
                            className="max-w-xs text-xs bg-popover text-popover-foreground p-2 rounded shadow-lg border border-border"
                          >
                            <p className="font-medium mb-1">
                              Exemplos de Perguntas:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>
                                Qual meu gasto total com [Categoria] em
                                [Mês/Ano]?
                              </li>
                              <li>
                                Liste minhas despesas de [Categoria] nos últimos
                                [X] dias/meses.
                              </li>
                              <li>
                                Gere uma tabela com receitas e despesas de
                                [Mês/Ano].
                              </li>
                              <li>
                                Gráfico de barras das despesas por categoria em
                                [Mês/Ano].
                              </li>
                              <li>
                                Gráfico de pizza da distribuição de receitas
                                este ano.
                              </li>
                              <li>
                                Compare gastos de [Categoria A] e [Categoria B]
                                no último trimestre.
                              </li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        type="submit"
                        className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
                        disabled={status === "loading"}
                      >
                        {status === "loading" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
                {/* Área para exibir o resultado ou mensagens */}
                {renderCurrentReportArea()}
              </CardContent>
            </Card>

            {/* Seção de Histórico */}
            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History />
                  Histórico de Relatórios Gerados
                </CardTitle>
              </CardHeader>
              <CardContent>{renderHistory()}</CardContent>
            </Card>
          </div>
        </div>
        <Toaster theme="dark" position="bottom-right" />
      </SidebarInset>
    </SidebarProvider>
  );
}
