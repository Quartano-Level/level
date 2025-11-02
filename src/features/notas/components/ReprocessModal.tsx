'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { useState, useEffect } from "react"
import { NotaFiscal, ConfigDocContaProjetoResponse, ConfigDocumento } from "../types"
import { formatCurrency, getStatusConfig } from "../utils/notasUtils"
import axios from "axios"
import { useAuth } from "@/features/auth/hooks/useAuth"

interface ReprocessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nota: NotaFiscal | null
  motivo: string
  processo: string
  onMotivoChange: (motivo: string) => void
  onProcessoChange: (processo: string) => void
  onConfirm: (configDocCod?: number, contaProjetoCod?: number, gcdDesNome?: string) => void
  isLoading?: boolean
}

const CONFIG_DOC_API_URL = 'https://level-nfse.app.n8n.cloud/webhook/get-config-doc-e-conta-de-projeto';

/**
 * Componente de modal para reprocessamento de nota fiscal
 */
export function ReprocessModal({
  open,
  onOpenChange,
  nota,
  motivo,
  processo,
  onMotivoChange,
  onProcessoChange,
  onConfirm,
  isLoading = false
}: ReprocessModalProps) {
  const [showConfigDoc, setShowConfigDoc] = useState(false);
  const [configDocs, setConfigDocs] = useState<ConfigDocumento[]>([]);
  const [loadingConfigDocs, setLoadingConfigDocs] = useState(false);
  const [selectedConfigDocCod, setSelectedConfigDocCod] = useState<number | null>(null);
  const [selectedContaProjetoCod, setSelectedContaProjetoCod] = useState<number | null>(null);
  const { getAuthToken } = useAuth();

  // Resetar quando o modal fechar
  useEffect(() => {
    if (!open) {
      setShowConfigDoc(false);
      setSelectedConfigDocCod(null);
      setSelectedContaProjetoCod(null);
    }
  }, [open]);

  // Retornar null APÓS todos os hooks serem declarados
  if (!nota) return null;

  const statusConfig = getStatusConfig(nota.status);

  // Buscar configurações de documento quando o botão for clicado
  const handleLoadConfigDocs = async () => {
    if (!nota?.numero) return;

    setLoadingConfigDocs(true);
    try {
      const token = getAuthToken();
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      const response = await axios.get<ConfigDocContaProjetoResponse>(
        `${CONFIG_DOC_API_URL}?numero=${nota.numero}`,
        { headers }
      );

      // A resposta agora já vem no formato correto, não precisa agrupar
      setConfigDocs(response.data);
      setShowConfigDoc(true);
    } catch (error) {
      console.error('Erro ao buscar configurações de documento:', error);
    } finally {
      setLoadingConfigDocs(false);
    }
  };

  // Resetar seleções quando fechar a seção
  const handleToggleConfigDoc = () => {
    if (showConfigDoc) {
      setShowConfigDoc(false);
      setSelectedConfigDocCod(null);
      setSelectedContaProjetoCod(null);
    } else {
      handleLoadConfigDocs();
    }
  };

  const selectedConfigDoc = configDocs.find(cd => cd.gcdCod === selectedConfigDocCod);
  const availableContasProjeto = selectedConfigDoc?.contas_de_projeto || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] !max-w-[80vw] sm:!max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reprocessar nota {nota.numero}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-8 py-6">
          {/* Campos editáveis */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="motivo" className="text-sm font-medium">Motivo</Label>
              <Input 
                id="motivo"
                value={motivo} 
                readOnly
                disabled
                className="w-full h-10 bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="processo" className="text-sm font-medium">Processo</Label>
              <Input 
                id="processo"
                value={processo} 
                onChange={(e) => onProcessoChange(e.target.value)} 
                placeholder="Informe o processo"
                className="w-full h-10"
              />
            </div>

            {/* Botão para Configuração de Documento */}
            <div className="space-y-3">
              <Button
                type="button"
                variant={showConfigDoc ? "default" : "outline"}
                onClick={handleToggleConfigDoc}
                disabled={loadingConfigDocs || isLoading}
                className="w-full"
              >
                {loadingConfigDocs ? 'Carregando...' : showConfigDoc ? 'Ocultar Configuração de Documento' : 'Configuração de Documento'}
              </Button>
            </div>

            {/* Seção de Configuração de Documento e Conta de Projeto */}
            {showConfigDoc && (
              <div className="space-y-6 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-3">
                  <Label htmlFor="configDoc" className="text-sm font-medium">Configuração de Documento</Label>
                  <Select
                    value={selectedConfigDocCod?.toString() || ""}
                    onValueChange={(value) => {
                      setSelectedConfigDocCod(parseInt(value));
                      setSelectedContaProjetoCod(null); // Resetar conta de projeto ao mudar config
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="configDoc" className="w-full h-10">
                      <SelectValue placeholder="Selecione a configuração de documento" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      {configDocs.map((configDoc) => {
                        const displayName = configDoc.gcdDesNome || `Configuração ${configDoc.gcdCod}`;
                        // Pegar o primeiro filCod das contas de projeto para exibir
                        const filCod = configDoc.contas_de_projeto[0]?.filCod || '-';
                        return (
                          <SelectItem 
                            key={configDoc.gcdCod} 
                            value={configDoc.gcdCod.toString()} 
                            className="bg-white hover:bg-gray-100"
                            textValue={displayName}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{displayName}</span>
                              <span className="text-xs text-gray-500">Cód. Filial: {filCod}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedConfigDocCod && (
                  <div className="space-y-3">
                    <Label htmlFor="contaProjeto" className="text-sm font-medium">Conta de Projeto</Label>
                    <Select
                      value={selectedContaProjetoCod?.toString() || ""}
                      onValueChange={(value) => setSelectedContaProjetoCod(parseInt(value))}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="contaProjeto" className="w-full h-10">
                        <SelectValue placeholder="Selecione a conta de projeto" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg">
                        {availableContasProjeto.map((conta) => (
                          <SelectItem key={conta.ctpCod} value={conta.ctpCod.toString()} className="bg-white hover:bg-gray-100">
                            {conta.ctpDesNome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Informações da nota - somente leitura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {/* Número da Nota */}
            <div className="flex flex-col space-y-3 p-5 border rounded-lg bg-muted">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Número da Nota</span>
              <span className="text-base text-gray-800 font-semibold">{nota.numero ?? '-'}</span>
            </div>

            {/* Status */}
            <div className="flex flex-col space-y-3 p-5 border rounded-lg bg-muted">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium w-fit ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>

            {/* Tentativas */}
            <div className="flex flex-col space-y-3 p-5 border rounded-lg bg-muted">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tentativas</span>
              <span className="text-base text-gray-800 font-semibold">{nota.attempts ?? '-'}</span>
            </div>

            {/* CNPJ Prestador */}
            <div className="flex flex-col space-y-3 p-5 border rounded-lg bg-muted">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">CNPJ Prestador</span>
              <span className="text-base text-gray-800 break-words">{nota.counterparty_cnpj ?? '-'}</span>
            </div>

            {/* Código da Filial */}
            <div className="flex flex-col space-y-3 p-5 border rounded-lg bg-muted">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Código da Filial</span>
              <span className="text-base text-gray-800 font-semibold">{nota.filcod ?? '-'}</span>
            </div>

            {/* Valor */}
            <div className="flex flex-col space-y-3 p-5 border rounded-lg bg-muted">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Valor</span>
              <span className="text-base text-gray-800 font-semibold">
                {nota.total_value ? formatCurrency(nota.total_value) : '-'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6">
          <div className="flex gap-3 w-full justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                const selected = configDocs.find(cd => cd.gcdCod === selectedConfigDocCod);
                onConfirm(
                  selectedConfigDocCod || undefined, 
                  selectedContaProjetoCod || undefined,
                  selected?.gcdDesNome || undefined
                );
              }} 
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Confirmar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

