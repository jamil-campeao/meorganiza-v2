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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast } from "sonner";

// Interfaces
import { Transaction } from "../pages/Transactions/TransactionsPage";
import { Account } from "../pages/Accounts/AccountsPage";
import { Category } from "../pages/Categories/CategoriesPage";
import { CardData } from "../pages/Cards/CardsPage";

interface TransactionFormProps {
  transaction: Transaction | null;
  onSave: (transactionData: any) => void; // Usando 'any' para acomodar a transferência
  onCancel: () => void;
}

export function TransactionForm({
  transaction,
  onSave,
  onCancel,
}: TransactionFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    value: "",
    type: "DESPESA" as "RECEITA" | "DESPESA" | "TRANSFERENCIA",
    date: new Date(),
    categoryId: "",
    accountId: "", // Conta de Origem
    targetAccountId: "",
    cardId: "",
  });

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
        if (!response.ok)
          throw new Error(`Não foi possível carregar ${endpoint}.`);
        const data = await response.json();
        setter(data.filter((item: any) => item.active !== false));
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchData("account", setAccounts);
    fetchData("card", setCards);
    fetchData("categories", setCategories);
  }, [token]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || "",
        value: transaction.value.toString(),
        type: transaction.type,
        date: new Date(transaction.date),
        categoryId: transaction.categoryId?.toString() || "",
        accountId: transaction.accountId?.toString() || "",
        targetAccountId: "", // Transferências não são editáveis neste escopo
        cardId: transaction.cardId?.toString() || "",
      });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange =
    (id: "type" | "accountId" | "categoryId" | "cardId" | "targetAccountId") =>
    (value: string) => {
      const newState = { ...formData, [id]: value };
      if (id === "type") {
        newState.cardId = "";
        newState.categoryId = "";
      }
      setFormData(newState);
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "TRANSFERENCIA") {
      if (!formData.accountId || !formData.targetAccountId) {
        toast.error("Selecione a conta de origem e de destino.");
        return;
      }
      if (formData.accountId === formData.targetAccountId) {
        toast.error("As contas de origem e destino não podem ser as mesmas.");
        return;
      }
    }

    const submissionData = {
      description: formData.description,
      value: parseFloat(formData.value),
      type: formData.type,
      date: formData.date.toISOString(),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      accountId: formData.accountId ? parseInt(formData.accountId) : null,
      targetAccountId: formData.targetAccountId
        ? parseInt(formData.targetAccountId)
        : null,
      cardId: formData.cardId ? parseInt(formData.cardId) : null,
    };
    onSave(submissionData);
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
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
              <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* 3. Renderização condicional dos campos */}
      {formData.type !== "TRANSFERENCIA" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Compras no mercado"
              required
            />
          </div>
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
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="accountId">
          {formData.type === "TRANSFERENCIA"
            ? "Conta de Origem"
            : formData.type === "DESPESA"
            ? "Pagar com (Conta)"
            : "Receber em (Conta)"}
        </Label>
        <Select
          value={formData.accountId}
          onValueChange={handleSelectChange("accountId")}
          disabled={!!formData.cardId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma conta..." />
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

      {formData.type === "TRANSFERENCIA" && (
        <div className="space-y-2">
          <Label htmlFor="targetAccountId">Conta de Destino</Label>
          <Select
            value={formData.targetAccountId}
            onValueChange={handleSelectChange("targetAccountId")}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma conta..." />
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
      )}

      {formData.type === "DESPESA" && (
        <div className="space-y-2">
          <Label htmlFor="cardId">
            Pagar com (Cartão) -{" "}
            <span className="text-xs text-gray-400">Opcional</span>
          </Label>
          <Select
            value={formData.cardId}
            onValueChange={handleSelectChange("cardId")}
            disabled={!!formData.accountId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cartão..." />
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80">
          Salvar Transação
        </Button>
      </div>
    </form>
  );
}
