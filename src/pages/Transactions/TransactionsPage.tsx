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
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { TransactionForm } from "../../components/TransactionForm";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Toaster, toast } from "sonner";
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

export interface Transaction {
  id: number;
  description: string;
  value: number;
  type: "RECEITA" | "DESPESA" | "TRANSFERENCIA";
  date: string;
  paid: boolean;
  category: { description: string };
  account: { name: string } | null;
  card: { name: string } | null;
  accountId: number | null;
  cardId: number | null;
  categoryId: number;
}

export function TransactionsPage() {
  const { token, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar as transações
  const fetchTransactions = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transaction`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) logout();
      if (!response.ok)
        throw new Error("Não foi possível carregar as transações.");
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (
    transactionData: Omit<
      Transaction,
      "id" | "category" | "account" | "card"
    > & { installments?: number }
  ) => {
    if (!token) return;

    const isEditing = !!editingTransaction;
    const url = isEditing
      ? `${API_BASE_URL}/transaction/${editingTransaction.id}`
      : `${API_BASE_URL}/transaction`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar a transação.");
      }

      const result = await response.json();
      const successMessage =
        result.message ||
        `Transação ${isEditing ? "atualizada" : "criada"} com sucesso!`;

      toast.success(successMessage);

      setIsDialogOpen(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/transaction/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao deletar a transação.");
      }

      toast.success("Transação deletada com sucesso!");
      fetchTransactions(); // Re-busca os dados para refletir as mudanças
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (isLoading)
    return (
      <SidebarProvider>
        <SideBarMenu />
        <SidebarInset>
          <div className="flex justify-center items-center h-screen">
            Carregando transações...
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  if (error)
    return (
      <SidebarProvider>
        <SideBarMenu />
        <SidebarInset>
          <div className="flex justify-center items-center h-screen text-red-500">
            Erro: {error}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-3xl font-bold">Transações</h1>
              </div>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80 w-full md:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
              </Button>
            </div>
            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-[#64748B]">
                      <TableHead></TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Conta/Cartão</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow
                        key={t.id}
                        className="border-b border-[#64748B]/50"
                      >
                        <TableCell>
                          {t.type === "RECEITA" ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                          ) : t.type === "DESPESA" ? (
                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <ArrowRightLeft className="h-5 w-5 text-blue-400" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {t.type === "TRANSFERENCIA"
                            ? "Transferência entre contas"
                            : t.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {t.category?.description || "Transferência"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(t.date)}</TableCell>
                        <TableCell>
                          {t.account?.name || t.card?.name || "N/A"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            t.type === "RECEITA"
                              ? "text-green-500"
                              : t.type === "DESPESA"
                              ? "text-red-500"
                              : "text-blue-400" // Cor para transferência
                          }`}
                        >
                          {t.type === "DESPESA" && "- "}
                          {formatCurrency(t.value)}
                        </TableCell>
                        <TableCell className="text-right">
                          {/* Lógica para esconder botões para Transferências */}
                          {t.type !== "TRANSFERENCIA" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(t)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Deletar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirmar Exclusão
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja deletar esta
                                      transação? Esta ação não pode ser
                                      desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(t.id)}
                                    >
                                      Deletar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Editar Transação" : "Nova Transação"}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes da sua transação abaixo.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
