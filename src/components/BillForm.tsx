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
import { Category } from "../pages/Categories/CategoriesPage";

interface Bill {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  recurring: string;
  categoryId: number;
}

interface BillFormProps {
  bill: Bill | null;
  onSave: (bill: Bill) => void;
  onCancel: () => void;
}

export function BillForm({ bill, onSave, onCancel }: BillFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    dueDate: new Date(),
    recurring: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error("Não foi possível carregar as categorias.");
        const data = await response.json();
        setCategories(data.filter((cat: Category) => cat.type === "DESPESA")); // Mostra apenas categorias de despesa
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (bill) {
      setFormData({
        description: bill.description,
        amount: bill.amount.toString(),
        dueDate: new Date(bill.dueDate),
        recurring: bill.recurring,
        categoryId: bill.categoryId.toString(),
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        dueDate: new Date(),
        recurring: "monthly",
        categoryId: "",
      });
    }
  }, [bill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange =
    (id: "recurring" | "categoryId") => (value: string) => {
      setFormData((prev) => ({ ...prev, [id]: value }));
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
          dueDate: formData.dueDate.toISOString(),
          categoryId: parseInt(formData.categoryId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar a conta.");
      }

      const savedBill = await response.json();
      toast.success(`Conta ${bill ? "atualizada" : "criada"} com sucesso!`);
      onSave(savedBill);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: Aluguel"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="R$ 0,00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Data de Vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.dueDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.dueDate}
                onSelect={(d) =>
                  d && setFormData((prev) => ({ ...prev, dueDate: d }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
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
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
              <SelectItem value="no">Não recorrente</SelectItem>
            </SelectContent>
          </Select>
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
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
