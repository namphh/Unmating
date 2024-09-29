import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Tổng quan',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },
  
];
