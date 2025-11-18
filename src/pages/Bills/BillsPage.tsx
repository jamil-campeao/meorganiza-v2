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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  PlusCircle,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Landmark,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { BillForm } from "../../components/BillForm";
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

// Interface para a REGRA da conta
export interface Bill {
  id: number;
  description: string;
  amount: number;
  dueDateDay: number;
  recurring: string;
  active: boolean;
  categoryId: number;
  accountId: number | null;
  cardId: number | null;
  category: { description: string };
  account: { name: string } | null;
  card: { name: string } | null;
}

export function BillsPage() {
  const { token, logout } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/bill`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) logout();
      if (!response.ok)
        throw new Error("Não foi possível carregar as regras de contas.");
      const data: Bill[] = await response.json();
      setBills(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [token]);

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingBill(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/bill/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao deletar a regra da conta.");
      setBills(bills.filter((bill) => bill.id !== id));
      toast.success("Regra da conta deletada com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingBill(null);
    fetchBills();
  };

  const handleToggleActive = async (bill: Bill) => {
    await fetch(`${API_BASE_URL}/bill/alter-status/${bill.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchBills();
    toast.info("A inativação será feita na edição da regra da conta.");
  };

  const getRecurrenceText = (recurring: string) => {
    if (recurring === "MONTHLY") return "Mensal";
    if (recurring === "ANNUALLY") return "Anual";
    return "Única";
  };

  if (isLoading)
    return (
      <SidebarProvider>
        <SideBarMenu />
        <SidebarInset>
          <div className="flex justify-center items-center h-screen">
            Carregando contas...
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

  function formatCurrency(amount: number) {
    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }
  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">
                Gerenciar Contas Recorrentes
              </h1>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Regra de Conta
              </Button>
            </div>

            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle>Minhas Regras de Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-[#64748B]">
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor Padrão</TableHead>
                      <TableHead>Vence dia</TableHead>
                      <TableHead>Recorrência</TableHead>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow
                        key={bill.id}
                        className={`border-b border-[#64748B]/50 ${
                          !bill.active ? "opacity-40" : ""
                        }`}
                      >
                        <TableCell className="font-medium">
                          {bill.description}
                        </TableCell>
                        <TableCell>{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>{bill.dueDateDay}</TableCell>
                        <TableCell>
                          {getRecurrenceText(bill.recurring)}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {bill.accountId && (
                            <>
                              <Landmark className="h-4 w-4" />{" "}
                              {bill.account?.name}
                            </>
                          )}
                          {bill.cardId && (
                            <>
                              <CreditCard className="h-4 w-4" />{" "}
                              {bill.card?.name}
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(bill)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4 text-yellow-400" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Deletar"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar Exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso irá deletar a regra da conta e todas as
                                  suas faturas pendentes. Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(bill.id)}
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
              {editingBill ? "Editar Regra da Conta" : "Nova Regra de Conta"}
            </DialogTitle>
            <DialogDescription>
              Defina uma regra para suas contas recorrentes ou de pagamento
              único.
            </DialogDescription>
          </DialogHeader>
          <BillForm
            bill={editingBill}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
