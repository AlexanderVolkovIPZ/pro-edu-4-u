import { House, LayoutList, Settings, LayoutDashboard, UserCog, Truck } from 'lucide-react';

export const userSidebarList = [
  {
    link: '/',
    name: 'main.home',
    icon: House,
  },
  {
    link: '/auctions',
    name: 'main.all_auctions',
    icon: LayoutList,
  },
  {
    link: '/orders',
    name: 'main.orders',
    icon: Truck,
  },
  {
    link: '/settings/account',
    name: 'main.settings',
    icon: Settings,
  },
];

export const adminSidebarList = [
  {
    link: '/',
    name: 'main.home',
    icon: House,
  },
  {
    link: '/dashboard',
    name: 'main.dashboard',
    icon: LayoutDashboard,
  },
  {
    link: '/users',
    name: 'main.users',
    icon: UserCog,
  },
  {
    link: '/auctions',
    name: 'main.all_auctions',
    icon: LayoutList,
  },
  {
    link: '/orders',
    name: 'main.orders',
    icon: Truck,
  },
  {
    link: '/settings/account',
    name: 'main.settings',
    icon: Settings,
  },
];
