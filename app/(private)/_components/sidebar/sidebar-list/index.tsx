'use client';

import { ForwardRefExoticComponent, RefAttributes } from 'react';
import SidebarItem from './sidebar-item';
import { LucideProps } from 'lucide-react';

const SidebarList = ({
  sidebarList,
}: {
  sidebarList: {
    link: string;
    name: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  }[];
}) => {
  return sidebarList.map(({ link, name, icon }) => <SidebarItem key={link} link={link} name={name} icon={icon} />);
};

export default SidebarList;
