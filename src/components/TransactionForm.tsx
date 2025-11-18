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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Interfaces
import { Transaction } from "../pages/Transactions/TransactionsPage";
import { Account } from "../pages/Accounts/AccountsPage";
import { Category } from "../pages/Categories/CategoriesPage";
import { CardData } from "../pages/Cards/CardsPage";
import { cn } from "./ui/utils";

interface TransactionFormProps {
  transaction: Transaction | null;
  onSave: (transactionData: any) => void;
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
    installments: "1",
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
        targetAccountId: "",
        cardId: transaction.cardId?.toString() || "",
        installments: "1", // Parcelas não são editáveis, sempre 1 na edição
      });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }));
    }
  };

  const handleSelectChange =
    (id: "type" | "accountId" | "categoryId" | "cardId" | "targetAccountId") =>
    (value: string) => {
      const newState = { ...formData, [id]: value };
      if (id === "type") {
        newState.cardId = "";
        newState.categoryId = "";
        newState.installments = "1"; // Reseta parcelas ao mudar o tipo
      }
      if (id === "cardId" && !value) {
        newState.installments = "1"; // Reseta parcelas se o cartão for desmarcado
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
      installments: parseInt(formData.installments), // Envia o número de parcelas
    };
    onSave(submissionData);
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  // Condição para mostrar o campo de parcelas
  const showInstallments =
    formData.type === "DESPESA" && !!formData.cardId && !transaction; // Não mostra na edição

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={formData.type}
            onValueChange={handleSelectChange("type")}
            disabled={!!transaction} // Desabilita a troca de tipo na edição
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
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? (
                  format(formData.date, "dd/MM/yyyy")
                ) : (
                  <span>Escolha uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
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
          required={formData.type !== "DESPESA"}
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cardId">Pagar com (Cartão)</Label>
            <Select
              value={formData.cardId}
              onValueChange={handleSelectChange("cardId")}
              disabled={!!formData.accountId} // Desabilita na edição
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
          {showInstallments && (
            <div className="space-y-2">
              <Label htmlFor="installments">Nº de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                value={formData.installments}
                onChange={handleChange}
                placeholder="1"
              />
            </div>
          )}
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
