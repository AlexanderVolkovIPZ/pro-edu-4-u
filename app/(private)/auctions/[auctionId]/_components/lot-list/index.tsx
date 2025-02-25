'use client';

import getReorderedLots from '@/app/actions/get-reordered-lots';
import { AuctionWithLotsType } from '@/app/types';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from '@hello-pangea/dnd';
import { Grip, SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type LotListProps = {
  auctionData: Pick<AuctionWithLotsType, 'id' | 'lot'>;
  reorderMutateAsync: ({ lotId, newPosition }: { lotId: string; newPosition: number }) => Promise<void>;
};

const LotList = ({ auctionData, reorderMutateAsync }: LotListProps) => {
  const [lots, setLots] = useState(auctionData.lot);
  const router = useRouter();

  useEffect(() => {
    setLots(auctionData.lot);
  }, [auctionData.lot]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    setLots(
      getReorderedLots({
        lotId: draggableId,
        newPosition: destination.index,
        lots: lots,
      })
    );

    try {
      await reorderMutateAsync({
        lotId: draggableId,
        newPosition: destination.index,
      });

      toast.success('The lots position has been successfully updated', {
        style: {
          textAlign: 'center',
        },
      });
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='lots'>
        {(provided: DroppableProvided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className='space-y-2 p-4 rounded-md'>
            {lots.map(({ id, title, position }) => (
              <Draggable key={id} draggableId={id} index={position}>
                {(provided: DraggableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className='p-2 bg-white shadow rounded-md flex items-center justify-between'
                  >
                    <div className='flex items-center gap-x-2'>
                      <div {...provided.dragHandleProps}>
                        <Grip className='w-5 h-5 hover:scale-110 transition hover:text-red-500' />
                      </div>
                      <div className='text-gray-400'>{title}</div>
                    </div>
                    <SquarePen
                      className='w-5 h-5 cursor-pointer hover:scale-110 transition'
                      onClick={() => router.push(`/auctions/${auctionData.id}/lots/${id}`)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default LotList;
