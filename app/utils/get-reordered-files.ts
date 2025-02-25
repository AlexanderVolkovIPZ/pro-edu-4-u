type ReorderedFilesProps<T> = {
  id: string;
  files: T[];
  newPosition: number;
};

export default function getReorderedFiles<T extends { id: string; position: number }>({
  id,
  newPosition,
  files,
}: ReorderedFilesProps<T>): T[] {
  const draggableFile = files.find((file) => file.id === id)!;
  const oldLotPosition = draggableFile.position;
  const isHigherPosition = newPosition > oldLotPosition;

  const reorderedLots = files.map((file) => {
    if (draggableFile.id === file.id) {
      return { ...file, position: newPosition };
    }

    if (isHigherPosition && file.position > oldLotPosition && file.position <= newPosition) {
      return { ...file, position: file.position - 1 };
    }

    if (!isHigherPosition && file.position < oldLotPosition && file.position >= newPosition) {
      return { ...file, position: file.position + 1 };
    }
    return file;
  });

  return reorderedLots.sort((a, b) => a.position - b.position);
}
