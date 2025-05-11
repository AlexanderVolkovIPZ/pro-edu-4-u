'use client';

import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Category, LotCategory } from '@prisma/client';
import { Check, ChevronsUpDown, Pencil, PencilOff, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type CategoryInputProps = {
  initialCategories?: Category[];
  initialLotCategoryIds?: LotCategory['id'][];
  isLoading?: boolean;
  showRequiredFieldIcon?: boolean;
  onSubmit: ({ categoryIds }: { categoryIds: string[] }) => void;
  onSuccess?: () => void;
  onError?: () => void;
};

const CategoryInput = ({
  initialCategories = [],
  initialLotCategoryIds = [],
  isLoading = false,
  showRequiredFieldIcon = false,
  onSubmit,
  onSuccess,
  onError,
}: CategoryInputProps) => {
  const { t } = useTranslation();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialLotCategoryIds);
  const [isOpenedInput, setIsOpenedInput] = useState(false);
  const [isOpenedPopover, setIsOpenedPopover] = useState(false);

  const onToggleCategory = (categoryId: string) =>
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );

  const onSave = async () => {
    try {
      await onSubmit({
        categoryIds: selectedCategoryIds,
      });

      setIsOpenedInput(false);

      if (onSuccess) onSuccess();
    } catch {
      if (onError) onError();
    }
  };

  return (
    <div className='px-4 py-3 rounded-lg border-slate-300 border-[1.4px]'>
      <div className='flex items-center justify-between'>
        <label htmlFor='title' className='block text-base font-semibold text-gray-700 relative'>
          {t('new_lot.categories')}
          {showRequiredFieldIcon && <span className='text-rose-500 text-sm absolute top-0 -right-2'>*</span>}
        </label>
        <Button
          className='cursor-pointer hover:bg-transparent hover:scale-105 transition p-0'
          variant='ghost'
          onClick={() => setIsOpenedInput((prev) => !prev)}
          type='button'
        >
          {isOpenedInput ? <PencilOff className='w-5 h-5' /> : <Pencil className='w-5 h-5' />}
        </Button>
      </div>

      {isOpenedInput && (
        <Popover open={isOpenedPopover} onOpenChange={setIsOpenedPopover}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={isOpenedPopover}
              className='w-full flex items-center justify-between mt-2'
            >
              {selectedCategoryIds.length
                ? `${selectedCategoryIds.length} ${t('new_lot.categories_selected')}`
                : `${t('new_lot.select_categories')}...`}
              <ChevronsUpDown className='opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='p-0'>
            <Command>
              <CommandInput placeholder={t('new_lot.search_category')} className='h-9' />
              <CommandList>
                <CommandEmpty>{t('new_lot.no_category_found')}</CommandEmpty>
                <CommandGroup>
                  {initialCategories.map((category) => (
                    <CommandItem key={category.id} value={category.id} onSelect={() => onToggleCategory(category.id)}>
                      {category.name}
                      <Check
                        className={cn(
                          'ml-auto',
                          selectedCategoryIds.includes(category.id) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {isOpenedInput && (
        <div>
          <Button className='mt-3 relative' type='button' onClick={onSave} disabled={isLoading}>
            {t('common.save')}
            {isLoading && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </Button>
        </div>
      )}

      <div className={cn('flex flex-wrap gap-2', selectedCategoryIds.length && isOpenedInput && 'mt-3')}>
        {!!selectedCategoryIds.length &&
          selectedCategoryIds.map((categoryId) => {
            const category = initialCategories?.find((cat) => cat.id === categoryId);

            return (
              category && (
                <div key={category.id} className='flex items-center bg-slate-200 text-slate-700 rounded px-2'>
                  {category.name}

                  {isOpenedInput && (
                    <button
                      className='ml-2 text-slate-500 hover:text-slate-700'
                      onClick={() => onToggleCategory(category.id)}
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              )
            );
          })}
      </div>

      {!selectedCategoryIds.length && !isOpenedInput && (
        <div className='text-slate-500 italic'>{t('new_lot.no_categories_selected')}</div>
      )}
    </div>
  );
};

export default CategoryInput;
