import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  PlusCircle,
  Edit,
  Trash2,
  DollarSign,
  BarChartHorizontalBig,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { DebtForm } from "../../components/DebtForm";
import { DebtPaymentForm } from "../../components/DebtPaymentForm";
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
import { Toaster, toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Bank } from "../Accounts/AccountsPage";
import { debtTypes } from "../../components/DebtForm";
import { Transaction } from "../Transactions/TransactionsPage";
export interface DebtData {
  id: number;
  description: string;
  creditor: string | null;
  type: string;
  initialAmount: number;
  outstandingBalance: number;
  interestRate: number | null;
  minimumPayment: number | null;
  paymentDueDate: number | null;
  startDate: string;
  estimatedEndDate: string | null;
  status: string; // 'ACTIVE', 'PAID_OFF', 'PENDING', 'CANCELLED'
  userId: number;
  bankId: string | null;
  bank: Bank | null;
  createdAt: string;
  updatedAt: string;
  debtPayments: any[];
}

export interface PaymentFormData {
  date: string;
  categoryId: number;
  accountId: number;
  targetAccountId: number;
  amountPaid: number;
}

export interface DebtPayment {
  id: number;
  amount: number;
  paymentDate: string;
  debtId: number;
  transactionId: number;
  transaction: Transaction;
}

export interface PaymentData {
  debtPayments: DebtPayment[];
}

export function DebtsPage() {
  const { token, logout } = useAuth();
  const [debts, setDebts] = useState<DebtData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false); // Estado para modal de pagamento
  const [editingDebt, setEditingDebt] = useState<DebtData | null>(null);
  const [payingDebt, setPayingDebt] = useState<DebtData | null>(null);
  const [summaryDebt, setSummaryDebt] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/debt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) logout();
      if (!response.ok)
        throw new Error("Não foi possível carregar as dívidas.");
      const data: DebtData[] = await response.json();
      setDebts(data);
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro ao carregar dívidas: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [token, logout]);

  const handleAddNew = () => {
    setEditingDebt(null);
    setIsFormOpen(true);
  };

  const handleEdit = (debt: DebtData) => {
    setEditingDebt(debt);
    setIsFormOpen(true);
  };

  const handleOpenPayDialog = (debt: DebtData) => {
    setPayingDebt(debt);
    setIsPaymentFormOpen(true);
  };

  const handleOpenSummary = async (debt: DebtData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/debt/payments/${debt.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar o resumo da dívida.");
      }

      const data: PaymentData = await response.json();
      setSummaryDebt(data);
    } catch (error) {
      toast.error("Falha ao carregar o resumo da dívida.");
    }
    setIsSummaryModalOpen(true);
  };

  const handleSave = async (
    debtData: Omit<
      DebtData,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "user"
      | "bank"
      | "debtPayments"
      | "userId"
    >
  ) => {
    if (!token) return;
    const isEditing = !!editingDebt;
    const url = isEditing
      ? `${API_BASE_URL}/debt/${editingDebt.id}`
      : `${API_BASE_URL}/debt`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debtData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(
          err.message || `Falha ao ${isEditing ? "atualizar" : "criar"} dívida.`
        );
      }
      toast.success(
        `Dívida ${isEditing ? "atualizada" : "criada"} com sucesso!`
      );
      setIsFormOpen(false);
      fetchDebts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSavePayment = async (paymentData: PaymentFormData) => {
    if (!token || !payingDebt) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/debt/pay/${payingDebt.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Falha ao registrar pagamento.");
      }
      const result = await response.json();
      toast.success(result.message || "Pagamento registrado com sucesso!");
      setIsPaymentFormOpen(false);
      fetchDebts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (debt: DebtData) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/debt/${debt.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        // Se for 400 por já estar quitada, mostre um aviso diferente
        if (response.status === 400 && err.message?.includes("quitada")) {
          toast.warning(err.message);
          return;
        }
        throw new Error(err.message || "Falha ao cancelar a dívida.");
      }
      toast.success("Dívida cancelada com sucesso!");
      fetchDebts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Funções auxiliares de formatação
  const formatCurrency = (value: number | null | undefined) =>
    value
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)
      : "-";
  const formatPercent = (value: number | null | undefined) =>
    value ? `${value}%` : "-";
  const formatDate = (dateString: string | null | undefined) =>
    dateString
      ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" })
      : "-"; // Adicionado timeZone UTC

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="destructive">Ativa</Badge>;
      case "PAID_OFF":
        return <Badge className="bg-green-600">Quitada</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pendente</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDebtTypeText = (typeValue: string) => {
    return debtTypes.find((dt) => dt.value === typeValue)?.label || typeValue;
  };

  // Filtrar dívidas canceladas para não exibir na tabela principal (opcional)
  const activeDebts = debts.filter((d) => d.status !== "CANCELLED");

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-3xl font-bold">Gerenciamento de Dívidas</h1>
              </div>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80 w-full md:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Dívida
              </Button>
            </div>

            {/* Card de Resumo (Opcional, pode ser adicionado depois) */}
            {/* <Card className="mb-6 border border-[#64748B] bg-[#3F4A5C]">...</Card> */}

            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Minhas Dívidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />{" "}
                    Carregando...
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-400">
                    <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                    {error}
                  </div>
                ) : activeDebts.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    Nenhuma dívida ativa encontrada. Adicione sua primeira
                    dívida!
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-[#64748B]">
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Saldo Devedor</TableHead>
                        <TableHead>Juros (a.a.)</TableHead>
                        <TableHead>Pag. Mínimo</TableHead>
                        <TableHead>Venc. Parcela</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeDebts.map((debt) => (
                        <TableRow
                          key={debt.id}
                          className={`border-b border-[#64748B]/50 ${
                            debt.status === "PAID_OFF" ? "opacity-60" : ""
                          }`}
                        >
                          <TableCell className="font-medium">
                            {debt.description} <br />
                            <span className="text-xs text-gray-400">
                              {debt.creditor || debt.bank?.name || ""}
                            </span>
                          </TableCell>
                          <TableCell>{getDebtTypeText(debt.type)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(debt.outstandingBalance)}
                          </TableCell>
                          <TableCell>
                            {formatPercent(debt.interestRate)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(debt.minimumPayment)}
                          </TableCell>
                          <TableCell>{debt.paymentDueDate || "-"}</TableCell>
                          <TableCell>{getStatusBadge(debt.status)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenSummary(debt)}
                              title="Resumo de Pagamentos"
                            >
                              <BarChartHorizontalBig className="h-4 w-4 text-blue-400" />
                            </Button>
                            {debt.status === "ACTIVE" && ( // Só permite pagar dívidas ativas
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenPayDialog(debt)}
                                title="Pagar"
                              >
                                <DollarSign className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            {debt.status !== "PAID_OFF" && ( // Não permite editar dívidas quitadas
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(debt)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4 text-yellow-400" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Cancelar Dívida"
                                  disabled={
                                    debt.status === "PAID_OFF" ||
                                    debt.status === "CANCELLED"
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirmar Cancelamento
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja cancelar o registro
                                    desta dívida? Isso não a quita, apenas a
                                    remove do acompanhamento.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(debt)}
                                  >
                                    Cancelar Dívida
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* Modal para Adicionar/Editar Dívida */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDebt ? "Editar Dívida" : "Nova Dívida"}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes da sua dívida abaixo.
            </DialogDescription>
          </DialogHeader>
          <DebtForm
            debt={editingDebt}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Registrar Pagamento (Conteúdo do formulário a ser criado) */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Para a dívida:{" "}
              <span className="font-semibold">{payingDebt?.description}</span>{" "}
              <br />
              Saldo devedor atual:{" "}
              <span className="font-semibold">
                {formatCurrency(payingDebt?.outstandingBalance)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DebtPaymentForm
            debt={payingDebt}
            onSave={handleSavePayment}
            onCancel={() => setIsPaymentFormOpen(false)}
          />
          <p className="text-center py-4 text-yellow-400"></p>
          <Button onClick={() => setIsPaymentFormOpen(false)}>Fechar</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico de Pagamentos</DialogTitle>
            <DialogDescription>
              Exibindo pagamentos para a dívida:{" "}
              <span className="font-semibold">
                {summaryDebt?.debtPayments[0]?.transaction?.description || ""}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto pr-2">
            {/* Verifica se a dívida e os pagamentos existem */}
            {summaryDebt && summaryDebt.debtPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-[#64748B]">
                    <TableHead>Data</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Transação (Ref)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Faz o loop nos pagamentos da dívida selecionada */}
                  {summaryDebt.debtPayments
                    // Ordena por data, do mais recente para o mais antigo
                    .sort(
                      (a, b) =>
                        new Date(b.paymentDate).getTime() -
                        new Date(a.paymentDate).getTime()
                    )
                    .map((payment: DebtPayment) => (
                      <TableRow
                        key={payment.id}
                        className="border-b border-[#64748B]/50"
                      >
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell className="font-medium text-green-400">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {payment.transaction?.description ||
                            `ID: ${payment.transactionId}`}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              // Mensagem caso não hajam pagamentos
              <p className="text-center text-gray-400 py-8">
                Nenhum pagamento registrado para esta dívida ainda.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
