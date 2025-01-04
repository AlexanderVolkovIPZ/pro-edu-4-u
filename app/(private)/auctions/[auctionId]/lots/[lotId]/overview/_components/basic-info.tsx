import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Category, Lot } from '@prisma/client';

type BasicInfoProps = {
  lotId?: Lot['id'];
  lotTitle?: Lot['title'];
  lotDescription?: Lot['description'];
  categories?: {
    categoryId: Category['id'];
    category: Category;
  }[];
};

const BasicInfo = ({ lotTitle = '', lotId = '', lotDescription = '', categories = [] }: BasicInfoProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>{lotTitle}</h1>
          <p className='text-sm text-muted-foreground'>Lot: {lotId}</p>
        </div>
        <Badge variant='secondary' className='text-sm'>
          STATUS
        </Badge>
      </div>

      <div className='flex flex-wrap gap-2'>
        {categories.map((category) => (
          <Badge key={category.category.id} variant='outline'>
            {category.category.name}
          </Badge>
        ))}
      </div>

      {lotDescription && (
        <div>
          <Separator />
          <p className='text-justify mt-4' dangerouslySetInnerHTML={{ __html: lotDescription }} />
        </div>
      )}
    </div>
  );
};

export default BasicInfo;
