import { House, LayoutList, Settings, ChartNoAxesCombined } from 'lucide-react';

export const sidebarList = [
  {
    link: '/',
    name: 'Home',
    icon: House,
  },
  {
    link: '/auctions',
    name: 'My auctions',
    icon: LayoutList,
  },
  {
    link: '/analytics ',
    name: 'Analytics ',
    icon: ChartNoAxesCombined,
  },
  {
    link: '/settings',
    name: 'Settings',
    icon: Settings,
  },
];
