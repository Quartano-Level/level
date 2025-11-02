'use client'

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
  onRequestReprocess: (nota: NotaFiscal) => void;
  onSort: (field: keyof NotaFiscal) => void;
  sorting: {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
  };
  reprocessingNotaId?: string | null;
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
  onRequestReprocess,
  isReprocessing
}: { 
  nota: NotaFiscal; 
  onAccessPDF: (nota: NotaFiscal) => void;
  onRequestReprocess: (nota: NotaFiscal) => void;
  isReprocessing: boolean ;
}) => (
  <div className="flex space-x-2">
    
    {nota.status !== 'IDENTIFIED' && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAccessPDF(nota)}
              className="text-xs text-orange-600 border-orange-500 bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-600 transition-all duration-200 cursor-pointer"
            >
              Acessar PDF
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Visualizar o PDF da nota fiscal</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}

    {nota.status !== 'FINALIZADA' && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              onClick={() => onRequestReprocess(nota)}
              disabled={isReprocessing}
              className="text-xs bg-orange-500 text-white hover:bg-orange-600 border-orange-500 hover:border-orange-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

            >
              {isReprocessing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                "Reprocessar"
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isReprocessing ? "Processando solicitação..." : "Solicitar reprocessamento da nota"}</p>
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
  ({ notas, loading, onAccessPDF, onRequestReprocess, onSort, sorting, reprocessingNotaId }, ref) => {

    useImperativeHandle(ref, () => ({
      handleFilterChange: () => {},
      handleSearch: () => {}
    }));

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
            if (!isValidNota(nota)) return null;

            return (
              <TableRow key={nota.qive_id} className="hover:bg-gray-50 h-[52px] border-b border-gray-100">
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.emission_date}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.counterparty_cnpj}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.filCnpj}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.numero}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.total_value ? formatCurrency(nota.total_value) : 'R$ 0,00'}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.identified_date}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.processing_started_date}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.escriturada_date}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm h-[52px]">
                  {nota.status ? <StatusBadge status={nota.status} /> : '-'}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.obs !== "-" ? nota.obs : <span className="text-gray-400">-</span>}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                  {nota.attempts || 1}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-gray-500 h-[52px]">
                  <RowActions nota={nota} onAccessPDF={onAccessPDF} onRequestReprocess={onRequestReprocess} isReprocessing={reprocessingNotaId === nota.numero.toString()} />
                </TableCell>
              </TableRow>
            );
          })}
        </>
      );
    };

    return (
      <div className="rounded-md border bg-white w-full h-full overflow-y-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader className="bg-white border-b border-gray-100">
            <TableRow>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Data de Emissão" field="emission_date" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="CNPJ Prestador" field="filCnpj" sorting={sorting} onSort={onSort} />
              </TableHead>
              
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="CNPJ Filial" field="filCnpj" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Número da Nota" field="numero" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Valor" field="total_value" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Data de Identificação" field="identified_date" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Data Inicio Processamento" field="processing_started_date" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Data de Escrituração" field="escriturada_date" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Status" field="status" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                Detalhes
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                <SortableHeader label="Tentativas" field="attempts" sorting={sorting} onSort={onSort} />
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600 sticky top-0 bg-white z-10">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-white">{renderTableContent()}</TableBody>
        </Table>
      </div>
    );
  }
);

NotasTable.displayName = "NotasTable";
