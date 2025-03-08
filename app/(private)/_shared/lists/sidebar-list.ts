import { House, LayoutList, Settings, ChartNoAxesCombined, LayoutDashboard, UserCog, Truck } from 'lucide-react';

export const userSidebarList = [
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

export const adminSidebarList = [
  {
    link: '/',
    name: 'Home',
    icon: House,
  },
  {
    link: '/dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    link: '/users',
    name: 'Users',
    icon: UserCog,
  },
  {
    link: '/auctions',
    name: 'All auctions',
    icon: LayoutList,
  },
  {
    link: '/shipping',
    name: 'Shipping',
    icon: Truck,
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
