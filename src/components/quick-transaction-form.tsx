import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function QuickTransactionForm() {
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    amount: "",
    category: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.description || !formData.amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    toast.success("Transação adicionada com sucesso!");
    setFormData({ type: "", description: "", amount: "", category: "" });
  };

  const categories = {
    receita: ["Salário", "Freelance", "Investimentos", "Outros"],
    despesa: ["Alimentação", "Transporte", "Lazer", "Saúde", "Educação", "Outros"]
  };

  return (
    <Card className="border border-[#64748B] bg-[#3F4A5C]">
      <CardHeader>
        <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#8B3A3A]" />
          Registro Rápido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-[#E2E8F0]">Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value, category: ""})}
              >
                <SelectTrigger className="bg-[#64748B] border-[#64748B] text-[#E2E8F0]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#64748B] border-[#64748B]">
                  <SelectItem value="receita" className="text-[#E2E8F0] focus:bg-[#8B3A3A]">Receita</SelectItem>
                  <SelectItem value="despesa" className="text-[#E2E8F0] focus:bg-[#8B3A3A]">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[#E2E8F0]">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="bg-[#64748B] border-[#64748B] text-[#E2E8F0] placeholder:text-[#E2E8F0]/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#E2E8F0]">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da transação"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-[#64748B] border-[#64748B] text-[#E2E8F0] placeholder:text-[#E2E8F0]/50"
            />
          </div>

          {formData.type && (
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#E2E8F0]">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="bg-[#64748B] border-[#64748B] text-[#E2E8F0]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-[#64748B] border-[#64748B]">
                  {categories[formData.type as keyof typeof categories]?.map((cat) => (
                    <SelectItem 
                      key={cat} 
                      value={cat} 
                      className="text-[#E2E8F0] focus:bg-[#8B3A3A]"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-[#8B3A3A] hover:bg-[#8B3A3A]/80 text-[#F8FAFC]"
          >
            Adicionar Transação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}