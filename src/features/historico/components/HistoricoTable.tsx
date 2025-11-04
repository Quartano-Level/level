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

interface HistoricoTableProps {
  notas: NotaFiscal[] | null;
  loading: boolean;
  onAccessPDF: (nota: NotaFiscal) => void;
  onSort: (field: keyof NotaFiscal) => void;
  sorting: {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
  };
}

export type HistoricoTableRef = {
  handleFilterChange: (filter: string | null) => void;
  handleSearch: (term: string) => void;
};

// Número fixo de linhas a serem exibidas na tabela
const FIXED_ROW_COUNT = 12;

/**
 * Componente de tabela para notas fiscais
 */
export const HistoricoTable = forwardRef<HistoricoTableRef, HistoricoTableProps>(
  ({ notas, loading, onAccessPDF, onSort, sorting }, ref) => {
    // Expor funções para o componente pai
    useImperativeHandle(ref, () => ({
      handleFilterChange: (filter: string | null) => {
        console.log("Tabela: Filtro alterado para", filter);
      },
      handleSearch: (term: string) => {
        console.log("Tabela: Termo de busca alterado para", term);
      }
    }));

    // Função para renderizar o cabeçalho da coluna com opção de ordenação
    const renderSortableHeader = (label: string, field: keyof NotaFiscal) => {
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

    // Função para renderizar a badge de status com a cor correta
    const renderStatusBadge = (status: string) => {
      let bgClass = "";
      let textClass = "";
      let label = "";
      
      switch(status) {
        case "finalizada":
          bgClass = "bg-green-100";
          textClass = "text-green-800";
          label = "Finalizada";
          break;
        case "recusado":
        case "reprovado":
        case "rejeitado":
          bgClass = "bg-red-100";
          textClass = "text-red-800";
          label = "Recusado";
          break;
        default:
          bgClass = "bg-gray-100";
          textClass = "text-gray-800";
          label = status;
      }
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass} ${textClass}`}>
          {label}
        </span>
      );
    };

    // Formatar valor para exibição
    const formatCurrency = (value?: number | null) => {
      const numberValue = typeof value === 'number' ? value : 0;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numberValue);
    };

    // Formatar data para exibição
        const formatDate = (dateString?: string | null) => {
          if (!dateString) return '';
          // Adiciona a hora (T00:00:00) para garantir que a data seja interpretada no fuso horário correto
          const date = new Date(dateString + 'T00:00:00');
          return date.toLocaleDateString('pt-BR');
        };

    // Renderizar o conteúdo da tabela com base no estado
    const renderTableContent = () => {
      if (loading) {
        return (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-12">
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
      }

      if (notas && notas.length === 0) {
        return (
          <>
            <TableRow className="h-[52px] border-b border-gray-100">
              <TableCell colSpan={8} className="py-6 text-center text-gray-500">
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
      }

      return (
        <>
          {notas?.map((nota) => (
            <TableRow key={nota.qive_id} className="hover:bg-gray-50 h-[52px] border-b border-gray-100">
              <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                {formatDate(nota.emission_date)}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                {nota.counterparty_cnpj}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                {nota.numero}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-gray-900 h-[52px]">
                {formatCurrency(nota.total_value)}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm h-[52px]">
                {renderStatusBadge(nota.status)}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-gray-500 h-[52px]">
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAccessPDF(nota)}
                          className="text-xs text-secondary border-secondary hover:bg-secondary hover:text-white"
                        >
                          Acessar PDF
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Visualizar o PDF da nota fiscal</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </>
      );
    };

    return (
      <div className="overflow-hidden rounded-md border-none bg-white w-full">
        <Table className="w-full">
          <TableHeader className={loading ? "hidden" : ""}>
            <TableRow className="border-b border-gray-100">
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                {renderSortableHeader("Data de Emissão", "emission_date")}
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                {renderSortableHeader("CNPJ Prestador", "filCnpj")}
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                {renderSortableHeader("Número da Nota", "numero")}
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                {renderSortableHeader("Valor", "total_value")}
              </TableHead>
              <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                {renderSortableHeader("Status", "status")}
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
HistoricoTable.displayName = "HistoricoTable"; 