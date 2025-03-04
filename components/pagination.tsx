'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPageNumbers?: boolean;
  showSummary?: boolean;
  itemsPerPage?: number;
  totalItems?: number;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  size = 'md',
  showPageNumbers = true,
  showSummary = false,
  itemsPerPage,
  totalItems,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const buttonSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const generatePageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis1');
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis2');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {showSummary && itemsPerPage && totalItems && (
        <div className={cn('mr-4', textSizes[size])}>
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </div>
      )}

      <Button
        variant='outline'
        size='icon'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={buttonSizes[size]}
        aria-label='Previous page'
      >
        <ChevronLeft className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
      </Button>

      {showPageNumbers &&
        generatePageNumbers().map((page, index) => {
          if (page === 'ellipsis1' || page === 'ellipsis2') {
            return (
              <span key={`ellipsis-${index}`} className={cn('px-1', textSizes[size])}>
                ...
              </span>
            );
          }

          return (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? 'default' : 'outline'}
              size={size === 'lg' ? 'default' : 'sm'}
              onClick={() => onPageChange(Number(page))}
              className={cn('min-w-7', size === 'sm' && 'h-7 min-w-7', size === 'lg' && 'h-10 min-w-10')}
            >
              {page}
            </Button>
          );
        })}

      <Button
        variant='outline'
        size='icon'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={buttonSizes[size]}
        aria-label='Next page'
      >
        <ChevronRight className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
      </Button>
    </div>
  );
};

export default Pagination;
