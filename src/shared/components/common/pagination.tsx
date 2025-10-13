import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

/**
 * Componente de paginação para a tabelas
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false
}: PaginationProps) {
  // Não mostrar paginação se houver apenas uma página
  if (totalPages <= 1) return null;

  // Calcular range de páginas para exibir
  const getPageNumbers = () => {
    const delta = 1; // Número de páginas a mostrar antes e depois da atual
    const range = [];
    
    const rangeWithDots = [];
    let l;
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
    
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    
    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>
      
      {getPageNumbers().map((pageNumber, index) => {
        if (pageNumber === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          );
        }
        
        const pageNum = pageNumber as number;
        
        return (
          <Button
            key={`page-${pageNum}`}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            {pageNum}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima página</span>
      </Button>
    </div>
  );
} 