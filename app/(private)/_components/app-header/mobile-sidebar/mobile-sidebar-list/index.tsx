import { sidebarList } from '@/app/(private)/_shared/lists/sidebar-list';
import MobileSidebarItem from './mobile-sidebar-item';

const MobileSidebarList = () => {
  const routes = sidebarList;

  return (
    <div className='flex flex-col gap-y-2'>
      {routes.map(({ link, name, icon }) => (
        <MobileSidebarItem key={link} link={link} name={name} icon={icon} />
      ))}
    </div>
  );
};

export default MobileSidebarList;
