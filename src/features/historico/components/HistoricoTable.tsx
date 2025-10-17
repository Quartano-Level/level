import { forwardRef, useImperativeHandle } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { HistoricoNota } from '../types';

interface HistoricoTableProps {
  notas: HistoricoNota[];
  loading: boolean;
  onSort: (field: keyof HistoricoNota) => void;
  sorting: { field: keyof HistoricoNota | null; direction: 'asc' | 'desc'; };
}

export type HistoricoTableRef = {
  handleFilterChange: (filter: string | null) => void;
  handleSearch: (term: string) => void;
};

const FIXED_ROW_COUNT = 9;

export const HistoricoTable = forwardRef<HistoricoTableRef, HistoricoTableProps>(
  ({ notas, loading, onSort, sorting }, ref) => {
    useImperativeHandle(ref, () => ({
      handleFilterChange: (filter: string | null) => { console.log('Filtro:', filter); },
      handleSearch: (term: string) => { console.log('Busca:', term); }
    }));

    const renderSortableHeader = (label: string, field: keyof HistoricoNota) => {
      const isSorted = sorting.field === field;
      const sortIcon = isSorted && sorting.direction === 'asc' ? '' : '';
      return (
        <div className='flex items-center cursor-pointer hover:text-gray-900' onClick={() => onSort(field)}>
          {label} {isSorted && <span className='ml-1'>{sortIcon}</span>}
        </div>
      );
    };

    const renderStatusBadge = (status: string) => {
      const statusUpper = status.toUpperCase();
      switch(statusUpper) {
        case 'COMPLETED': return <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Concluída</Badge>;
        case 'ESCRITURADA': return <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>Escriturada</Badge>;
        case 'PENDENTE': return <Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>Pendente</Badge>;
        case 'ERROR': return <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>Erro</Badge>;
        default: return <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-100'>{status}</Badge>;
      }
    };

    const formatDate = (dateString: string | null) => {
      if (!dateString) return '-';
      try { return new Date(dateString).toLocaleDateString('pt-BR'); } catch { return '-'; }
    };

    const formatCNPJ = (cnpj: string) => {
      if (!cnpj) return '-';
      // Remove caracteres não numéricos
      const cleaned = cnpj.replace(/\D/g, '');
      // Formata no padrão 00.000.000/0000-00
      if (cleaned.length === 14) {
        return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      }
      // Se não tiver 14 dígitos, retorna o original
      return cnpj;
    };

    const truncateText = (text: string | null, maxLength: number = 50) => {
      if (!text) return '-';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    const renderTableContent = () => {
      if (loading) {
        return (
          <TableRow>
            <TableCell colSpan={6} className='text-center py-12'>
              <div className='flex flex-col justify-center items-center'>
                <span className='text-gray-500 font-medium'>Carregando histórico...</span>
              </div>
            </TableCell>
          </TableRow>
        );
      }

      if (notas.length === 0) {
        return (
          <TableRow className='h-[52px]'>
            <TableCell colSpan={6} className='py-6 text-center text-gray-500'>
              Nenhuma nota fiscal encontrada.
            </TableCell>
          </TableRow>
        );
      }

      return notas.map((nota, index) => (
        <TableRow key={nota.id_metrica + '-' + index} className='hover:bg-gray-50 h-[52px] border-b border-gray-100'>
          <TableCell className='py-4 px-6 text-sm text-gray-900 font-medium'>{nota.numero}</TableCell>
          <TableCell className='py-4 px-6 text-sm'>{renderStatusBadge(nota.status)}</TableCell>
          <TableCell className='py-4 px-6 text-sm text-gray-900'>{formatDate(nota.emission_date)}</TableCell>
          <TableCell className='py-4 px-6 text-sm text-gray-900'>{formatDate(nota.created_at)}</TableCell>
          <TableCell className='py-4 px-6 text-sm text-gray-900'>{formatCNPJ(nota.counterparty_cnpj)}</TableCell>
          <TableCell className='py-4 px-6 text-sm text-gray-500'>
            <div className='max-w-xs' title={nota.obs || ''}>{truncateText(nota.obs, 40)}</div>
          </TableCell>
        </TableRow>
      ));
    };

    return (
      <div className='overflow-hidden rounded-md border-none bg-white w-full'>
        <Table className='w-full'>
          <TableHeader className={loading ? 'hidden' : ''}>
            <TableRow className='border-b border-gray-100'>
              <TableHead className='py-4 px-6 text-sm font-medium text-gray-600'>{renderSortableHeader('Número', 'numero')}</TableHead>
              <TableHead className='py-4 px-6 text-sm font-medium text-gray-600'>{renderSortableHeader('Status', 'status')}</TableHead>
              <TableHead className='py-4 px-6 text-sm font-medium text-gray-600'>{renderSortableHeader('Data Emissão', 'emission_date')}</TableHead>
              <TableHead className='py-4 px-6 text-sm font-medium text-gray-600'>{renderSortableHeader('Data Criação', 'created_at')}</TableHead>
              <TableHead className='py-4 px-6 text-sm font-medium text-gray-600'>{renderSortableHeader('CNPJ Contraparte', 'counterparty_cnpj')}</TableHead>
              <TableHead className='py-4 px-6 text-sm font-medium text-gray-600'>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='bg-white'>{renderTableContent()}</TableBody>
        </Table>
      </div>
    );
  }
);

HistoricoTable.displayName = 'HistoricoTable';