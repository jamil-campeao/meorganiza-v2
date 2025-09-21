import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { Bill } from "../pages/Bills/BillsPage";

export function BillAlerts() {
  const { token } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/bill`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error("Não foi possível carregar as contas.");
        const data: Bill[] = await response.json();
        setBills(data);
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBills();
  }, [token]);

  const getStatus = (dueDate: string) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "vencida", daysLeft: diffDays };
    if (diffDays <= 5) return { status: "vencendo", daysLeft: diffDays };
    return { status: "normal", daysLeft: diffDays };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vencida":
        return "bg-[#DC2626] text-[#F8FAFC]";
      case "vencendo":
        return "bg-[#F59E0B] text-[#1F2937]";
      default:
        return "bg-[#3B82F6] text-[#F8FAFC]";
    }
  };

  const getStatusText = (status: string, daysLeft: number) => {
    if (status === "vencida") return "Vencida";
    if (status === "vencendo") return `${daysLeft} dias`;
    return `${daysLeft} dias`;
  };

  if (isLoading) {
    return (
      <Card className="border border-[#64748B] bg-[#3F4A5C]">
        <CardHeader>
          <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#64748B] bg-[#3F4A5C]">
      <CardHeader>
        <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
          Alertas de Vencimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills
            .filter((bill) => !bill.isPaid)
            .map((bill) => {
              const { status, daysLeft } = getStatus(bill.dueDate);
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#64748B]/20 border border-[#64748B]"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        status === "vencida"
                          ? "bg-[#DC2626]/20"
                          : status === "vencendo"
                          ? "bg-[#F59E0B]/20"
                          : "bg-[#3B82F6]/20"
                      }`}
                    >
                      {status === "vencida" ? (
                        <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                      ) : (
                        <CreditCard
                          className={`h-4 w-4 ${
                            status === "vencendo"
                              ? "text-[#F59E0B]"
                              : "text-[#3B82F6]"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-[#E2E8F0] font-medium">
                        {bill.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-[#E2E8F0]/70" />
                        <span className="text-xs text-[#E2E8F0]/70">
                          Vence em{" "}
                          {new Date(bill.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#E2E8F0] font-semibold">
                      R$ {bill.amount}
                    </p>
                    <Badge className={`mt-1 ${getStatusColor(status)}`}>
                      {getStatusText(status, daysLeft)}
                    </Badge>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
