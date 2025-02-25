import Logo from '@/components/logo';
import SidebarList from './sidebar-list';

const Sidebar = () => {
  return (
    <div className='h-full border-r'>
      <div className='h-16 flex items-center justify-center'>
        <Logo />
      </div>
      <div>
        <SidebarList />
      </div>
    </div>
  );
};

export default Sidebar;
