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
import { DebtData } from "../pages/Debts/DebtsPage";
import { Account } from "../pages/Accounts/AccountsPage";
import { Category } from "../pages/Categories/CategoriesPage";
import { cn } from "./ui/utils";
import { parse } from "path";
import { PaymentFormData } from "../pages/Debts/DebtsPage";

interface DebtPaymentFormProps {
  debt: DebtData | null;
  onSave: (paymentData: PaymentFormData) => void;
  onCancel: () => void;
}

export function DebtPaymentForm({
  debt,
  onSave,
  onCancel,
}: DebtPaymentFormProps) {
  const { token, logout } = useAuth();
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [paymentCategoryId, setPaymentCategoryId] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Buscar Contas e Categorias de Despesa
  useEffect(() => {
    const fetchAccountsAndCategories = async () => {
      if (!token) return;

      try {
        const responseCategories = await fetch(`${API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!responseCategories.ok)
          throw new Error("Falha ao buscar categorias.");
        const categoriesData: Category[] = await responseCategories.json();

        //Pego somente as categorias de Despesa
        const expenseCategories = categoriesData.filter(
          (category) => category.type === "DESPESA"
        );
        setCategories(expenseCategories);

        const responseAccounts = await fetch(`${API_BASE_URL}/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!responseAccounts.ok) {
          throw new Error("Falha ao buscar contas.");
        }

        const accountsData: Account[] = await responseAccounts.json();

        //Pego somente as contas ativas
        const activeAccounts = accountsData.filter((account) => account.active);
        setAccounts(activeAccounts);
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchAccountsAndCategories();
  }, [token, logout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt || !amountPaid || !paymentAccountId || !paymentCategoryId) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const paymentData = {
      amountPaid: parseFloat(amountPaid),
      accountId: parseInt(paymentAccountId),
      targetAccountId: parseInt(paymentAccountId),
      categoryId: parseInt(paymentCategoryId),
      date: paymentDate.toISOString(),
    };

    onSave(paymentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amountPaid">Valor Pago</Label>
        <Input
          id="amountPaid"
          type="number"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder={
            debt
              ? `Máx: ${Number(debt.outstandingBalance).toFixed(2)}`
              : "R$ 0,00"
          }
          max={debt?.outstandingBalance.toString()}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentAccountId">Pagar com a Conta</Label>
        <Select
          value={paymentAccountId}
          onValueChange={setPaymentAccountId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a conta..." />
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
        <Label htmlFor="paymentCategoryId">Categorizar como (Despesa)</Label>
        <Select
          value={paymentCategoryId}
          onValueChange={setPaymentCategoryId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDate">Data do Pagamento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !paymentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {paymentDate ? (
                format(paymentDate, "dd/MM/yyyy")
              ) : (
                <span>Escolha uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={paymentDate}
              onSelect={(d) => d && setPaymentDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Confirmar Pagamento
        </Button>
      </div>
    </form>
  );
}
