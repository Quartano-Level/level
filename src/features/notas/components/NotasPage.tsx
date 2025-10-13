'use client'

import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { useState } from "react"
import { ChevronDown, FileClock, Search, TextSearch } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Pagination } from "@/shared/components/common/pagination"
import { NotaFiscal } from '../types'
import { useNotas } from "../hooks/useNotas"
import { NotasTable } from "./NotasTable"

/**
 * Componente principal da página de notas fiscais
 */
export function NotasPage() {
  // Utilizar o hook para gerenciar o estado
  const {
    notas,
    counters,
    loading,
    activeFilter,
    searchTerm,
    tableRef,
    page,
    totalPages,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
    handleAccessPDF,
    handleCorrectNota,
    sorting
  } = useNotas();

  const [sortField, setSortField] = useState("mais_recente");

  const handleSortChange = (value: string) => {
    setSortField(value);
    
    // Mapeamento dos valores do select para os campos reais da interface NotaFiscal
    const fieldMapping: Record<string, keyof NotaFiscal> = {
      "data_da_nota": "data_emissao",
      "fornecedor": "cnpj_prestador",
      "numero_de_nota": "numero_nf",
      "valor": "valor_total",
      "status": "status",
      "mais_recente": "created_at"
    };
    
    const mappedField = fieldMapping[value];
    
    if (mappedField) {
      handleSort(mappedField);
    } else {
      console.error("❌ Campo não encontrado no mapeamento para:", value);
    }
  };
  
  // Função para reprocessar a nota fiscal
  const handleReprocessNota = (nota: NotaFiscal) => {
    handleCorrectNota(nota, "Solicitação de reprocessamento");
  };
  
  return (
    <div className="w-full flex flex-col h-screen pt-12 pl-6 pr-16 pb-10 gap-6 overflow-hidden">
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <h2 className="text-2xl font-semibold text-black">
          Panorama geral
        </h2>
        <div className="flex gap-3">
          <Card className="w-fit px-5 py-3.5 flex flex-row">
            <div className="bg-primary p-3.5 rounded-lg">
              <TextSearch size={22} />
            </div>
            <div className="pr-18">
              <h3 className="text-secondary text-xl font-medium">
                {counters.pendentes}
              </h3>
              <h3 className="text-dark-gray text-sm">
                Notas pendentes
              </h3>
            </div>
          </Card>
          <Card className="w-fit px-5 py-3.5 flex flex-row">
            <div className="bg-primary p-3.5 rounded-lg">
              <FileClock size={22} />
            </div>
            <div className="pr-18">
              <h3 className="text-secondary text-xl font-medium">
                {counters.emProcessamento}
              </h3>
              <h3 className="text-dark-gray text-sm">
                Notas em processamento
              </h3>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-2 flex-1 overflow-hidden rounded-lg">
          <h2 className="text-xl font-medium text-secondary mx-4 mt-4">
            Notas fiscais
          </h2>
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex gap-7">
              <div className="flex gap-5">
                <Button 
                  className={`text-sm font-normal rounded-3xl px-5 py-3.5 border border-secondary ${activeFilter === null ? 'bg-secondary text-white' : 'bg-transparent text-secondary'}`}
                  onClick={() => handleFilterChange(null)}
                >
                  Todas
                </Button>
                <Button 
                  className={`text-sm font-normal rounded-3xl px-5 py-3.5 border border-secondary ${activeFilter === 'pendente' ? 'bg-secondary text-white' : 'bg-transparent text-secondary'}`}
                  onClick={() => handleFilterChange('pendente')}
                >
                  Somente pendentes
                </Button>
                <Button 
                  className={`text-sm font-normal rounded-3xl px-5 py-3.5 border border-secondary ${activeFilter === 'em_processamento' ? 'bg-secondary text-white' : 'bg-transparent text-secondary'}`}
                  onClick={() => handleFilterChange('em_processamento')}
                >
                  Somente em processamento
                </Button>
              </div>
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
                  onChange={handleSearch}
                />
              </div>
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
              <NotasTable 
                ref={tableRef}
                notas={notas || []}
                loading={loading}
                onAccessPDF={handleAccessPDF}
                onCorrect={handleReprocessNota}
                onSort={handleSort}
                sorting={sorting}
              />
            </div>
            
            {!loading && notas && 
             Array.isArray(notas) && 
             notas.length > 0 && 
             !(notas.length === 1 && Object.keys(notas[0]).length === 0) && 
             totalPages > 1 && (
              <div className="mt-2 mb-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 