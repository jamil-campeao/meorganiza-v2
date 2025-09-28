import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/api";
import { toast } from "sonner";
import { Investment } from "../pages/Investments/InvestmentsPage";

interface InvestmentFormProps {
  investment: Investment | null;
  onSave: () => void;
  onCancel: () => void;
}

export function InvestmentForm({
  investment,
  onSave,
  onCancel,
}: InvestmentFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    quantity: "",
    acquisitionValue: "",
    acquisitionDate: new Date(),
  });

  useEffect(() => {
    if (investment) {
      setFormData({
        type: investment.type,
        description: investment.description,
        quantity: investment.quantity.toString(),
        acquisitionValue: investment.acquisitionValue.toString(),
        acquisitionDate: new Date(investment.acquisitionDate),
      });
    }
  }, [investment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = investment
      ? `${API_BASE_URL}/investment/${investment.id}`
      : `${API_BASE_URL}/investment`;
    const method = investment ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          acquisitionDate: formData.acquisitionDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar o investimento.");
      }

      toast.success(
        `Investimento ${investment ? "atualizado" : "criado"} com sucesso!`
      );
      onSave();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Ticker ou Nome)</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: PETR4, Tesouro Selic 2029"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Ativo</Label>
        <Input
          id="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="Ex: Ação, Renda Fixa, FII"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            type="number"
            step="0.0001"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Ex: 100"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="acquisitionValue">
            Preço de Aquisição (Unitário)
          </Label>
          <Input
            id="acquisitionValue"
            type="number"
            step="0.01"
            value={formData.acquisitionValue}
            onChange={handleChange}
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(formData.acquisitionDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.acquisitionDate}
              onSelect={(d) =>
                d && setFormData((prev) => ({ ...prev, acquisitionDate: d }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
