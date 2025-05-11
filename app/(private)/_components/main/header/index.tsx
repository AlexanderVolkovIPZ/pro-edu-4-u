'use client';

import { useTranslation } from 'react-i18next';
import { AuctionFiltering } from '../_shared/types';
import FilterMenu from './filter-menu';

const Header = ({ data, isFetched, onChangeFilters }: AuctionFiltering) => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>{t('main.auctions')}</h5>
      <FilterMenu data={data} isFetched={isFetched} onChangeFilters={onChangeFilters} />
    </div>
  );
};

export default Header;
