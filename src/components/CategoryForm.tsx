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
import { Category } from "../pages/Categories/CategoriesPage";

interface CategoryFormProps {
  category: Category | null;
  onSave: (category: Category) => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSave,
  onCancel,
}: CategoryFormProps) {
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"RECEITA" | "DESPESA">("DESPESA");

  useEffect(() => {
    if (category) {
      setDescription(category.description);
      setType(category.type);
    } else {
      setDescription("");
      setType("DESPESA");
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: category?.id || 0,
      description,
      type,
      active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-[#E2E8F0]">
          Descrição
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Supermercado"
          className="bg-[#64748B] border-[#64748B] text-[#E2E8F0] placeholder:text-[#E2E8F0]/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type" className="text-[#E2E8F0]">
          Tipo
        </Label>
        <Select
          value={type}
          onValueChange={(value: "RECEITA" | "DESPESA") => setType(value)}
        >
          <SelectTrigger className="bg-[#64748B] border-[#64748B] text-[#E2E8F0]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#64748B] border-[#64748B]">
            <SelectItem
              value="DESPESA"
              className="text-[#E2E8F0] focus:bg-[#8B3A3A]"
            >
              Despesa
            </SelectItem>
            <SelectItem
              value="RECEITA"
              className="text-[#E2E8F0] focus:bg-[#8B3A3A]"
            >
              Receita
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
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
