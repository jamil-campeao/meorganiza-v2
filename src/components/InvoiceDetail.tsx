import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast } from "sonner";
import { InvoiceDetails } from "../pages/Invoices/InvoicesPage";
import { Account } from "../pages/Accounts/AccountsPage";
import { Category } from "../pages/Categories/CategoriesPage";

interface InvoiceDetailProps {
  invoice: InvoiceDetails;
  onClose: () => void;
}

export function InvoiceDetail({ invoice, onClose }: InvoiceDetailProps) {
  const { token } = useAuth();
  const [paymentData, setPaymentData] = useState({
    accountId: "",
    categoryId: "",
    paymentDate: new Date(),
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const fetchData = async (endpoint: string, setter: React.Dispatch<any>) => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData("account", setAccounts);
    fetchData("categories", setCategories);
  }, [token]);

  const handlePayInvoice = async () => {
    if (!paymentData.accountId || !paymentData.categoryId) {
      toast.error("Selecione a conta e a categoria para o pagamento.");
      return;
    }
    setIsPaying(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/invoice/pay/${invoice.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...paymentData,
            paymentDate: paymentData.paymentDate.toISOString(),
          }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }
      toast.success("Fatura paga com sucesso!");
      onClose(); // Fecha o modal e recarrega a lista
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPaying(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  const expenseCategories = categories.filter((c) => c.type === "DESPESA");

  return (
    <div className="space-y-4">
      {/* Tabela com as transações da fatura */}
      <div className="max-h-64 overflow-y-auto pr-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDate(t.date)}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(t.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Formulário de Pagamento (só aparece se a fatura não estiver paga) */}
      {!invoice.isPaid && (
        <div className="space-y-4 pt-4 border-t border-gray-600">
          <h3 className="text-lg font-semibold">Pagar Fatura</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pagar com a Conta</Label>
              <Select
                onValueChange={(val) =>
                  setPaymentData((p) => ({ ...p, accountId: parseInt(val) }))
                }
                required
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
            <div className="space-y-2">
              <Label>Categorizar Despesa</Label>
              <Select
                onValueChange={(val) =>
                  setPaymentData((p) => ({ ...p, categoryId: parseInt(val) }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(paymentData.paymentDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentData.paymentDate}
                    onSelect={(d) =>
                      d && setPaymentData((p) => ({ ...p, paymentDate: d }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button
            onClick={handlePayInvoice}
            disabled={isPaying}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isPaying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Pagamento de {formatCurrency(invoice.totalAmount)}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
