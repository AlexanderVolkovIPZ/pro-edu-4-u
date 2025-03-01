import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Columns = 'title' | 'startDate' | 'endDate' | 'lotCount' | 'bidCount' | 'createdAt';

type HeaderProps = {
  onSort: (column: Columns) => void;
  renderSortIcon: (column: Columns) => JSX.Element;
};

const Header = ({ onSort, renderSortIcon }: HeaderProps) => {
  return (
    <TableHeader className='bg-gray-50'>
      <TableRow>
        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('title')}
          >
            Auction Title {renderSortIcon('title')}
          </div>
        </TableHead>

        <TableHead
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        >
          Status
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('startDate')}
          >
            Start Date {renderSortIcon('startDate')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('endDate')}
          >
            End Date {renderSortIcon('endDate')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('lotCount')}
          >
            Lots {renderSortIcon('lotCount')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('bidCount')}
          >
            Bids {renderSortIcon('bidCount')}
          </div>
        </TableHead>

        <TableHead scope='col' className='relative px-6 py-3'>
          <span className='sr-only'>Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default Header;
