import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableFooter, TableRow } from '@/components/ui/table';

type FooterProps = {
  page: number;
  perPageCount: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  entitiesName: string;
  setPage: (page: number) => void;
};

const Footer = ({ page, perPageCount, entitiesName, setPage, totalPages, totalCount, isLoading }: FooterProps) => {
  return (
    <TableFooter>
      <TableRow className='w-full bg-white hover:bg-white'>
        {isLoading ? (
          <TableCell colSpan={100}>
            <div className='flex items-center justify-between px-4 sm:px-2'>
              <Skeleton className='h-5 max-w-32 w-full' />
              <Skeleton className='h-5 max-w-32 w-full' />
            </div>
          </TableCell>
        ) : (
          <TableCell colSpan={100} className='p-0'>
            <div className='flex items-center justify-between px-4 py-3 sm:px-6'>
              <div className='flex space-x-2 sm:hidden'>
                <Button variant='outline' onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>

              <p className='hidden sm:block text-sm text-gray-700'>
                Showing <span className='font-medium'>{totalCount ? (page - 1) * perPageCount + 1 : 0}</span> to{' '}
                <span className='font-medium'>{Math.min(page * perPageCount, totalCount)}</span> of{' '}
                <span className='font-medium'>{totalCount}</span> {entitiesName}
              </p>

              <nav className='hidden sm:block' aria-label='Pagination'>
                <div className='flex items-center space-x-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-l-md'
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>

                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-r-md'
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            </div>
          </TableCell>
        )}
      </TableRow>
    </TableFooter>
  );
};

export default Footer;
