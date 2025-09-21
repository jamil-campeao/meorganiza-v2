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
import { Account } from "../pages/Accounts/AccountsPage";
import { CardData } from "../pages/Cards/CardsPage";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast } from "sonner";

interface CardFormProps {
  card: CardData | null;
  onSave: (card: CardData) => void;
  onCancel: () => void;
}

export function CardForm({ card, onSave, onCancel }: CardFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    type: "CREDITO",
    limit: "",
    closingDay: "",
    dueDate: "",
    accountId: "",
    account: {},
  });
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error("Não foi possível carregar as contas.");
        const data = await response.json();
        setAccounts(data.filter((acc: Account) => acc.active)); // Mostra apenas contas ativas
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchAccounts();
  }, [token]);

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        type: card.type,
        limit: card.limit.toString(),
        closingDay: card.closingDay.toString(),
        dueDate: card.dueDate.toString(),
        accountId: card.accountId.toString(),
        account: card.account,
      });
    } else {
      setFormData({
        name: "",
        type: "CREDITO",
        limit: "",
        closingDay: "",
        dueDate: "",
        accountId: "",
        account: {},
      });
    }
  }, [card]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: "type" | "accountId") => (value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = card
      ? `${API_BASE_URL}/card/${card.id}`
      : `${API_BASE_URL}/card`;
    const method = card ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          limit: parseFloat(formData.limit),
          closingDay: parseInt(formData.closingDay),
          dueDate: parseInt(formData.dueDate),
          accountId: parseInt(formData.accountId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar o cartão.");
      }

      const savedCard = await response.json();
      toast.success(`Cartão ${card ? "atualizado" : "criado"} com sucesso!`);
      onSave(savedCard);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cartão</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Cartão Nubank"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="accountId">Conta Vinculada</Label>
        <Select
          value={formData.accountId}
          onValueChange={handleSelectChange("accountId")}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id.toString()}>
                {acc.name} ({acc.bank.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
              <SelectItem value="CREDITO">Crédito</SelectItem>
              <SelectItem value="DEBITO">Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="limit">Limite</Label>
          <Input
            id="limit"
            type="number"
            value={formData.limit}
            onChange={handleChange}
            placeholder="R$ 1000,00"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="closingDay">Dia de Fechamento</Label>
          <Input
            id="closingDay"
            type="number"
            min="1"
            max="31"
            value={formData.closingDay}
            onChange={handleChange}
            placeholder="Ex: 25"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Dia de Vencimento</Label>
          <Input
            id="dueDate"
            type="number"
            min="1"
            max="31"
            value={formData.dueDate}
            onChange={handleChange}
            placeholder="Ex: 10"
            required
          />
        </div>
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
