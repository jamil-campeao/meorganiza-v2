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
import { AccountForm } from "../../components/AccountForm";
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

export interface Bank {
  id: string;
  name: string;
  logo: string;
}

export interface Account {
  id: number;
  name: string;
  type: "CONTA_CORRENTE" | "CONTA_POUPANCA" | "INVESTIMENTO" | "OUTROS";
  balance: number;
  active: boolean;
  bank: Bank;
  bankId: string;
}

export function AccountsPage() {
  const { token, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          logout();
          return;
        }
        if (!response.ok)
          throw new Error("Não foi possível carregar as contas.");

        const data: Account[] = await response.json();
        setAccounts(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, [token, logout]);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/account/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 409) {
          const errorData = await response.json();
          toast.warning(errorData.message);
        } else {
          throw new Error("Falha ao deletar conta.");
        }
      } else {
        setAccounts(accounts.filter((acc) => acc.id !== id));
        toast.success("Conta deletada com sucesso!");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (account: Account) => {
    if (!token) return;
    try {
      console.log(`${API_BASE_URL}/account/alternate-status/${account.id}`);
      const response = await fetch(
        `${API_BASE_URL}/account/alternate-status/${account.id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Falha ao alterar status da conta.");

      const updatedAccount = await response.json();
      setAccounts(
        accounts.map((acc) => (acc.id === account.id ? updatedAccount : acc))
      );
      toast.success(
        `Conta ${updatedAccount.active ? "ativada" : "inativada"} com sucesso!`
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSave = (savedAccount: Account) => {
    if (editingAccount) {
      setAccounts(
        accounts.map((acc) => (acc.id === savedAccount.id ? savedAccount : acc))
      );
    } else {
      setAccounts([...accounts, savedAccount]);
    }
    setIsDialogOpen(false);
    setEditingAccount(null);
  };

  if (isLoading) {
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
  }

  if (error) {
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
  }

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Gestão de Contas</h1>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Conta
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <Card
                  key={account.id}
                  className={`border border-[#64748B] bg-[#3F4A5C] transition-opacity ${
                    !account.active ? "opacity-50" : ""
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <img
                      src={account.bank?.logo}
                      alt={account.bank?.name}
                      className="w-8 h-8 object-contain"
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">
                        {account.type.replace("_", " ")}
                      </p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(account.balance)}
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(account)}
                        title={account.active ? "Inativar" : "Ativar"}
                      >
                        {account.active ? (
                          <Power className="h-4 w-4 text-gray-400" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(account)}
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
                              permanentemente a conta.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(account.id)}
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
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Editar Conta" : "Nova Conta"}
            </DialogTitle>
          </DialogHeader>
          <AccountForm
            account={editingAccount}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
