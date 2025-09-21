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
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { CardForm } from "../../components/CardForm";
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

export interface CardData {
  id: number;
  name: string;
  type: "CREDITO" | "DEBITO";
  limit: number;
  closingDay: number;
  dueDate: number;
  active: boolean;
  accountId: number;
  account: {
    name: string;
    bank: {
      name: string;
    };
  };
}

export function CardsPage() {
  const { token, logout } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/card`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          logout();
          return;
        }
        if (!response.ok)
          throw new Error("Não foi possível carregar os cartões.");

        const data: CardData[] = await response.json();
        setCards(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, [token, logout]);

  const handleEdit = (card: CardData) => {
    setEditingCard(card);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCard(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/card/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao deletar o cartão.");
      }

      setCards(cards.filter((card) => card.id !== id));
      toast.success("Cartão deletado com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (card: CardData) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/card/inactive/${card.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Falha ao alterar status do cartão.");

      const updatedCard = await response.json();
      setCards(cards.map((c) => (c.id === card.id ? updatedCard : c)));
      toast.success(
        `Cartão ${updatedCard.active ? "ativado" : "inativado"} com sucesso!`
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSave = (savedCard: CardData) => {
    if (editingCard) {
      setCards(cards.map((c) => (c.id === savedCard.id ? savedCard : c)));
    } else {
      setCards([...cards, savedCard]);
    }
    setIsDialogOpen(false);
    setEditingCard(null);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <SideBarMenu />
        <SidebarInset>
          <div className="flex justify-center items-center h-screen">
            Carregando cartões...
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
              <h1 className="text-3xl font-bold">Gestão de Cartões</h1>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Cartão
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  className={`border border-[#64748B] bg-[#3F4A5C] transition-opacity ${
                    !card.active ? "opacity-50" : ""
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-lg">
                      {card.name}
                      <CreditCard className="text-gray-400" />
                    </CardTitle>
                    <p className="text-xs text-gray-400">
                      {card.account.bank?.name} / {card.account?.name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Limite do Cartão</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(card.limit)}
                      </p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>
                        Fecha dia: <strong>{card.closingDay}</strong>
                      </span>
                      <span>
                        Vence dia: <strong>{card.dueDate}</strong>
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(card)}
                        title={card.active ? "Inativar" : "Ativar"}
                      >
                        {card.active ? (
                          <Power className="h-4 w-4 text-gray-400" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(card)}
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
                              Essa ação não pode ser desfeita. Transações
                              associadas a este cartão não serão excluídas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(card.id)}
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
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Editar Cartão" : "Novo Cartão"}
            </DialogTitle>
          </DialogHeader>
          <CardForm
            card={editingCard}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
