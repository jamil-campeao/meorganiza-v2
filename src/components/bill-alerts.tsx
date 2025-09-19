import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, Calendar, CreditCard } from "lucide-react";

const bills = [
  {
    id: 1,
    name: "Cartão de Crédito",
    dueDate: "15/04/2024",
    amount: 1250.30,
    status: "vencendo",
    daysLeft: 2
  },
  {
    id: 2,
    name: "Conta de Luz",
    dueDate: "18/04/2024",
    amount: 180.45,
    status: "normal",
    daysLeft: 5
  },
  {
    id: 3,
    name: "Internet",
    dueDate: "20/04/2024",
    amount: 99.90,
    status: "normal",
    daysLeft: 7
  },
  {
    id: 4,
    name: "Financiamento do Carro",
    dueDate: "25/04/2024",
    amount: 850.00,
    status: "normal",
    daysLeft: 12
  },
  {
    id: 5,
    name: "Plano de Saúde",
    dueDate: "10/04/2024",
    amount: 320.00,
    status: "vencida",
    daysLeft: -3
  }
];

export function BillAlerts() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vencida':
        return 'bg-[#DC2626] text-[#F8FAFC]';
      case 'vencendo':
        return 'bg-[#F59E0B] text-[#1F2937]';
      default:
        return 'bg-[#3B82F6] text-[#F8FAFC]';
    }
  };

  const getStatusText = (status: string, daysLeft: number) => {
    if (status === 'vencida') return 'Vencida';
    if (status === 'vencendo') return `${daysLeft} dias`;
    return `${daysLeft} dias`;
  };

  return (
    <Card className="border border-[#64748B] bg-[#3F4A5C]">
      <CardHeader>
        <CardTitle className="text-[#E2E8F0] flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
          Alertas de Vencimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-[#64748B]/20 border border-[#64748B]">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  bill.status === 'vencida' 
                    ? 'bg-[#DC2626]/20' 
                    : bill.status === 'vencendo'
                    ? 'bg-[#F59E0B]/20'
                    : 'bg-[#3B82F6]/20'
                }`}>
                  {bill.status === 'vencida' ? (
                    <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                  ) : (
                    <CreditCard className={`h-4 w-4 ${
                      bill.status === 'vencendo' ? 'text-[#F59E0B]' : 'text-[#3B82F6]'
                    }`} />
                  )}
                </div>
                <div>
                  <p className="text-[#E2E8F0] font-medium">
                    {bill.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-3 w-3 text-[#E2E8F0]/70" />
                    <span className="text-xs text-[#E2E8F0]/70">
                      Vence em {bill.dueDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#E2E8F0] font-semibold">
                  R$ {bill.amount.toFixed(2)}
                </p>
                <Badge 
                  className={`mt-1 ${getStatusColor(bill.status)}`}
                >
                  {getStatusText(bill.status, bill.daysLeft)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}