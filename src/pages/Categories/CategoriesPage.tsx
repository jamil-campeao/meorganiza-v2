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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { CategoryForm } from "../../components/CategoryForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Toaster } from "../../components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";

export interface Category {
  id: number;
  description: string;
  type: "RECEITA" | "DESPESA";
  active: boolean;
}

export function CategoriesPage() {
  const { token, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 6. Adicionar o useEffect para buscar os dados da API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
        };

        const response = await fetch(
          `${API_BASE_URL}/categories`,
          requestOptions
        );

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar as categorias.");
        }

        const result: Category[] = await response.json();
        setCategories(result);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [token, logout]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      toast.error("Sua sessão expirou. Por favor, faca login novamente.");
      return;
    }

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
      };

      const response = await fetch(
        `${API_BASE_URL}/categories/${id}`,
        requestOptions
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Não foi possível deletar a categoria."
        );
      }

      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Categoria deletada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao deletar categoria:", error);
      toast.error(error.message || "Ocorreu um erro inesperado.");
    }
  };
  const handleSave = async (categoryData: Omit<Category, "id" | "active">) => {
    // 1. Recebe os dados do formulário
    if (!token) {
      toast.error("Você não está autenticado.");
      return;
    }

    // Defino a URL e o método com base no modo (edição ou criação)
    const isEditing = !!editingCategory;
    const url = isEditing
      ? `${API_BASE_URL}/categories/${editingCategory.id}`
      : `${API_BASE_URL}/categories`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        description: categoryData.description,
        type: categoryData.type,
      });

      const requestOptions = {
        method: method,
        headers: myHeaders,
        body: raw,
        redirect: "follow" as const,
      };

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Não foi possível salvar a categoria.`
        );
      }

      const savedCategory: Category = await response.json();

      if (isEditing) {
        // 2. Atualiza a categoria existente na lista
        setCategories(
          categories.map((c) => (c.id === savedCategory.id ? savedCategory : c))
        );
        toast.success("Categoria atualizada com sucesso!");
      } else {
        // 3. Adiciona a nova categoria retornada pela API na lista
        setCategories([...categories, savedCategory]);
        toast.success("Categoria criada com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      toast.error(error.message || "Ocorreu um erro inesperado.");
    }
  };

  const incomeCategories = categories.filter((c) => c.type === "RECEITA");
  const expenseCategories = categories.filter((c) => c.type === "DESPESA");

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Gestão de Categorias</h1>
              <Button
                onClick={handleAddNew}
                className="bg-[#8B3A3A] hover:bg-[#8B3A3A]/80"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Categoria
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Card de Receitas */}
              <Card className="border border-[#64748B] bg-[#3F4A5C]">
                <CardHeader>
                  <CardTitle className="text-[#22C55E]">
                    Categorias de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {incomeCategories.map((cat) => (
                      <li
                        key={cat.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-[#64748B]/20"
                      >
                        <span>{cat.description}</span>
                        <div className="space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cat)}
                          >
                            <Edit className="h-4 w-4 text-yellow-400" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Você tem certeza?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso irá
                                  deletar permanentemente a categoria.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cat.id)}
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Card de Despesas */}
              <Card className="border border-[#64748B] bg-[#3F4A5C]">
                <CardHeader>
                  <CardTitle className="text-[#DC2626]">
                    Categorias de Despesa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {expenseCategories.map((cat) => (
                      <li
                        key={cat.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-[#64748B]/20"
                      >
                        <span>{cat.description}</span>
                        <div className="space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cat)}
                          >
                            <Edit className="h-4 w-4 text-yellow-400" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Você tem certeza?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso irá
                                  deletar permanentemente a categoria.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cat.id)}
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
