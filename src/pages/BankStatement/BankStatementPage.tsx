import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Toaster, toast } from "sonner";
import { Account } from "../Accounts/AccountsPage";
import { Category } from "../Categories/CategoriesPage";

export function BankStatementPage() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // Busca contas e categorias
    const fetchData = async () => {
      if (!token) return;
      try {
        const [accRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/account`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/categories`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const accData = await accRes.json();
        const catData = await catRes.json();
        setAccounts(accData);
        setCategories(catData);
      } catch (error) {
        toast.error("Erro ao carregar dados.");
      }
    };
    fetchData();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedAccount || !selectedCategory) {
      toast.error("Por favor, selecione um arquivo, conta e categoria.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", selectedAccount);
    formData.append("categoryId", selectedCategory);

    try {
      const response = await fetch(`${API_BASE_URL}/bankstatement`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha no upload do extrato.");
      }

      toast.success("Extrato importado com sucesso!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Importar Extrato</h1>
            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle>Selecione o arquivo e as opções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Importar para a conta</Label>
                  <Select
                    value={selectedAccount}
                    onValueChange={setSelectedAccount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta" />
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
                  <Label htmlFor="category">
                    Categoria Padrão para novas transações
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.description} ({cat.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo de Extrato (.csv)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv"
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  className="w-full bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
                >
                  <Upload className="mr-2 h-4 w-4" /> Importar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
