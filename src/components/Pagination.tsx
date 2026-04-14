import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export default function Pagination({ currentPage, hasNextPage, onPageChange, loading }: PaginationProps) {
  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={currentPage <= 1 || loading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} /> Prev
      </button>
      <span className="page-info">Page {currentPage}</span>
      <button
        className="page-btn"
        disabled={!hasNextPage || loading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
