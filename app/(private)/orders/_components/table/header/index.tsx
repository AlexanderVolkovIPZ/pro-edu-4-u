import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ColumnsToSort = 'name' | 'status' | 'createdAt';

type HeaderProps = {
  onSort: (column: ColumnsToSort) => void;
  renderSortIcon: (column: ColumnsToSort) => JSX.Element;
};

const Header = ({ onSort, renderSortIcon }: HeaderProps) => {
  return (
    <TableHeader className='bg-gray-50'>
      <TableRow>
        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('name')}
          >
            Customer {renderSortIcon('name')}
          </div>
        </TableHead>

        <TableHead
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        >
          Contact
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'>
            Address
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'>
            Lot
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('createdAt')}
          >
            Status {renderSortIcon('status')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('createdAt')}
          >
            Date {renderSortIcon('createdAt')}
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
