'use client'


import { NotaFiscal as BaseNotaFiscal, NotaStatusEnum } from '@/features/notas/types';

/**
 * Exporte os tipos da feature de notas para uso na feature de histórico
 */
export { NotaStatusEnum } from '@/features/notas/types';
export type { SortConfig, NotaActionConfig, NotasParams } from '@/features/notas/types';

/**
 * Define o histórico de status de uma nota fiscal
 */
export type NotaStatusHistory = {
    status: NotaStatusEnum;
    data: string;
    usuario: string;
    motivo?: string;
};

/**
 * Define uma nota fiscal com histórico para uso na feature de histórico
 */
export interface NotaFiscal extends BaseNotaFiscal {
    historico?: NotaStatusHistory[];
    dataAprovacao?: string;
    usuarioAprovador?: string;
} 