import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { formatCurrency, formatPercentage } from "../components/ui/utils";
import { TrendingUp, Wallet } from "lucide-react";


type InvestmentSummaryItem = {
  id: number;
  description: string;
  type: string;
  quantity: number;
  acquisitionValue: number;
  initialAmount: number; // Para Renda Fixa
  currentPrice: number; // Para Renda Variável/Tesouro
  totalValue: number;
  profit: number;
  profitPercent: number;
};

type InvestmentSummaryProps = {
  data: InvestmentSummaryItem[];
};

// 2. Lógica de cálculo ATUALIZADA (e simplificada)
const calculateSummary = (data: InvestmentSummaryItem[]) => {
  if (!data || data.length === 0) {
    return {
      totalCurrentValue: 0,
      totalInvested: 0,
      totalProfit: 0,
      percentageProfit: 0,
    };
  }

  const totalCurrentValue = data.reduce(
    (acc, inv) => acc + inv.totalValue,
    0
  );

  // Lucro total é a soma do 'profit' de todos os investimentos
  const totalProfit = data.reduce((acc, inv) => acc + inv.profit, 0);

  // Valor investido é o Valor Atual - Lucro Total
  const totalInvested = totalCurrentValue - totalProfit;

  // Rentabilidade percentual total da carteira
  const percentageProfit =
    totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return {
    totalCurrentValue,
    totalInvested,
    totalProfit,
    percentageProfit,
  };
};

export function InvestmentSummary({ data }: InvestmentSummaryProps) {
  const { totalCurrentValue, totalInvested, totalProfit, percentageProfit } =
    calculateSummary(data);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resumo da Carteira</CardTitle>
        <CardDescription>
          Seu patrimônio total em investimentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Wallet className="h-8 w-8 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Valor Total</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCurrentValue)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Lucro/Prejuízo</div>
            <div
              className={`text-xl font-semibold ${
                totalProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalProfit)} ({formatPercentage(percentageProfit)}
              )
            </div>
            <div className="text-xs text-muted-foreground">
              Total Investido: {formatCurrency(totalInvested)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}