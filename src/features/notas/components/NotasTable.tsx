import { forwardRef, useImperativeHandle } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { NotaFiscal } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatCurrency, isValidNota, isEmptyData, getStatusConfig } from "../utils/notasUtils";

interface NotasTableProps {
  notas: NotaFiscal[];
  loading: boolean;
  onAccessPDF: (nota: NotaFiscal) => void;
  onCorrect: (nota: NotaFiscal) => void;
  onSort: (field: keyof NotaFiscal) => void;
  sorting: {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
  };
}

export type NotasTableRef = {
  handleFilterChange: (filter: string | null) => void;
  handleSearch: (term: string) => void;
};

// Número fixo de linhas a serem exibidas na tabela
const FIXED_ROW_COUNT = 7;

// Componente para renderizar o status da nota
const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status);
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Componente para ações da linha
const RowActions = ({ 
  nota, 
  onAccessPDF, 
  onCorrect 
}: { 
  nota: NotaFiscal; 
  onAccessPDF: (nota: NotaFiscal) => void;
  onCorrect: (nota: NotaFiscal) => void;
}) => (
  <div className="flex space-x-2">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAccessPDF(nota)}
            className="text-xs text-green-600 border-green-500 bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-600 transition-all duration-200 cursor-pointer"
          >
            Acessar PDF
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualizar o PDF da nota fiscal</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    
    {nota.status === "pendente" && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={() => onCorrect(nota)}
              className="text-xs bg-green-500 text-white hover:bg-green-600 border-green-500 hover:border-green-600 transition-all duration-200 cursor-pointer"
            >
              Reprocessar
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Solicitar reprocessamento da nota</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

// Componente para cabeçalho ordenável
const SortableHeader = ({ 
  label, 
  field, 
  sorting, 
  onSort 
}: { 
  label: string; 
  field: keyof NotaFiscal;
  sorting: { field: keyof NotaFiscal | null; direction: 'asc' | 'desc' };
  onSort: (field: keyof NotaFiscal) => void;
}) => {
  const isSorted = sorting.field === field;
  const sortIcon = isSorted && sorting.direction === 'asc' ? '↑' : '↓';
  
  return (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => onSort(field)}
    >
      {label}
      {isSorted && <span className="ml-1">{sortIcon}</span>}
    </div>
  );
};

// Componente para estado de carregamento
const LoadingState = () => (
  <TableRow>
    <TableCell colSpan={7} className="text-center py-12">
      <div className="flex flex-col justify-center items-center">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.2s_ease-in-out_infinite]"></div>
          <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.2s_ease-in-out_infinite_0.2s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.2s_ease-in-out_infinite_0.4s]"></div>
        </div>
        <span className="text-gray-500 font-medium">Carregando notas...</span>
      </div>
    </TableCell>
  </TableRow>
);

// Componente para estado vazio
const EmptyState = () => (
  <>
    <TableRow className="h-[52px] border-b border-gray-100">
      <TableCell colSpan={7} className="py-6 text-center text-gray-500">
        Nenhuma nota fiscal encontrada.
      </TableCell>
    </TableRow>
    {Array.from({ length: FIXED_ROW_COUNT - 1 }).map((_, index) => (
      <TableRow key={`empty-${index}`} className="h-[52px] border-b border-gray-100">
        {Array.from({ length: 7 }).map((_, cellIndex) => (
          <TableCell key={`empty-cell-${index}-${cellIndex}`} className="py-4 px-6 h-[52px]"></TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

/**
 * Componente de tabela para notas fiscais
 */
export const NotasTable = forwardRef<NotasTableRef, NotasTableProps>(
  ({ notas, loading, onAccessPDF, onCorrect, onSort, sorting }, ref) => {
    // Expor funções para o componente pai
    useImperativeHandle(ref, () => ({
      handleFilterChange: () => {},
      handleSearch: () => {}
    }));

    // Renderizar o conteúdo da tabela com base no estado
    const renderTableContent = () => {
      if (loading) {
        return <LoadingState />;
      }

      if (isEmptyData(notas)) {
        return <EmptyState />;
      }

      return (
        <>
          {notas.map((nota) => {
            if (!isValidNota(nota)) {
              return null;
            }
            
            return (
              <TableRow key={nota.id} className="hover:bg-gray-50 h-[52px] border-b border-gray-100">
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.data_emissao}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.cnpj_prestador}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.numero_nf}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.valor_total ? formatCurrency(nota.valor_total) : 'R$ 0,00'}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm h-[52px]">
                  {nota.status ? <StatusBadge status={nota.status} /> : '-'}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.motivos_pendencia !== "-" ? 
                    nota.motivos_pendencia :  
                    <span className="text-gray-400">-</span>
                  }
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-500 h-[52px]">
                  <RowActions 
                    nota={nota}
                    onAccessPDF={onAccessPDF}
                    onCorrect={onCorrect}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </>
      );
    };

    return (
      <div className="overflow-hidden rounded-md border-none bg-white w-full">
        <Table className="w-full">
          <TableHeader className={loading ? "hidden" : ""}>
            <TableRow className="border-b border-gray-100">
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                <SortableHeader label="Data de Emissão" field="data_emissao" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                <SortableHeader label="CNPJ Prestador" field="cnpj_prestador" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                <SortableHeader label="Número da Nota" field="numero_nf" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                <SortableHeader label="Valor" field="valor_total" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                <SortableHeader label="Status" field="status" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                Detalhes
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {renderTableContent()}
          </TableBody>
        </Table>
      </div>
    );
  }
);

// Adicionar um displayName ao componente
NotasTable.displayName = "NotasTable"; 