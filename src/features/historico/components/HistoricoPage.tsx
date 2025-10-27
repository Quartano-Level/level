'use client'

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/shared/components/ui/select"
import { Search, ChevronDown } from "lucide-react"
import { HistoricoTable } from "@/features/historico/components/HistoricoTable"
import { useHistoricoNotas } from "@/features/historico/hooks/useHistoricoNotas"
import { Pagination } from "@/shared/components/common/pagination"
import { NotaFiscal, NotaStatusEnum } from "../types"
import { useEffect, useState } from "react"

/**
 * Componente principal da página de notas fiscais
 */
export function HistoricoPage() {
  // Utilizar o hook para gerenciar o estado
  const {
    notas,
    loading,
    error,
    searchTerm,
    page,
    totalPages,
    handleSearch,
    handlePageChange,
    handleSort,
    getNotaPDF,
    sorting,
    fetchNotas
  } = useHistoricoNotas({ limit: 9 });

  const [sortField, setSortField] = useState("mais_recente");

  // *** CORREÇÃO PRINCIPAL: Handler correto para o input ***
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input value:', value); // Debug log
    handleSearch(value); // Passa apenas o valor, não o evento
  };

  // Adaptador para acessar PDF
  const handleAccessPDF = (nota: NotaFiscal) => {
    if (nota.qive_id) {
      getNotaPDF(nota);
    }
  };

  // Função para lidar com mudança de ordenação
  const handleSortChange = (value: string) => {
    setSortField(value);
    
    // Mapeamento dos valores do select para os campos reais da interface NotaFiscal
    const fieldMapping: Record<string, keyof NotaFiscal> = {
      "data_da_nota": "emission_date",
      "fornecedor": "filCnpj",
      "numero_de_nota": "numero", 
      "valor": "total_value",
      "status": "status",
      "mais_recente": "created_at"
    };
    
    const mappedField = fieldMapping[value];
    
    if (mappedField) {
      handleSort(mappedField);
    }
  };

  // Efeito para monitorar erros e recarregar se necessário
  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar notas:", error);
    }
  }, [error]);

  // Debug: log dos estados principais para inspecionar por que nada aparece
  useEffect(() => {
    console.log('HistoricoPage state:', { notas, loading, error, page, totalPages, searchTerm });
  }, [notas, loading, error, page, totalPages, searchTerm]);

  return (
    <div className="w-full flex flex-col h-screen pt-12 pl-6 pr-16 pb-10 gap-6 overflow-hidden">
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="flex flex-col gap-2 flex-1 overflow-hidden rounded-lg">
          <h2 className="text-xl font-medium text-secondary mx-4 mt-4">
            Notas fiscais
          </h2>
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Pesquisar por fornecedor"
                className="pl-12 min-w-[275px] h-9 py-5 bg-white rounded-[17px] border border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchInput} // *** CORREÇÃO: Usar o handler correto ***
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
                    { label: "Data da nota", value: "data_da_nota" },
                    { label: "Fornecedor", value: "fornecedor" },
                    { label: "Numero de nota", value: "numero_de_nota" },
                    { label: "Valor", value: "valor" },
                    { label: "Status", value: "status" },
                    { label: "Mais recente", value: "mais_recente" }
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
                onAccessPDF={handleAccessPDF}
                onSort={handleSort}
                sorting={sorting}
              />
            </div>

            {!loading && notas && notas.length > 0 && totalPages > 1 && (
              <div className="mt-2 mb-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </div>
            )}

            {!loading && notas && notas.length === 0 && !error && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 
                  `Nenhuma nota fiscal encontrada para "${searchTerm}".` : 
                  "Nenhuma nota fiscal encontrada."
                }
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-4 text-red-500">
                Ocorreu um erro ao carregar as notas fiscais. 
                <Button 
                  variant="link" 
                  className="text-primary ml-2"
                  onClick={() => fetchNotas({ limit: 9, status: NotaStatusEnum.COMPLETA })}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}