import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  // Garante que o valor é um número antes de formatar
  if (isNaN(value) || value === null) {
    value = 0;
  }
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata uma string de data (ISO) para o formato "dd/MM/yyyy".
 * Ex: "2025-10-20T03:00:00.000Z" -> "20/10/2025"
 * @param dateString A string de data (geralmente vinda da API).
 */
export function formatSimpleDate(dateString: string): string {
  try {
    // 1. Converte a string ISO (vinda da API) para um objeto Date
    const date = parseISO(dateString);
    // 2. Formata o objeto Date para o padrão brasileiro
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
}

export function formatPercentage(value: number): string {
  if (isNaN(value) || value === null) {
    value = 0;
  }

  // Formata o número com duas casas decimais
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  // Adiciona o símbolo de %
  return `${formattedValue}%`;
}