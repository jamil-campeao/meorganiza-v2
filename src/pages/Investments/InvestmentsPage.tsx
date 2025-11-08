import { useState, useEffect } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { InvestmentForm } from "../../components/InvestmentsForm";
import { InvestmentSummary } from "../../components/investment-summary";
import { API_BASE_URL } from "../../constants/api";
import { toast } from "sonner";
import { formatCurrency, formatSimpleDate } from "../../components/ui/utils";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "../../context/AuthContext";
import { SideBarMenu } from "../../components/SideBarMenu";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";

export type Investment = {
  id: number;
  type: string; // "ACAO", "FII", "RENDA_FIXA_CDI", "TESOURO_DIRETO", "POUPANCA", "OUTRO"
  description: string;
  acquisitionDate: string;
  quantity?: number | string | null;
  acquisitionValue?: number | string | null;
  initialAmount?: number | string | null;
  indexer?: string | null;
  rate?: number | string | null;
  maturityDate?: string | null;
  active: boolean;
  userId: number;
};

const typeLabels: { [key: string]: string } = {
  ACAO: "Ação",
  FII: "FII",
  TESOURO_DIRETO: "Tesouro Direto",
  RENDA_FIXA_CDI: "Renda Fixa",
  POUPANCA: "Poupança",
  OUTRO: "Outro",
};

export function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(
    null
  );
  const [investmentToDelete, setInvestmentToDelete] =
    useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token, logout } = useAuth();

  const fetchInvestments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/investment`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setInvestments(data);
    } catch (error) {
      console.error("Erro ao buscar investimentos:", error);
      toast.error("Erro ao buscar investimentos.");
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/investment/summary`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Erro ao buscar resumo:", error);
      toast.error("Erro ao buscar resumo dos investimentos.");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchInvestments(), fetchSummary()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormSubmit = async (values: any) => {
    const data = {
      ...values,
      // Converte valores numéricos que o form envia como string
      quantity: values.quantity ? Number(values.quantity) : undefined,
      acquisitionValue: values.acquisitionValue
        ? Number(values.acquisitionValue)
        : undefined,
      initialAmount: values.initialAmount
        ? Number(values.initialAmount)
        : undefined,
      rate: values.rate ? Number(values.rate) : undefined,
    };

    try {
      if (investmentToEdit) {
        const response = await fetch(`${API_BASE_URL}/investment`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: investmentToEdit.id, ...data }),
        });

        if (!response.ok) {
          throw new Error("Não foi possível atualizar o investimento.");
        }

        toast.success("Investimento atualizado com sucesso!");
      } else {
        await fetch(`${API_BASE_URL}/investment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        toast.success("Investimento salvo com sucesso!");
      }
      setIsFormOpen(false);
      setInvestmentToEdit(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar investimento:", error);
      toast.error("Erro ao salvar investimento.");
    }
  };

  const handleDelete = async (investment: Investment) => {
    try {
      await fetch(`${API_BASE_URL}/investment/${investment.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Investimento excluído com sucesso!");
      setInvestmentToDelete(null);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir investimento:", error);
      toast.error("Erro ao excluir investimento.");
    }
  };

  const handleEdit = (investment: Investment) => {
    setInvestmentToEdit(investment);
    setIsFormOpen(true);
  };

  const openForm = () => {
    setInvestmentToEdit(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setInvestmentToEdit(null);
  };

  const columns: ColumnDef<Investment>[] = [
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => <span>{row.original.description}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <span>{typeLabels[row.original.type] || row.original.type}</span>
      ),
    },
    {
      accessorKey: "acquisitionDate",
      header: "Data",
      cell: ({ row }) => (
        <span>{formatSimpleDate(row.original.acquisitionDate)}</span>
      ),
    },
    // Coluna Condicional: Renda Variável
    {
      id: "rvData",
      header: "Qtd. / Preço (R$)",
      cell: ({ row }) => {
        const { type, quantity, acquisitionValue } = row.original;
        if (type === "ACAO" || type === "FII" || type === "TESOURO_DIRETO") {
          return (
            <span>
              {quantity} @ {formatCurrency(Number(acquisitionValue))}
            </span>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
    // Coluna Condicional: Renda Fixa
    {
      id: "rfData",
      header: "Valor Aplicado (R$)",
      cell: ({ row }) => {
        const { type, initialAmount } = row.original;
        if (
          type === "RENDA_FIXA_CDI" ||
          type === "POUPANCA" ||
          type === "OUTRO"
        ) {
          return <span>{formatCurrency(Number(initialAmount))}</span>;
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
    // Coluna Condicional: Indexadores
    {
      id: "rfIndexer",
      header: "Taxa / Indexador",
      cell: ({ row }) => {
        const { type, rate, indexer } = row.original;
        if (type === "RENDA_FIXA_CDI") {
          return (
            <span>
              {rate}% {indexer}
            </span>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setInvestmentToDelete(row.original)}
              className="text-red-500"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: investments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          {/* Resumo */}
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            summary && <InvestmentSummary data={summary} />
          )}

          {/* Formulário (Modal/Sheet) */}
          {isFormOpen && (
            <div className="my-4 p-4 border rounded-lg">
              <h2 className="text-lg font-semibold mb-4">
                {investmentToEdit ? "Editar" : "Adicionar"} Investimento
              </h2>
              <InvestmentForm
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
                investmentToEdit={investmentToEdit}
              />
            </div>
          )}

          {/* Tabela de Investimentos */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Meus Investimentos</h2>
              {!isFormOpen && (
                <Button onClick={openForm} size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Nenhum investimento encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Confirmação de Exclusão */}
          <AlertDialog
            open={!!investmentToDelete}
            onOpenChange={(open) => !open && setInvestmentToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente
                  seu investimento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    investmentToDelete && handleDelete(investmentToDelete)
                  }
                  className="bg-red-500 hover:bg-red-600"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
