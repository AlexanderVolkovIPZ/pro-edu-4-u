import { AuctionFiltering } from '../_shared/types';
import FilterMenu from './filter-menu';

const Header = ({ data, isFetched, onChangeFilters }: AuctionFiltering) => {
  return (
    <div className='flex items-center justify-between'>
      <h5 className='text-rose-500 text-3xl font-bold'>Auctions</h5>
      <FilterMenu data={data} isFetched={isFetched} onChangeFilters={onChangeFilters} />
    </div>
  );
};

export default Header;
