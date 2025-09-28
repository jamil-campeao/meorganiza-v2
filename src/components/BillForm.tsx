import React, { useState, useEffect } from "react";
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
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast } from "sonner";
import { Category } from "../pages/Categories/CategoriesPage";
import { Account } from "../pages/Accounts/AccountsPage";
import { CardData } from "../pages/Cards/CardsPage";
import { Bill } from "../pages/Bills/BillsPage";

interface BillFormProps {
  bill: Bill | null;
  onSave: () => void;
  onCancel: () => void;
}

export function BillForm({ bill, onSave, onCancel }: BillFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    dueDateDay: "",
    recurring: "MONTHLY",
    categoryId: "",
    accountId: "",
    cardId: "",
  });

  // Estados para os seletores
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);

  // Efeito para buscar todos os dados necessários (categorias, contas, cartões)
  useEffect(() => {
    const fetchData = async (endpoint: string, setter: React.Dispatch<any>) => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error(`Não foi possível carregar ${endpoint}.`);
        const data = await response.json();
        setter(data.filter((item: any) => item.active !== false));
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchData("categories", setCategories);
    fetchData("account", setAccounts);
    fetchData("card", setCards);
  }, [token]);

  // Efeito para preencher o formulário no modo de edição
  useEffect(() => {
    if (bill) {
      setFormData({
        description: bill.description,
        amount: bill.amount.toString(),
        dueDateDay: bill.dueDateDay.toString(),
        recurring: bill.recurring,
        categoryId: bill.categoryId.toString(),
        accountId: bill.accountId?.toString() || "",
        cardId: bill.cardId?.toString() || "",
      });
    }
  }, [bill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange =
    (id: "recurring" | "categoryId" | "accountId" | "cardId") =>
    (value: string) => {
      // Lógica para garantir que apenas conta ou cartão seja selecionado
      if (id === "accountId" && value) {
        setFormData((prev) => ({ ...prev, accountId: value, cardId: "" }));
      } else if (id === "cardId" && value) {
        setFormData((prev) => ({ ...prev, cardId: value, accountId: "" }));
      } else {
        setFormData((prev) => ({ ...prev, [id]: value }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = bill
      ? `${API_BASE_URL}/bill/${bill.id}`
      : `${API_BASE_URL}/bill`;
    const method = bill ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          dueDateDay: parseInt(formData.dueDateDay),
          categoryId: parseInt(formData.categoryId),
          accountId: formData.accountId ? parseInt(formData.accountId) : null,
          cardId: formData.cardId ? parseInt(formData.cardId) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar a conta.");
      }

      toast.success(`Conta ${bill ? "atualizada" : "criada"} com sucesso!`);
      onSave();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === "DESPESA");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição da Conta</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: Assinatura Netflix"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor Padrão</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="R$ 0,00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDateDay">Dia do Vencimento</Label>
          <Input
            id="dueDateDay"
            type="number"
            min="1"
            max="31"
            value={formData.dueDateDay}
            onChange={handleChange}
            placeholder="Ex: 10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoria</Label>
        <Select
          value={formData.categoryId}
          onValueChange={handleSelectChange("categoryId")}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria..." />
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

      <div className="space-y-1">
        <Label>Forma de Pagamento (Opcional)</Label>
        <p className="text-xs text-gray-400">
          Vincule a uma conta (débito) ou cartão (crédito).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Conta</Label>
          <Select
            value={formData.accountId}
            onValueChange={handleSelectChange("accountId")}
            disabled={!!formData.cardId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhuma" />
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
        <div className="space-y-2">
          <Label htmlFor="cardId">Cartão de Crédito</Label>
          <Select
            value={formData.cardId}
            onValueChange={handleSelectChange("cardId")}
            disabled={!!formData.accountId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Nenhum" />
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="recurring">Recorrência</Label>
        <Select
          value={formData.recurring}
          onValueChange={handleSelectChange("recurring")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">Única</SelectItem>
            <SelectItem value="MONTHLY">Mensal</SelectItem>
            <SelectItem value="ANNUALLY">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80">
          Salvar
        </Button>
      </div>
    </form>
  );
}
