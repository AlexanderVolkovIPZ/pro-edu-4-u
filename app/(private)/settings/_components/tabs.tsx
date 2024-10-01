'useClient';

import { usePathname } from 'next/navigation';
import Tab from './tab';

const tabList = [
  {
    title: 'Profile',
    path: '/',
  },
  {
    title: 'Account',
    path: '/account',
  },
  {
    title: 'Appearance',
    path: '/appearance',
  },
];

const Tabs = () => {
  const pathName = usePathname();
  const activeTab = tabList.find(({ path }) => `/settings${path}` === pathName) || tabList[0];

  return (
    <nav className='flex flex-row md:flex-col'>
      {tabList.map(({ title, path }) => {
        const isActive = path === activeTab.path;
        return <Tab key={title} title={title} path={`/settings${path}`} isActive={isActive} />;
      })}
    </nav>
  );
};

export default Tabs;
