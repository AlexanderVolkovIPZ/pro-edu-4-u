'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

type Columns = 'title' | 'startDate' | 'endDate' | 'lotCount' | 'bidCount' | 'createdAt';

type HeaderProps = {
  onSort: (column: Columns) => void;
  renderSortIcon: (column: Columns) => JSX.Element;
};

const Header = ({ onSort, renderSortIcon }: HeaderProps) => {
  const { t } = useTranslation();

  return (
    <TableHeader className='bg-gray-50'>
      <TableRow>
        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('title')}
          >
            {t('all_auctions.auction_title')} {renderSortIcon('title')}
          </div>
        </TableHead>

        <TableHead
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        >
          {t('all_auctions.status')}
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('startDate')}
          >
            {t('all_auctions.start_date')} {renderSortIcon('startDate')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('endDate')}
          >
            {t('all_auctions.end_date')} {renderSortIcon('endDate')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('lotCount')}
          >
            {t('all_auctions.lots')} {renderSortIcon('lotCount')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('bidCount')}
          >
            {t('all_auctions.bids')} {renderSortIcon('bidCount')}
          </div>
        </TableHead>

        <TableHead scope='col' className='relative px-6 py-3' />
      </TableRow>
    </TableHeader>
  );
};

export default Header;
