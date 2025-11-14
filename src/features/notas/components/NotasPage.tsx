'use client'

import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { useState } from "react"
import { AlertTriangle, CheckCircle, ChevronDown, FileClock, Search, TextSearch, Calendar, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Pagination } from "@/shared/components/common/pagination"
import { NotaFiscal, NotaStatusEnum } from '../types'
import { useNotas } from "../hooks/useNotas"
import { NotasTable } from "./NotasTable"
import { ReprocessModal } from "./ReprocessModal"
import { Button } from "@/shared/components/ui/button"

export function NotasPage() {
  const {
    notas,
    counters,
    loading,
    activeFilter,
    searchTerm,
    tableRef,
    page,
    totalPages,
    startDate,
    endDate,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSort,
    handleAccessPDF,
    handleCorrectNota,
    handleStartDateChange,
    handleEndDateChange,
    handleApplyDateFilter,
    handleClearDateFilter,
    sorting
  } = useNotas();

  const [sortField, setSortField] = useState("mais_recente");
  const [reprocessingNota, setReprocessingNota] = useState<string | null>(null);

  const handleSortChange = (value: string) => {
    setSortField(value);
    
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
    } else {
      console.error("❌ Campo não encontrado no mapeamento para:", value);
    }
  };
  
  const handleReprocessNota = async (
    nota: NotaFiscal, 
    motivo: string = "Solicitação de reprocessamento", 
    processo?: string, 
    observacoes?: string,
    configDocCod?: number,
    contaProjetoCod?: number,
    gcdDesNome?: string
  ) => {
    if (reprocessingNota) return;
    
    setReprocessingNota(nota.numero.toString());
    
    try {
      await handleCorrectNota(nota, motivo, processo, observacoes, configDocCod, contaProjetoCod, gcdDesNome);
    } finally {
      setReprocessingNota(null);
    }
  };

  const [reprocessModalOpen, setReprocessModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [motivo, setMotivo] = useState<string>("Solicitação de reprocessamento");
  const [processo, setProcesso] = useState<string>("");

  const handleRequestReprocess = (nota: NotaFiscal) => {
    setSelectedNota(nota);
    setMotivo(nota.obs || "Solicitação de reprocessamento");
    setProcesso((nota as any).processo || "");
    setReprocessModalOpen(true);
  };

  const handleConfirmReprocess = async (configDocCod?: number, contaProjetoCod?: number, gcdDesNome?: string) => {
    if (!selectedNota) return;

    setReprocessModalOpen(false);

    await handleReprocessNota(selectedNota, motivo, processo, undefined, configDocCod, contaProjetoCod, gcdDesNome);
    setSelectedNota(null);
    setMotivo("Solicitação de reprocessamento");
    setProcesso("");
  };

  const countersDisplayMap: Record<string, { label: string; Icon: any }> = {
    TOTAL: { label: 'Todas as notas', Icon: TextSearch },
    PENDING: { label: 'Notas pendentes', Icon: TextSearch },
    PROCESSING: { label: 'Notas em processamento', Icon: FileClock },
    IDENTIFIED: { label: 'Notas identificadas', Icon: CheckCircle },
    SAVED: { label: 'Notas salvas', Icon: CheckCircle },
    ESCRITURADA: { label: 'Notas escrituradas', Icon: CheckCircle },
    FINALIZADA: { label: 'Notas finalizadas', Icon: CheckCircle },
    ERROR: { label: 'Notas com erro', Icon: AlertTriangle },
  };
  
  return (
    <div className="w-full flex flex-col min-h-0 pt-12 pl-6 pr-16 pb-10 gap-6">
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
        <h2 className="text-2xl font-semibold text-black">
          Panorama geral
        </h2>
        <div className="flex gap-3 flex-nowrap overflow-x-auto max-w-full pb-2">
          {
            Object.entries(counters || {}).map(([statusKey, qty]) => {
              const key = statusKey.toUpperCase() as NotaStatusEnum | 'TOTAL';
              const meta = countersDisplayMap[key];
              const Icon = meta?.Icon;
              const isActive = activeFilter === key || (activeFilter === null && key === 'TOTAL');

              return meta && (qty || key === 'TOTAL') ? (
                <Card
                  key={statusKey}
                  className={`px-5 py-3.5 flex flex-row cursor-pointer transition-colors duration-150 ${isActive ? 'bg-primary' : 'bg-white'}`}
                  onClick={() => handleFilterChange(key)}
                >
                  <div className={`${isActive ? 'bg-primary' : 'bg-primary/10'} p-3.5 rounded-lg`}> 
                    <Icon size={22} />
                  </div>
                  <div className="pl-3 pr-18">
                    <h3 className={`${isActive ? 'text-white' : 'text-secondary'} text-xl font-medium`}>{qty}</h3>
                    <h3 className={`${isActive ? 'text-white/90' : 'text-dark-gray'} text-sm text-nowrap`}>{meta.label}</h3>
                  </div>
                </Card>
              ) : null;
            })
          }
        </div>

        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden rounded-lg">
          <h2 className="text-xl font-medium text-secondary mx-4 mt-4">
            Notas fiscais
          </h2>
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex gap-3">
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

              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                />
                <Input
                  type="date"
                  placeholder="Data inicial"
                  className="pl-10 w-[165px] h-9 py-5 bg-white rounded-[17px] border border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>

              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                />
                <Input
                  type="date"
                  placeholder="Data final"
                  className="pl-10 w-[165px] h-9 py-5 bg-white rounded-[17px] border border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
              </div>

              <Button
                onClick={handleApplyDateFilter}
                disabled={loading}
                className="h-9 px-4 bg-primary text-white rounded-[17px] hover:bg-primary/90 transition-colors"
              >
                Filtrar
              </Button>

              {(startDate || endDate) && (
                <Button
                  onClick={handleClearDateFilter}
                  disabled={loading}
                  variant="outline"
                  className="h-9 px-3 bg-white rounded-[17px] border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                </Button>
              )}
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

          <div className="flex-1 bg-white rounded-lg relative flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <NotasTable
                ref={tableRef}
                notas={notas || []}
                loading={loading}
                onAccessPDF={handleAccessPDF}
                onRequestReprocess={handleRequestReprocess}
                onSort={handleSort}
                sorting={sorting}
                reprocessingNotaId={reprocessingNota}
              />
            </div>
            
            {!loading && notas && 
             Array.isArray(notas) && 
             notas.length > 0 && 
             !(notas.length === 1 && Object.keys(notas[0]).length === 0) && 
             totalPages > 1 && (
               <div className="mt-2 mb-4 bg-white border-t border-gray-100 shadow-[0_-5px_5px_-5px_rgba(0,0,0,0.1)]">
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

      <ReprocessModal
        open={reprocessModalOpen}
        onOpenChange={setReprocessModalOpen}
        nota={selectedNota}
        motivo={motivo}
        processo={processo}
        onMotivoChange={setMotivo}
        onProcessoChange={setProcesso}
        onConfirm={handleConfirmReprocess}
        isLoading={reprocessingNota !== null}
      />
    </div>
  );
}