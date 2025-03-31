import { Avatar as UserAvatar, AvatarImage } from '@/components/ui/avatar';

type AvatarProps = {
  url?: string | null;
  width?: number;
  height?: number;
};

const Avatar = ({ url, width = 28, height = 28 }: AvatarProps) => {
  return (
    <UserAvatar
      style={{ width: `${width}px`, height: `${height}px` }}
      className={` border border-slate-300 cursor-pointer rounded-full`}
    >
      <AvatarImage src={url ?? undefined} />
    </UserAvatar>
  );
};

export default Avatar;
