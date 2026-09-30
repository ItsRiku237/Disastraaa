/**
 * Navigation configuration.
 *
 * All nav links and dashboard sidebar groups are defined here.
 * Components consume these arrays — no nav structure is hard-coded
 * inside layout components.
 */

export interface NavItem {
  label: string;
  href: string;
  /** Lucide icon name — resolved to component inside layout components */
  icon?: string;
  description?: string;
  badge?: string;
  isExternal?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Top-level public navigation links */
export const publicNavLinks: NavItem[] = [
  { label: 'Map',     href: '/map',     description: 'Live disaster intelligence map' },
  { label: 'Alerts',  href: '/alerts',  description: 'Active warnings and alerts' },
  { label: 'Reports', href: '/reports', description: 'Citizen disaster reports' },
  { label: 'Travel',  href: '/travel',  description: 'Route safety assessment' },
  { label: 'About',   href: '/about',   description: 'About the platform' },
];

/** Dashboard sidebar navigation — grouped by function */
export const dashboardNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Command Center',    href: '/dashboard',  icon: 'LayoutDashboard' },
      { label: 'Situation Analytics', href: '/analytics', icon: 'BarChart2' },
      { label: 'Incident Management', href: '/incidents', icon: 'AlertTriangle' },
      { label: 'Evacuation',           href: '/evacuation', icon: 'Shield'        },
      { label: 'Response Operations',  href: '/operations', icon: 'Truck'         },
      { label: 'Response Simulator',  href: '/simulator', icon: 'Sliders' },
      { label: 'Live Map',  href: '/map',         icon: 'Map' },
      { label: 'Alerts',    href: '/alerts',      icon: 'Bell' },
    ],
  },
  {
    label: 'Field',
    items: [
      { label: 'Reports',   href: '/reports/manage', icon: 'FileText' },
      { label: 'Shelters',  href: '/shelters',        icon: 'Home' },
      { label: 'Resources', href: '/resources',       icon: 'Package' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Intelligence Assistant', href: '/assistant', icon: 'Bot' },
      { label: 'Risk Analysis',     href: '/state',       icon: 'Activity' },
      { label: 'Historical',        href: '/historical',  icon: 'Clock' },
      { label: 'Planning',          href: '/planning',    icon: 'Calendar' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
];
