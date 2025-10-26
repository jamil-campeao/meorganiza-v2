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
import { Bank } from "../pages/Accounts/AccountsPage";
import { DebtData } from "../pages/Debts/DebtsPage";
import { cn } from "./ui/utils";

export const debtTypes = [
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "PERSONAL_LOAN", label: "Empréstimo Pessoal" },
  { value: "AUTO_LOAN", label: "Financiamento Veicular" },
  { value: "STUDENT_LOAN", label: "Financiamento Estudantil" },
  { value: "MORTGAGE", label: "Financiamento Imobiliário" },
  { value: "OVERDRAFT", label: "Cheque Especial" },
  { value: "RETAIL_FINANCING", label: "Financiamento de Loja" },
  { value: "OTHER", label: "Outro" },
];

interface DebtFormProps {
  debt: DebtData | null;
  onSave: (
    debtData: Omit<
      DebtData,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "user"
      | "bank"
      | "debtPayments"
      | "userId"
    >
  ) => void;
  onCancel: () => void;
}

export function DebtForm({ debt, onSave, onCancel }: DebtFormProps) {
  const { token, logout } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    creditor: "",
    type: "OTHER",
    initialAmount: "",
    outstandingBalance: "",
    interestRate: "",
    minimumPayment: "",
    paymentDueDate: "",
    bankId: "",
    startDate: new Date(),
    estimatedEndDate: null as Date | null,
  });
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
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
  }, [token, logout]);

  // Preenche o form se estiver editando
  useEffect(() => {
    if (debt) {
      setFormData({
        description: debt.description,
        creditor: debt.creditor || "",
        type: debt.type,
        initialAmount: debt.initialAmount.toString(),
        outstandingBalance: debt.outstandingBalance.toString(),
        interestRate: debt.interestRate?.toString() || "",
        minimumPayment: debt.minimumPayment?.toString() || "",
        paymentDueDate: debt.paymentDueDate?.toString() || "",
        bankId: debt.bankId || "", // Já deve ser string
        startDate: new Date(debt.startDate),
        estimatedEndDate: debt.estimatedEndDate
          ? new Date(debt.estimatedEndDate)
          : null,
      });
    } else {
      // Reseta para criação
      setFormData({
        description: "",
        creditor: "",
        type: "OTHER",
        initialAmount: "",
        outstandingBalance: "",
        interestRate: "",
        minimumPayment: "",
        paymentDueDate: "",
        bankId: "",
        startDate: new Date(),
        estimatedEndDate: null,
      });
    }
  }, [debt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: "type" | "bankId") => (value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateChange =
    (id: "startDate" | "estimatedEndDate") => (date: Date | undefined) => {
      if (date) {
        setFormData((prev) => ({ ...prev, [id]: date }));
      } else if (id === "estimatedEndDate") {
        setFormData((prev) => ({ ...prev, estimatedEndDate: null })); // Permite limpar data estimada
      }
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar campos numéricos opcionais antes de enviar
    const dataToSend = {
      ...formData,
      initialAmount: parseFloat(formData.initialAmount),
      outstandingBalance: parseFloat(formData.outstandingBalance),
      interestRate: formData.interestRate
        ? parseFloat(formData.interestRate)
        : null,
      minimumPayment: formData.minimumPayment
        ? parseFloat(formData.minimumPayment)
        : null,
      paymentDueDate: formData.paymentDueDate
        ? parseInt(formData.paymentDueDate)
        : null,
      bankId: formData.bankId || null, // Envia null se vazio
      startDate: formData.startDate.toISOString(),
      estimatedEndDate: formData.estimatedEndDate?.toISOString() || null,
    };
    onSave(dataToSend);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
    >
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: Financiamento Apartamento"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Dívida</Label>
          <Select
            value={formData.type}
            onValueChange={handleSelectChange("type")}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {debtTypes.map((dt) => (
                <SelectItem key={dt.value} value={dt.value}>
                  {dt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="creditor">Credor (se não for banco)</Label>
          <Input
            id="creditor"
            value={formData.creditor}
            onChange={handleChange}
            placeholder="Ex: Nome da Loja ou Pessoa"
            disabled={!!formData.bankId}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankId">Banco (se aplicável)</Label>
        <Select
          value={formData.bankId}
          onValueChange={handleSelectChange("bankId")}
          disabled={!!formData.creditor && !formData.bankId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um banco..." />
          </SelectTrigger>
          <SelectContent>
            {banks.map((bank) => (
              <SelectItem key={bank.id} value={bank.id}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="initialAmount">Valor Inicial</Label>
          <Input
            id="initialAmount"
            type="number"
            step="0.01"
            value={formData.initialAmount}
            onChange={handleChange}
            placeholder="R$ 0,00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="outstandingBalance">Saldo Devedor Atual</Label>
          <Input
            id="outstandingBalance"
            type="number"
            step="0.01"
            value={formData.outstandingBalance}
            onChange={handleChange}
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interestRate">Taxa Juros Anual (%)</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={handleChange}
            placeholder="Ex: 12.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimumPayment">Pagamento Mínimo Mensal</Label>
          <Input
            id="minimumPayment"
            type="number"
            step="0.01"
            value={formData.minimumPayment}
            onChange={handleChange}
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentDueDate">Dia Vencimento Parcela</Label>
          <Input
            id="paymentDueDate"
            type="number"
            min="1"
            max="31"
            value={formData.paymentDueDate}
            onChange={handleChange}
            placeholder="Ex: 15"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Data Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? (
                  format(formData.startDate, "dd/MM/yyyy")
                ) : (
                  <span>Escolha uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={handleDateChange("startDate")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimatedEndDate">
          Data Estimada Quitação (Opcional)
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.estimatedEndDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.estimatedEndDate ? (
                format(formData.estimatedEndDate, "dd/MM/yyyy")
              ) : (
                <span>Escolha uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.estimatedEndDate || undefined}
              onSelect={handleDateChange("estimatedEndDate")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80">
          Salvar Dívida
        </Button>
      </div>
    </form>
  );
}
