'use client';

import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import SidebarItem from './sidebar-item';

const SidebarList = ({
  sidebarList,
}: {
  sidebarList: {
    link: string;
    name: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  }[];
}) => {
  const { t } = useTranslation();

  return sidebarList.map(({ link, name, icon }) => <SidebarItem key={link} link={link} name={t(name)} icon={icon} />);
};

export default SidebarList;
