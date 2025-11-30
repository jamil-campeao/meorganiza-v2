import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../../components/ui/sidebar";
import { SideBarMenu } from "../../components/SideBarMenu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Eye, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { InvoiceDetail } from "../../components/InvoiceDetail";
import { Button } from "../../components/ui/button";

export interface InvoiceSummary {
  id: number;
  month: number;
  year: number;
  totalAmount: number;
  isPaid: boolean;
  card: {
    name: string;
  };
}

// Interface para o detalhe da fatura
export interface InvoiceDetails extends InvoiceSummary {
  transactions: any[];
}

export function InvoicesPage() {
  const { token, logout } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) logout();
      if (!response.ok)
        throw new Error("Não foi possível carregar as faturas.");
      const data: InvoiceSummary[] = await response.json();
      setInvoices(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const handleViewDetails = async (invoiceId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/invoice/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error("Não foi possível carregar os detalhes da fatura.");
      const data: InvoiceDetails = await response.json();
      setSelectedInvoice(data);
      setIsDialogOpen(true);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Função para fechar o modal e recarregar a lista
  const handleCloseDetail = () => {
    setIsDialogOpen(false);
    setSelectedInvoice(null);
    fetchInvoices(); // Re-busca para garantir que o status (pago/pendente) esteja atualizado
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  if (isLoading)
    return (
      <SidebarProvider>
        <SideBarMenu />
        <SidebarInset>
          <div className="flex justify-center items-center h-screen">
            Carregando faturas...
          </div>
        </SidebarInset>
      </SidebarProvider>
    );

  return (
    <SidebarProvider>
      <SideBarMenu />
      <SidebarInset>
        <div className="min-h-screen bg-[#2F3748] text-[#E2E8F0] dark w-full">
          <div className="container mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-3xl font-bold">Minhas Faturas</h1>
            </div>
            <Card className="border border-[#64748B] bg-[#3F4A5C]">
              <CardHeader>
                <CardTitle>Histórico de Faturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-[#64748B]/20 border border-[#64748B] gap-4 md:gap-0"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="h-6 w-6 text-blue-400" />
                          <div>
                            <p className="font-bold text-lg">
                              {invoice.card.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {monthNames[invoice.month - 1]} de {invoice.year}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
                          <div className="flex justify-between w-full md:block">
                            <span className="md:hidden text-gray-400">Total</span>
                            <div className="text-right">
                              <p className="text-lg font-semibold">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(invoice.totalAmount)}
                              </p>
                              <Badge
                                className={`mt-1 ${
                                  invoice.isPaid ? "bg-green-600" : "bg-red-600"
                                }`}
                              >
                                {invoice.isPaid ? "Paga" : "Pendente"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full md:w-auto"
                            onClick={() => handleViewDetails(invoice.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">
                      Nenhuma fatura encontrada.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#3F4A5C] border-[#64748B] text-[#E2E8F0] sm:max-w-lg max-h-[85vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Detalhes da Fatura</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              {selectedInvoice?.card.name} -{" "}
              {selectedInvoice && monthNames[selectedInvoice.month - 1]} de{" "}
              {selectedInvoice?.year}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
            {selectedInvoice && (
              <InvoiceDetail
                invoice={selectedInvoice}
                onClose={handleCloseDetail}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Toaster theme="dark" />
    </SidebarProvider>
  );
}
