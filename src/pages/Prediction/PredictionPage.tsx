import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "sonner";
import { Bot, BarChart2, Loader2, AlertTriangle, RefreshCw, CalendarDays } from "lucide-react";
import { API_BASE_URL } from "../../constants/api";

interface ForecastData {
  id: number;
  futureBalance: number;
  analysisSummary: string;
  forecastDate: string;
  userId: number;
}

type Status = 'initial_loading' | 'idle' | 'loading' | 'success' | 'error';

export function PredictionPage() {
  const { token, logout } = useAuth();
  const [status, setStatus] = useState<Status>('initial_loading');
  const [prediction, setPrediction] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastPrediction = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/predict-balance/last`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.status === 401) {
          logout();
          return;
        }

        if (response.ok) {
          const result = await response.json();
          if (result) {
            setPrediction(result);
            setStatus('success');
          } else {
            // Nenhuma previsão encontrada, fica no estado ocioso
            setStatus('idle');
          }
        } else {
            // Se houver outro erro na busca, vai para o estado de erro
            throw new Error("Não foi possível carregar a previsão anterior.");
        }
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      }
    };

    fetchLastPrediction();
  }, [token, logout]);


const handleGeneratePrediction = async () => {
    if (!token) return;

    setStatus('loading');
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict-balance`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Não foi possível gerar a previsão.");
      }

      const result: ForecastData = await response.json();
      setPrediction(result);
      setStatus('success');
      toast.success("Previsão gerada com sucesso!");

    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      toast.error(err.message);
    }
  };
  
  const resetState = () => {
    setStatus('idle');
    setPrediction(null);
    setError(null);
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const renderContent = () => {
    switch (status) {
      case 'initial_loading':
        return (
            <div className="text-center py-8 flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-gray-400">Buscando última previsão...</p>
            </div>
        );
      case 'idle':
        return (
          <div className="text-center py-8">
            <p className="mb-4 text-gray-400">Nenhuma previsão encontrada. Clique no botão para gerar sua primeira análise.</p>
            <Button onClick={handleGeneratePrediction} className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80">
              <BarChart2 className="mr-2 h-4 w-4" />
              Gerar Previsão
            </Button>
          </div>
        );
      case 'loading':
         return (
             <div className="text-center py-8 flex flex-col items-center gap-4">
                 <Loader2 className="h-8 w-8 animate-spin text-[#8B3A3A]" />
                 <p className="text-gray-300">Analisando seu histórico financeiro...</p>
                 <p className="text-sm text-gray-400">Isso pode levar alguns instantes. Por favor, aguarde.</p>
             </div>
         );
      case 'error':
        return (
           <div className="text-center py-8 text-red-400">
             <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
             <p className="font-semibold">Ocorreu um erro</p>
             <p className="text-sm mb-4">{error}</p>
             <Button onClick={handleGeneratePrediction} variant="outline">
               <RefreshCw className="mr-2 h-4 w-4" />
               Tentar Novamente
             </Button>
           </div>
        );
      case 'success':
        if (!prediction) return null;
        return (
          <div className="space-y-6">
            <div className="text-center p-6 bg-[#475569] rounded-lg">
              <p className="text-sm text-gray-300">Previsão de Saldo para o Próximo Mês</p>
              <p className="text-4xl font-bold text-green-400">{formatCurrency(prediction.futureBalance)}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
                <CalendarDays className="h-4 w-4" />
                <span>Análise gerada em: {formatDate(prediction.forecastDate)}</span>
              </div>
            </div>
            <Card className="border-[#64748B]">
              <CardHeader>
                <CardTitle className="text-base">Resumo da Análise da I.A.</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{prediction.analysisSummary}</p>
              </CardContent>
            </Card>
            <div className="text-center pt-4">
               <Button onClick={handleGeneratePrediction} className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80">
                 <RefreshCw className="mr-2 h-4 w-4" />
                 Gerar Nova Previsão
               </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Previsão de Saldo com I.A.</h1>
            
            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot />
                  Análise Preditiva
                </CardTitle>
                <CardDescription>
                  Utilize a inteligência artificial para analisar seu histórico e prever seu saldo futuro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>
        <Toaster theme="dark" />
      </SidebarInset>
    </SidebarProvider>
  );
}