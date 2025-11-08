import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "../components/ui/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Investment } from "../pages/Investments/InvestmentsPage";

const InvestmentType = {
  ACAO: "ACAO",
  FII: "FII",
  TESOURO_DIRETO: "TESOURO_DIRETO",
  RENDA_FIXA_CDI: "RENDA_FIXA_CDI",
  POUPANCA: "POUPANCA",
  OUTRO: "OUTRO",
} as const;

const investmentTypeLabels = {
  [InvestmentType.ACAO]: "Ação",
  [InvestmentType.FII]: "Fundo Imobiliário (FII)",
  [InvestmentType.TESOURO_DIRETO]: "Tesouro Direto",
  [InvestmentType.RENDA_FIXA_CDI]: "Renda Fixa (CDI, LCI, etc.)",
  [InvestmentType.POUPANCA]: "Poupança",
  [InvestmentType.OUTRO]: "Outro",
};

const indexerLabels = {
  CDI: "CDI",
  IPCA: "IPCA",
  SELIC: "SELIC",
  PRE: "Pré-fixado",
};

type FormData = {
  type: keyof typeof InvestmentType;
  description: string;
  acquisitionDate: Date;
  quantity?: number;
  acquisitionValue?: number;
  initialAmount?: number;
  indexer?: string;
  rate?: number;
  maturityDate?: Date | null;
};

type InvestmentFormProps = {
  onSubmit: (values: FormData) => void;
  onCancel: () => void;
  investmentToEdit: Investment | null;
};

export function InvestmentForm({
  onSubmit,
  onCancel,
  investmentToEdit,
}: InvestmentFormProps) {
  // 3. Atualizamos o useForm
  const form = useForm<FormData>({
    defaultValues: {
      type: undefined,
      description: "",
      acquisitionDate: new Date(),
      quantity: undefined,
      acquisitionValue: undefined,
      initialAmount: undefined,
      indexer: undefined,
      rate: undefined,
      maturityDate: undefined,
    },
  });
  const [isAcquisitionDateOpen, setIsAcquisitionDateOpen] = useState(false);
  const [isMaturityDateOpen, setIsMaturityDateOpen] = useState(false);

  const watchedType = form.watch("type");

  useEffect(() => {
    if (investmentToEdit) {
      form.setValue("type", investmentToEdit.type as any);
      form.setValue("description", investmentToEdit.description);
      form.setValue(
        "acquisitionDate",
        new Date(investmentToEdit.acquisitionDate)
      );
      form.setValue(
        "quantity",
        investmentToEdit.quantity
          ? parseFloat(String(investmentToEdit.quantity)) // Converte para string primeiro
          : undefined
      );
      form.setValue(
        "acquisitionValue",
        investmentToEdit.acquisitionValue
          ? parseFloat(String(investmentToEdit.acquisitionValue))
          : undefined
      );
      form.setValue(
        "initialAmount",
        investmentToEdit.initialAmount
          ? parseFloat(String(investmentToEdit.initialAmount))
          : undefined
      );
      form.setValue("indexer", investmentToEdit.indexer || undefined);
      form.setValue(
        "rate",
        investmentToEdit.rate
          ? parseFloat(String(investmentToEdit.rate))
          : undefined
      );
      form.setValue(
        "maturityDate",
        investmentToEdit.maturityDate
          ? new Date(investmentToEdit.maturityDate)
          : undefined
      );
    }
  }, [investmentToEdit, form]);

  const handleSubmit = (values: FormData) => {
    const dataToSend = {
      ...values,
      quantity: values.quantity ? Number(values.quantity) : undefined,
      acquisitionValue: values.acquisitionValue
        ? Number(values.acquisitionValue)
        : undefined,
      initialAmount: values.initialAmount
        ? Number(values.initialAmount)
        : undefined,
      rate: values.rate ? Number(values.rate) : undefined,
    };
    onSubmit(dataToSend);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* --- CAMPO DE TIPO (CORRIGIDO) --- */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Investimento</FormLabel>
              {/* 'onValueChange' e 'value' ficam no Select */}
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  {/* A ref DEVE ser passada para o SelectTrigger */}
                  <SelectTrigger ref={field.ref}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(InvestmentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {investmentTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- CAMPOS COMUNS (Descrição e Data) --- */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Ticker, Título, etc.)</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    watchedType === "ACAO"
                      ? "Ex: PETR4"
                      : watchedType === "RENDA_FIXA_CDI"
                      ? "Ex: CDB Neon 110%"
                      : "Ex: Tesouro Selic 2029"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acquisitionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Aquisição/Aplicação</FormLabel>
              <Popover
                open={isAcquisitionDateOpen}
                onOpenChange={setIsAcquisitionDateOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    {/* A ref DEVE ser passada para o Button */}
                    <Button
                      ref={field.ref}
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date); // 'onChange' e 'value' são controlados aqui
                      setIsAcquisitionDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- CAMPOS CONDICIONAIS: RENDA VARIÁVEL E TESOURO --- */}
        {(watchedType === InvestmentType.ACAO ||
          watchedType === InvestmentType.FII ||
          watchedType === InvestmentType.TESOURO_DIRETO) && (
          <>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Ex: 100 (para Ações) ou 0.01 (para Tesouro)"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acquisitionValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Unitário de Aquisição (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 35.50"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* --- CAMPOS CONDICIONAIS: RENDA FIXA, POUPANÇA, OUTROS --- */}
        {(watchedType === InvestmentType.RENDA_FIXA_CDI ||
          watchedType === InvestmentType.POUPANCA ||
          watchedType === InvestmentType.OUTRO) && (
          <FormField
            control={form.control}
            name="initialAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Inicial Aplicado (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1000.00"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* --- CAMPOS CONDICIONAIS: APENAS RENDA FIXA (CDI, etc.) --- */}
        {watchedType === InvestmentType.RENDA_FIXA_CDI && (
          <>
            <FormField
              control={form.control}
              name="indexer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indexador</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o indexador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(indexerLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 110 (para 110% do CDI) ou 12.5 (para 12.5% a.a.)"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* --- CAMPO CONDICIONAL: VENCIMENTO (Opcional para RF) --- */}
        {(watchedType === InvestmentType.RENDA_FIXA_CDI ||
          watchedType === InvestmentType.TESOURO_DIRETO ||
          watchedType === InvestmentType.POUPANCA ||
          watchedType === InvestmentType.OUTRO) && (
          <FormField
            control={form.control}
            name="maturityDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Vencimento (Opcional)</FormLabel>
                <Popover
                  open={isMaturityDateOpen}
                  onOpenChange={setIsMaturityDateOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        ref={field.ref}
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data (se houver)</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsMaturityDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* --- BOTÕES --- */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {investmentToEdit ? "Atualizar" : "Salvar"} Investimento
          </Button>
        </div>
      </form>
    </Form>
  );
}
