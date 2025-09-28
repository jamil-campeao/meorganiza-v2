import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { Account } from "../pages/Accounts/AccountsPage";
import { Category } from "../pages/Categories/CategoriesPage";
import { CardData } from "../pages/Cards/CardsPage";

interface QuickTransactionFormProps {
  onTransactionAdded: () => void;
}

export function QuickTransactionForm({
  onTransactionAdded,
}: QuickTransactionFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    type: "DESPESA",
    description: "",
    value: "",
    categoryId: "",
    accountId: "",
    cardId: "",
    date: new Date(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async (endpoint: string, setter: React.Dispatch<any>) => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setter(data.filter((item: any) => item.active !== false));
      } catch (error) {
        console.error(`Falha ao carregar ${endpoint}:`, error);
      }
    };
    fetchData("account", setAccounts);
    fetchData("card", setCards);
    fetchData("categories", setCategories);
  }, [token]);

  const handleSelectChange =
    (id: "type" | "categoryId" | "accountId" | "cardId") => (value: string) => {
      const newState = { ...formData, [id]: value };
      if (id === "accountId" && value) newState.cardId = "";
      if (id === "cardId" && value) newState.accountId = "";
      if (id === "type") newState.categoryId = "";
      setFormData(newState);
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      type: "DESPESA",
      description: "",
      value: "",
      categoryId: "",
      accountId: "",
      cardId: "",
      date: new Date(),
      paid: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (
      formData.type === "DESPESA" &&
      !formData.accountId &&
      !formData.cardId
    ) {
      toast.error("Para despesas, selecione uma conta ou um cartão.");
      return;
    }
    if (formData.type === "RECEITA" && !formData.accountId) {
      toast.error("Para receitas, selecione uma conta.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transaction`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          categoryId: parseInt(formData.categoryId),
          accountId: formData.accountId ? parseInt(formData.accountId) : null,
          cardId: formData.cardId ? parseInt(formData.cardId) : null,
          date: formData.date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao adicionar a transação.");
      }

      toast.success("Transação adicionada com sucesso!");
      resetForm();
      onTransactionAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <Card className="border border-[#64748B] bg-[#3F4A5C]">
      <CardHeader>
        <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#8B3A3A]" />
          Registro Rápido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={handleSelectChange("type")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESPESA">Despesa</SelectItem>
                  <SelectItem value="RECEITA">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="R$ 0,00"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Jantar com amigos"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <Select
                value={formData.categoryId}
                onValueChange={handleSelectChange("categoryId")}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">
                {formData.type === "RECEITA"
                  ? "Conta de Destino"
                  : "Pagar com (Conta)"}
              </Label>
              <Select
                value={formData.accountId}
                onValueChange={handleSelectChange("accountId")}
                disabled={!!formData.cardId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === "DESPESA" && (
            <div className="space-y-2">
              <Label htmlFor="cardId">Pagar com (Cartão)</Label>
              <Select
                value={formData.cardId}
                onValueChange={handleSelectChange("cardId")}
                disabled={!!formData.accountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional..." />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id.toString()}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#8B3A3A] hover:bg-[#8B3A3A]/80 text-[#F8FAFC]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Adicionar Transação"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
