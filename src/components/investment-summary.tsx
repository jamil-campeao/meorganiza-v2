import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, PieChart, DollarSign } from "lucide-react";

const investments = [
  {
    id: 1,
    name: "ITUB4",
    type: "Ação",
    quantity: 100,
    avgPrice: 28.50,
    currentPrice: 32.80,
    totalValue: 3280.00,
    profit: 430.00,
    profitPercent: 15.09
  },
  {
    id: 2,
    name: "Tesouro Selic 2029",
    type: "Renda Fixa",
    quantity: 0.85,
    avgPrice: 12500.00,
    currentPrice: 12850.00,
    totalValue: 10922.50,
    profit: 297.50,
    profitPercent: 2.80
  },
  {
    id: 3,
    name: "PETR4",
    type: "Ação",
    quantity: 50,
    avgPrice: 35.20,
    currentPrice: 33.10,
    totalValue: 1655.00,
    profit: -105.00,
    profitPercent: -5.97
  },
  {
    id: 4,
    name: "HASH11",
    type: "FII",
    quantity: 25,
    avgPrice: 105.80,
    currentPrice: 108.50,
    totalValue: 2712.50,
    profit: 67.50,
    profitPercent: 2.55
  }
];

const totalInvested = investments.reduce((acc, inv) => acc + (inv.avgPrice * inv.quantity), 0);
const totalCurrent = investments.reduce((acc, inv) => acc + inv.totalValue, 0);
const totalProfit = totalCurrent - totalInvested;
const totalProfitPercent = (totalProfit / totalInvested) * 100;

export function InvestmentSummary() {
  return (
    <div className="space-y-4">
      {/* Resumo Geral */}
      <Card className="border border-[#64748B] bg-[#3F4A5C]">
        <CardHeader>
          <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#8B5CF6]" />
            Resumo de Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-[#E2E8F0]/70">Total Investido</p>
              <p className="text-lg font-semibold text-[#E2E8F0]">
                R$ {totalInvested.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#E2E8F0]/70">Valor Atual</p>
              <p className="text-lg font-semibold text-[#E2E8F0]">
                R$ {totalCurrent.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#E2E8F0]/70">Lucro/Prejuízo</p>
              <p className={`text-lg font-semibold ${
                totalProfit >= 0 ? 'text-[#22C55E]' : 'text-[#DC2626]'
              }`}>
                R$ {totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#E2E8F0]/70">Rentabilidade</p>
              <p className={`text-lg font-semibold flex items-center justify-center gap-1 ${
                totalProfitPercent >= 0 ? 'text-[#22C55E]' : 'text-[#DC2626]'
              }`}>
                {totalProfitPercent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {totalProfitPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Investimentos */}
      <Card className="border border-[#64748B] bg-[#3F4A5C]">
        <CardHeader>
          <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#3B82F6]" />
            Carteira de Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-3 rounded-lg bg-[#64748B]/20 border border-[#64748B]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-[#8B5CF6]/20">
                    <DollarSign className="h-4 w-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-[#E2E8F0] font-medium">
                      {investment.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="bg-[#64748B] text-[#E2E8F0] text-xs"
                      >
                        {investment.type}
                      </Badge>
                      <span className="text-xs text-[#E2E8F0]/70">
                        {investment.quantity} {investment.type === 'Ação' || investment.type === 'FII' ? 'cotas' : 'títulos'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#E2E8F0] font-semibold">
                    R$ {investment.totalValue.toFixed(2)}
                  </p>
                  <div className={`flex items-center justify-end space-x-1 mt-1 ${
                    investment.profit >= 0 ? 'text-[#22C55E]' : 'text-[#DC2626]'
                  }`}>
                    {investment.profit >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium">
                      {investment.profitPercent >= 0 ? '+' : ''}
                      {investment.profitPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}