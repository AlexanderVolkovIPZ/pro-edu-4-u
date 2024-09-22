'use client';

import { sidebarList } from '../_shared/sidebar-list';
import SidebarItem from './sidebar-item';

const SidebarList = () => {
  const routes = sidebarList;

  return routes.map(({ link, name, icon }) => <SidebarItem key={link} link={link} name={name} icon={icon} />);
};

export default SidebarList;
