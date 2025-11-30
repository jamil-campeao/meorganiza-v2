import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  AlertTriangle,
  Calendar,
  Wallet,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { Button } from "./ui/button";
import { toast } from "sonner";
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
} from "./ui/alert-dialog";

interface BillPayment {
  id: number;
  dueDate: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  bill: {
    description: string;
    accountId: number | null;
    cardId: number | null;
  };
}

interface BillAlertsProps {
  onDataChange: () => void;
}

export function BillAlerts({ onDataChange }: BillAlertsProps) {
  const { token } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<BillPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  const fetchPendingBills = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bill/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error("Não foi possível carregar as contas pendentes.");
      const data: BillPayment[] = await response.json();
      setPendingPayments(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBills();
  }, [token]);

  const handlePayBill = async (paymentId: number) => {
    if (!token) return;
    setPayingId(paymentId);

    try {
      const response = await fetch(`${API_BASE_URL}/bill/pay/${paymentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao pagar a conta.");
      }
      toast.success("Conta paga com sucesso! Uma nova despesa foi registrada.");
      onDataChange();
      setPendingPayments(pendingPayments.filter((p) => p.id !== paymentId));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPayingId(null);
    }
  };

  const getStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "vencida", daysLeft: diffDays };
    if (diffDays <= 7) return { status: "vencendo", daysLeft: diffDays };
    return { status: "normal", daysLeft: diffDays };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vencida":
        return "bg-[#DC2626] text-[#F8FAFC]";
      case "vencendo":
        return "bg-[#F59E0B] text-[#1F2937]";
      default:
        return "bg-transparent text-gray-400";
    }
  };

  const getStatusText = (status: string, daysLeft: number) => {
    if (status === "vencida") return `Vencida há ${Math.abs(daysLeft)} dias`;
    if (status === "vencendo") return `Vence em ${daysLeft} dias`;
    return `Vence em ${daysLeft} dias`;
  };

  const billsToDisplay = pendingPayments.filter((p) => !p.bill.cardId);

  return (
    <Card className="border border-[#64748B] bg-[#3F4A5C]">
      <CardHeader>
        <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
          Alertas de Vencimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Carregando...</p>
        ) : billsToDisplay.length === 0 ? (
          <p className="text-sm text-gray-400">
            Nenhuma conta pendente para exibir. Tudo em dia!
          </p>
        ) : (
          <div className="space-y-4">
            {billsToDisplay.map((payment) => {
              const { status, daysLeft } = getStatus(payment.dueDate);
              const isPaying = payingId === payment.id;

              return (
                <div
                  key={payment.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-[#64748B]/20 border border-[#64748B] gap-4 md:gap-0"
                >
                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div
                      className={`p-2 rounded-full ${
                        status === "vencida"
                          ? "bg-[#DC2626]/20"
                          : status === "vencendo"
                          ? "bg-[#F59E0B]/20"
                          : "bg-[#3B82F6]/20"
                      }`}
                    >
                      <Wallet
                        className={`h-4 w-4 ${
                          status === "vencida"
                            ? "text-[#DC2626]"
                            : status === "vencendo"
                            ? "text-[#F59E0B]"
                            : "text-[#3B82F6]"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-[#E2E8F0] font-medium">
                        {payment.bill.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-[#E2E8F0]/70" />
                        <span className="text-xs text-[#E2E8F0]/70">
                          Vence em{" "}
                          {new Date(payment.dueDate).toLocaleDateString(
                            "pt-BR",
                            { timeZone: "UTC" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-[#E2E8F0] font-semibold">
                        R$ {Number(payment.amount).toFixed(2)}
                      </p>
                      <Badge className={`mt-1 ${getStatusColor(status)}`}>
                        {getStatusText(status, daysLeft)}
                      </Badge>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 transition-colors"
                          disabled={isPaying}
                        >
                          {isPaying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              {" "}
                              <CheckCircle className="h-4 w-4 mr-2" /> Pagar{" "}
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar Pagamento
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja marcar a conta "{payment.bill.description}"
                            no valor de R$ {Number(payment.amount).toFixed(2)}{" "}
                            como paga? Uma transação de despesa será criada.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePayBill(payment.id)}
                          >
                            Confirmar Pagamento
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
