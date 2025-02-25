'use client';

import { sidebarList } from '@/app/(private)/_shared/lists/sidebar-list';
import SidebarItem from './sidebar-item';

const SidebarList = () => {
  const routes = sidebarList;

  return routes.map(({ link, name, icon }) => <SidebarItem key={link} link={link} name={name} icon={icon} />);
};

export default SidebarList;
