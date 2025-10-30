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
  PlusCircle,
  Edit,
  Trash2,
  Power,
  PowerOff,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { InvestmentForm } from "../../components/InvestmentsForm";
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

export interface Investment {
  id: number;
  type: string;
  description: string;
  quantity: number;
  acquisitionValue: number;
  acquisitionDate: string;
  active: boolean;
}

export function InvestmentsPage() {
  const { token, logout } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/investment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) logout();
      if (!response.ok)
        throw new Error("Não foi possível carregar os investimentos.");
      const data: Investment[] = await response.json();
      setInvestments(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [token]);

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingInvestment(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/investment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao deletar investimento.");
      setInvestments(investments.filter((inv) => inv.id !== id));
      toast.success("Investimento deletado com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (investment: Investment) => {
    if (!token) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/investment/inactive/${investment.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok)
        throw new Error("Falha ao alterar status do investimento.");
      fetchInvestments();
      toast.success(`Status do investimento alterado com sucesso!`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingInvestment(null);
    fetchInvestments(); // Re-busca a lista para pegar o novo ou o atualizado
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" });

  if (isLoading)
    return (
      <SidebarProvider>
        <SideBarMenu />
        <SidebarInset>
          <div className="flex justify-center items-center h-screen">
            Carregando investimentos...
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
              <h1 className="text-3xl font-bold">Meus Investimentos</h1>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Investimento
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.map((inv) => (
                <Card
                  key={inv.id}
                  className={`border border-[#64748B] bg-[#3F4A5C] transition-opacity ${
                    !inv.active ? "opacity-50" : ""
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{inv.description}</CardTitle>
                    <TrendingUp className="text-green-400" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">{inv.type}</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(inv.acquisitionValue * inv.quantity)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {inv.quantity} cotas/unidades
                      </p>
                    </div>
                    <div className="text-xs text-gray-300">
                      <span>
                        Adquirido em:{" "}
                        <strong>{formatDate(inv.acquisitionDate)}</strong>
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(inv)}
                        title={inv.active ? "Inativar" : "Ativar"}
                      >
                        {inv.active ? (
                          <Power className="h-4 w-4 text-gray-400" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(inv)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-yellow-400" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Deletar">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Você tem certeza?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita e irá deletar
                              permanentemente o investimento.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(inv.id)}
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInvestment ? "Editar Investimento" : "Novo Investimento"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do seu ativo.
            </DialogDescription>
          </DialogHeader>
          <InvestmentForm
            investment={editingInvestment}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
