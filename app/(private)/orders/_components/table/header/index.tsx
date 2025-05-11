'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

type ColumnsToSort = 'name' | 'status' | 'createdAt';

type HeaderProps = {
  onSort: (column: ColumnsToSort) => void;
  renderSortIcon: (column: ColumnsToSort) => JSX.Element;
};

const Header = ({ onSort, renderSortIcon }: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <TableHeader className='bg-gray-50'>
      <TableRow>
        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('name')}
          >
            {t('orders.customer')} {renderSortIcon('name')}
          </div>
        </TableHead>

        <TableHead
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        >
          {t('orders.contact')}
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'>
            {t('orders.address')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'>
            {t('orders.lot')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('createdAt')}
          >
            {t('orders.status')} {renderSortIcon('status')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('createdAt')}
          >
            {t('orders.date')} {renderSortIcon('createdAt')}
          </div>
        </TableHead>

        <TableHead scope='col' className='relative px-6 py-3' />
      </TableRow>
    </TableHeader>
  );
};

export default Header;
