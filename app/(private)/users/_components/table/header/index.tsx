'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

type ColumnsToSort = 'name' | 'createdAt' | 'verifiedAt';

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
            {t('users.name')} {renderSortIcon('name')}
          </div>
        </TableHead>

        <TableHead
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        >
          {t('users.email')}
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'>
            {t('users.role')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('createdAt')}
          >
            {t('users.created_at')} {renderSortIcon('createdAt')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('verifiedAt')}
          >
            {t('users.verified_at')} {renderSortIcon('verifiedAt')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left' />
      </TableRow>
    </TableHeader>
  );
};

export default Header;
