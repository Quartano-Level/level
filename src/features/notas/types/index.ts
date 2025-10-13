
/**
 * Representa uma nota fiscal no sistema
 */
export interface NotaFiscal {
    id: string;
    numero_nf: number;
    cnpj_prestador: string;
    data_emissao: string;
    valor_total: number;
    item_lista_serv?: string;
    discriminacao?: string;
    pricod?: string;
    status: NotaStatusEnum;
    /** Compatibilidade: algumas respostas trazem um único campo de motivo */
    motivos_pendencia?: string;
    attempt_count?: number;
    next_retry?: string | null;
    is_reprocessing?: boolean;
    xml_path?: string;
    pdf_path?: string;
    xml_hash?: string;
    pdf_hash?: string;
    created_at?: string;
    updated_at?: string;
    qive_id?: string;
}

/**
 * Parâmetros para busca de notas fiscais
 */
export interface NotasParams {
    page?: number;
    limit?: number;
    status?: NotaStatusEnum;
    fornecedor?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Configuração de ordenação
 */
export interface SortConfig {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
}

/**
 * Ação de uma nota fiscal
 */
export interface NotaActionConfig {
    label: string;
    onClick: (nota: NotaFiscal) => void;
    className?: string;
}

/**
 * Enum para os status possíveis de uma nota fiscal
 */
export enum NotaStatusEnum {
    PENDENTE = 'pendente',
    EM_PROCESSAMENTO = 'em_processamento',
    APROVADO = 'aprovado',
    RECUSADO = 'recusado'
}
