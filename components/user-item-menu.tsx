import { LucideIcon } from 'lucide-react';

type UserItemMenuProps = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon | React.ElementType;
  iconWidth?: number;
  iconHeight?: number;
};

const UserItemMenu = ({ label, onClick, icon: Icon, iconWidth = 18, iconHeight = 18 }: UserItemMenuProps) => {
  return (
    <div
      onClick={onClick}
      className='px-2 py-2 flex items-center justify-between text-sm text-slate-700 hover:bg-slate-100 transition cursor-pointer hover:scale-[1.015]'
    >
      {label}
      {Icon && <Icon width={iconWidth} height={iconHeight} className='text-slate-700' />}
    </div>
  );
};

export default UserItemMenu;
