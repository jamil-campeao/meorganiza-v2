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
import { PlusCircle, Edit, Trash2, Power, PowerOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";

export interface Bill {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  recurring: string;
  categoryId: number;
  active: boolean;
  category: {
    description: string;
  };
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
      if (!response.ok) throw new Error("Não foi possível carregar as contas.");
      const data: Bill[] = await response.json();
      setBills(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
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

  const handleToggleActive = async (bill: Bill) => {
    if (!token) return;

    const updatedBill = { ...bill, active: !bill.active };

    try {
      const response = await fetch(
        `${API_BASE_URL}/bill/alter-status/${bill.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Falha ao inativar a conta.");
      setBills(bills.map((b) => (b.id === bill.id ? updatedBill : b)));
      toast.success(
        `Conta ${updatedBill.active ? "ativada" : "inativada"} com sucesso!`
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/bill/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao deletar a conta.");
      setBills(bills.filter((bill) => bill.id !== id));
      toast.success("Conta deletada com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSave = (savedBill: Bill) => {
    if (editingBill) {
      setBills(bills.map((b) => (b.id === savedBill.id ? savedBill : b)));
    } else {
      setBills([...bills, savedBill]);
    }
    setIsDialogOpen(false);
    setEditingBill(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Contas a Pagar</h1>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Conta
              </Button>
            </div>
            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle>Minhas Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-[#64748B]">
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow
                        key={bill.id}
                        className="border-b border-[#64748B]/50"
                      >
                        <TableCell className="font-medium">
                          {bill.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {bill.category.description}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(bill.dueDate)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(bill.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(bill)}
                              title={bill.active ? "Inativar" : "Ativar"}
                            >
                              {bill.active ? (
                                <Power className="h-4 w-4 text-gray-400" />
                              ) : (
                                <PowerOff className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(bill)}
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
                                    Tem certeza que deseja deletar esta conta?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(bill.id)}
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBill ? "Editar Conta" : "Nova Conta"}
            </DialogTitle>
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
