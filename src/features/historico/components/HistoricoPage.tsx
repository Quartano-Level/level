'use client'

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/shared/components/ui/select"
import { Search, ChevronDown, RefreshCw } from "lucide-react"
import { HistoricoTable } from "@/features/historico/components/HistoricoTable"
import { useHistoricoNotas } from "@/features/historico/hooks/useHistoricoNotas"
import { Pagination } from "@/shared/components/common/pagination"
import { HistoricoNota } from "../types"
import { useState } from "react"

/**
 * Componente principal da página de histórico de notas fiscais
 */
export function HistoricoPage() {
  const {
    notas,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    searchTerm,
    sortConfig,
    handleSearch,
    handleSort,
    handlePageChange,
    reload
  } = useHistoricoNotas();

  const [sortField, setSortField] = useState("mais_recente");

  /**
   * Handler para mudança no input de busca
   */
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleSearch(value);
  };

  /**
   * Handler para mudança de ordenação no select
   */
  const handleSortChange = (value: string) => {
    setSortField(value);
    
    // Mapeamento dos valores do select para os campos da interface
    const fieldMapping: Record<string, keyof HistoricoNota> = {
      "numero": "numero",
      "status": "status",
      "data_emissao": "emission_date",
      "data_criacao": "created_at",
      "cnpj": "counterparty_cnpj",
      "mais_recente": "created_at"
    };
    
    const mappedField = fieldMapping[value];
    
    if (mappedField) {
      handleSort(mappedField);
    }
  };

  return (
    <div className="w-full flex flex-col h-screen pt-12 pl-6 pr-16 pb-10 gap-6 overflow-hidden">
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="flex flex-col gap-2 flex-1 overflow-hidden rounded-lg">
          <div className="flex items-center justify-between mx-4 mt-4">
            <h2 className="text-xl font-medium text-secondary">
              Histórico de Notas Fiscais
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Recarregar
            </Button>
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Pesquisar por número, CNPJ ou observação"
                className="pl-12 min-w-[350px] h-9 py-5 bg-white rounded-[17px] border border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchInput}
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-5 rounded-lg">
              <span className="text-[#B7B7B7] text-sm font-medium">Ordenar por:</span>
              <Select 
                value={sortField} 
                onValueChange={handleSortChange}
                disabled={loading}
              >
                <SelectTrigger
                  className="w-[180px] h-9 rounded-2xl bg-white flex items-center justify-between px-3 data-[placeholder]:text-[#B7B7B7] text-[#B7B7B7]"
                >
                  <SelectValue className="text-sm" />
                  <ChevronDown size={18} className="text-[#B7B7B7]" />
                </SelectTrigger>

                <SelectContent
                  className="w-[180px] bg-white rounded-lg shadow-lg border"
                >
                  {[
                    { label: "Número", value: "numero" },
                    { label: "Status", value: "status" },
                    { label: "Data de Emissão", value: "data_emissao" },
                    { label: "Data de Criação", value: "data_criacao" },
                    { label: "CNPJ", value: "cnpj" },
                    { label: "Mais Recente", value: "mais_recente" }
                  ].map((field) => (
                    <SelectItem
                      key={field.value}
                      value={field.value}
                      className="text-[#B7B7B7] text-sm px-3 py-2 hover:bg-primary data-[highlighted]:text-secondary data-[state=checked]:text-secondary data-[state=checked]:font-semibold data-[state=checked]:bg-muted"
                    >
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-auto h-full flex flex-col scrollbar-hide bg-white rounded-lg">
            <div className="flex-1">
              <HistoricoTable
                notas={notas}
                loading={loading}
                onSort={handleSort}
                sorting={sortConfig}
              />
            </div>

            {!loading && notas.length > 0 && totalPages > 1 && (
              <div className="mt-2 mb-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </div>
            )}

            {!loading && notas.length === 0 && !error && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 
                  `Nenhuma nota fiscal encontrada para "${searchTerm}".` : 
                  "Nenhuma nota fiscal encontrada."
                }
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-4 text-red-500">
                Ocorreu um erro ao carregar o histórico: {error}
                <Button 
                  variant="link" 
                  className="text-primary ml-2"
                  onClick={reload}
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {!loading && !error && totalItems > 0 && (
              <div className="text-center py-2 text-sm text-gray-500">
                Exibindo {notas.length} de {totalItems} notas fiscais
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}