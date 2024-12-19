import { UploadedImage } from '@/components/image-uploader';

type ReorderedFilesProps = {
  id: string;
  files: UploadedImage[];
  newPosition: number;
};

export default function getReorderedFiles({ id, newPosition, files }: ReorderedFilesProps): UploadedImage[] {
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
