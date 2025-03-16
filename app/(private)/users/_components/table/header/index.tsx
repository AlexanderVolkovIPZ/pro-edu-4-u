import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ColumnsToSort = 'name' | 'createdAt' | 'verifiedAt';

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
            Name {renderSortIcon('name')}
          </div>
        </TableHead>

        <TableHead
          scope='col'
          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        >
          Email
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'>
            Role
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('createdAt')}
          >
            Created At {renderSortIcon('createdAt')}
          </div>
        </TableHead>

        <TableHead scope='col' className='px-6 py-3 text-left'>
          <div
            className='flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
            onClick={() => onSort('verifiedAt')}
          >
            Verified At {renderSortIcon('verifiedAt')}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default Header;
