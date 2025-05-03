'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ListFilter, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { AuctionFiltering, PriceRange } from '../../_shared/types';

const FilterMenu = ({ data, isFetched, onChangeFilters }: AuctionFiltering) => {
  const {
    maxLotPriceExisted,
    minLotPriceExisted,
    maxLotPriceSelected,
    minLotPriceSelected,
    lotCategoriesExistedNames,
    lotCategoriesSelectedNames,
  } = data;

  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<{
    priceRange: PriceRange;
    categories: string[] | undefined;
  }>({
    priceRange: {
      minPrice: minLotPriceSelected,
      maxPrice: maxLotPriceSelected,
    },
    categories: lotCategoriesSelectedNames,
  });

  const onPriceRangeChange = (value: number[]) =>
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        minPrice: Math.min(...value),
        maxPrice: Math.max(...value),
      },
    }));

  const onPriceInputChange = (type: 'minPrice' | 'maxPrice', value: string) =>
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value ? Number(value) : undefined,
      },
    }));

  const onCategoryChange = (category: string, checked: boolean) =>
    setFilters((prev) => ({
      ...prev,
      categories: checked ? [...(prev.categories || []), category] : prev.categories?.filter((cat) => cat !== category),
    }));

  const onApplyFilters = () => {
    onChangeFilters({
      priceRange: filters.priceRange,
      categories: filters.categories?.length ? JSON.stringify(filters.categories) : undefined,
    });
    setOpen(false);
  };

  const onResetFilters = () => {
    const defaultFilters = {
      priceRange: {
        minPrice: undefined,
        maxPrice: undefined,
      },
      categories: undefined,
    };
    setFilters({
      priceRange: defaultFilters.priceRange,
      categories: [],
    });
    onChangeFilters(defaultFilters);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='link' className='hover:text-rose-500 transition-all' disabled={!isFetched}>
          <ListFilter className='w-6 h-6' />
        </Button>
      </DropdownMenuTrigger>
      {isFetched && (
        <DropdownMenuContent className='w-80 max-h-[70vh] overflow-y-auto p-4' align='end'>
          <div className='space-y-4'>
            <div>
              <h3 className='font-medium mb-2'>Price Range</h3>
              <div className='space-y-4'>
                <Slider
                  defaultValue={[minLotPriceSelected, maxLotPriceSelected]}
                  min={minLotPriceExisted}
                  max={maxLotPriceExisted}
                  step={1}
                  onValueChange={onPriceRangeChange}
                  className='my-4'
                />

                <h3 className='font-medium mb-2'>Lots Price Range</h3>
                <div className='flex items-center justify-between gap-2'>
                  <Input
                    id='min-price'
                    type='number'
                    min={minLotPriceExisted}
                    max={maxLotPriceExisted}
                    value={filters.priceRange.minPrice ?? minLotPriceSelected}
                    onChange={(e) => onPriceInputChange('minPrice', e.target.value)}
                  />

                  <Input
                    id='max-price'
                    type='number'
                    min={minLotPriceExisted}
                    max={maxLotPriceExisted}
                    value={filters.priceRange.maxPrice ?? maxLotPriceSelected}
                    onChange={(e) => onPriceInputChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className='font-medium mb-2'>Categories</h3>
              <div className='space-y-2'>
                {lotCategoriesExistedNames.map((category) => (
                  <div key={category} className='flex items-center space-x-2'>
                    <Checkbox
                      id={category}
                      checked={filters.categories?.includes(category)}
                      onCheckedChange={(checked) => onCategoryChange(category, !!checked)}
                    />
                    <Label htmlFor={category}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex justify-between'>
              <Button variant='outline' size='sm' onClick={onResetFilters} className='flex items-center gap-1'>
                <RotateCcw className='h-4 w-4' />
                Reset
              </Button>

              <Button variant='outline' size='sm' onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <Button size='sm' onClick={onApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default FilterMenu;
