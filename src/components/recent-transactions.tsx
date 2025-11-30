import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";

interface Transaction {
  id: number;
  description: string;
  value: string;
  type: "RECEITA" | "DESPESA";
  date: string;
  category: {
    description: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  return (
    <Card className="border border-[#64748B] bg-[#3F4A5C]">
      <CardHeader>
        <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#3B82F6]" />
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 4. Mapear a lista de transações recebida via props */}
          {transactions.map((transaction) => {
            // Converter o valor de string para número para cálculos
            const numericValue = parseFloat(transaction.value);

            return (
              <div
                key={transaction.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-[#64748B]/20 border border-[#64748B] gap-4 md:gap-0"
              >
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "RECEITA"
                        ? "bg-[#22C55E]/20"
                        : "bg-[#DC2626]/20"
                    }`}
                  >
                    {transaction.type === "RECEITA" ? (
                      <ArrowUpCircle className="h-4 w-4 text-[#22C55E]" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-[#DC2626]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[#E2E8F0] font-medium">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="bg-[#64748B] text-[#E2E8F0] text-xs"
                      >
                        {/* 5. Acessar a descrição dentro do objeto category */}
                        {transaction.category.description}
                      </Badge>
                      <span className="text-xs text-[#E2E8F0]/70">
                        {/* 6. Formatar a data */}
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-right w-full md:w-auto flex justify-between md:block items-center ${
                    transaction.type === "RECEITA"
                      ? "text-[#22C55E]"
                      : "text-[#DC2626]"
                  }`}
                >
                  <span className="md:hidden text-sm text-[#E2E8F0]/70">Valor</span>
                  <p className="font-semibold">
                    {/* 7. Usar o valor numérico para a lógica de exibição */}
                    {numericValue > 0 ? "+" : ""}R${" "}
                    {Math.abs(numericValue).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
