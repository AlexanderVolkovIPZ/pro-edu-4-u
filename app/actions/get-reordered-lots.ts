import { Lot } from '@prisma/client';

type ReorderedLotsProps = {
  lotId: string;
  lots: Lot[];
  newPosition: number;
};

export default function getReorderedLots({ lotId, newPosition, lots }: ReorderedLotsProps) {
  const draggableLot = lots.find((lot) => lot.id === lotId)!;
  const oldLotPosition = draggableLot.position;
  const isHigherPosition = newPosition > oldLotPosition;

  const reorderedLots = lots.map((lot) => {
    if (draggableLot.id === lot.id) {
      return { ...lot, position: newPosition };
    }

    if (isHigherPosition && lot.position > oldLotPosition && lot.position <= newPosition) {
      return { ...lot, position: lot.position - 1 };
    }

    if (!isHigherPosition && lot.position < oldLotPosition && lot.position >= newPosition) {
      return { ...lot, position: lot.position + 1 };
    }
    return lot;
  });

  return reorderedLots.sort((a, b) => a.position - b.position);
}
