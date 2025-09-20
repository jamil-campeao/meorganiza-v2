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
import { Account, Bank } from "../pages/Accounts/AccountsPage";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast } from "sonner";

interface AccountFormProps {
  account: Account | null;
  onSave: (account: Account) => void;
  onCancel: () => void;
}

export function AccountForm({ account, onSave, onCancel }: AccountFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    type: "CONTA_CORRENTE",
    balance: "",
    bankId: "",
  });
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    // Busca a lista de bancos quando o formulário é montado
    const fetchBanks = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/bank`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error("Não foi possível carregar os bancos.");
        const data = await response.json();
        setBanks(data);
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchBanks();
  }, [token]);

  useEffect(() => {
    // Preenche o formulário se estiver no modo de edição
    if (account && banks.length > 0) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        bankId: account.bankId.toString(),
      });
    } else {
      // Reseta o formulário para o modo de criação
      setFormData({
        name: "",
        type: "CONTA_CORRENTE",
        balance: "",
        bankId: "",
      });
    }
  }, [account, banks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: "type" | "bankId") => (value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = account
      ? `${API_BASE_URL}/account/${account.id}`
      : `${API_BASE_URL}/account`;
    const method = account ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar conta.");
      }

      const savedAccount = await response.json();
      toast.success(`Conta ${account ? "atualizada" : "criada"} com sucesso!`);
      onSave(savedAccount);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[#E2E8F0]">
          Nome da Conta
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Conta Principal"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-[#E2E8F0]">
            Tipo
          </Label>
          <Select
            value={formData.type}
            onValueChange={handleSelectChange("type")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONTA_CORRENTE">Conta Corrente</SelectItem>
              <SelectItem value="CONTA_POUPANCA">Conta Poupança</SelectItem>
              <SelectItem value="INVESTIMENTO">Investimento</SelectItem>
              <SelectItem value="OUTROS">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance" className="text-[#E2E8F0]">
            Saldo Inicial
          </Label>
          <Input
            id="balance"
            type="number"
            value={formData.balance}
            onChange={handleChange}
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bankId" className="text-[#E2E8F0]">
          Banco
        </Label>
        <Select
          value={formData.bankId.toString()}
          onValueChange={handleSelectChange("bankId")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um banco" />
          </SelectTrigger>
          <SelectContent>
            {banks.map((bank) => (
              <SelectItem key={bank.id.toString()} value={bank.id.toString()}>
                {bank.name}
              </SelectItem>
            ))}
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
