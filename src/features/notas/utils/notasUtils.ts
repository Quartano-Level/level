import { NotaStatusEnum } from '../types';

/**
 * Função helper para determinar o parâmetro de status baseado no filtro
 */
export const getStatusParam = (filter: string | null): NotaStatusEnum | undefined => {
  if (filter === 'pendente') return NotaStatusEnum.PENDENTE;
  if (filter === 'em_processamento') return NotaStatusEnum.EM_PROCESSAMENTO;
  return undefined;
};

/**
 * Função helper para verificar se os dados de notas são válidos
 */
export const isValidNotasData = (data: any[]): boolean => {
  return data.length > 0 && !(data.length === 1 && Object.keys(data[0]).length === 0);
};

/**
 * Função para formatar valor monetário em reais
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Função para verificar se uma nota fiscal é válida
 */
export const isValidNota = (nota: any): boolean => {
  return Boolean(nota?.id);
};

/**
 * Função para verificar se os dados estão vazios
 */
export const isEmptyData = (notas: any[]): boolean => {
  return !notas || notas.length === 0 || (notas.length === 1 && Object.keys(notas[0]).length === 0);
};

/**
 * Configurações de status para badges
 */
export const getStatusConfig = (status: string) => {
  switch(status) {
    case "pendente":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendente" };
    case "em_processamento":
      return { bg: "bg-blue-100", text: "text-blue-800", label: "Em processamento" };
    case "aprovado":
      return { bg: "bg-green-100", text: "text-green-800", label: "Aprovado" };
    case "recusado":
    case "reprovado":
    case "rejeitado":
      return { bg: "bg-red-100", text: "text-red-800", label: "Recusado" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
}; 