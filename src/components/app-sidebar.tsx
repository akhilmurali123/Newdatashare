// @/components/app-sidebar.tsx
'use client';
import Link from 'next/link'; 
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger, // For mobile
  SidebarGroupContent, 
  useSidebar, // Import useSidebar hook
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Gauge,
  BarChart3,
  LayoutGrid,
  Database,
  Copy,
  FileSearch,
  Grid3x3,
  AppWindow,
  PlusCircle,
  GripVertical,
  Users,
  Briefcase,
  ShoppingBag,
  Building,
  Truck,
} from 'lucide-react';
import { usePathname } from 'next/navigation'; // To determine active item
import { cn } from '@/lib/utils';

export default function AppSidebar() {
  const pathname = usePathname(); 
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: AreaChart, href: '/dashboard' },
    { id: 'activity', label: 'Activity', icon: Gauge, href: '/activity' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { id: 'data-model', label: 'Data Model', icon: LayoutGrid, href: '/data-model' },
    { id: 'data-share', label: 'Data Share', icon: Database, href: '/phase1' },
    { id: 'match-merge', label: 'Match & Merge', icon: Copy, href: '/match-merge' },
    { id: 'search', label: 'Search', icon: FileSearch, href: '/search' }, // Updated href
    { id: 'applications', label: 'Applications', icon: Grid3x3, href: '/applications' },
    { id: 'console', label: 'Console', icon: AppWindow, href: '/console' },
  ];
  
  const bottomMenuItems = [
    { id: 'create-new', label: 'Create New', icon: PlusCircle, href: '/create' },
    { id: 'settings', label: 'Settings', icon: GripVertical, href: '/settings' },
  ]

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r bg-card text-card-foreground">
      <SidebarContent className="p-2 flex flex-col justify-between h-full">
        <div>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  href={item.href}
                  isActive={pathname === item.href || (item.href === '/phase1' && pathname.startsWith('/phase1')) || (item.href === '/search' && pathname.startsWith('/search'))} 
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  asChild
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <span className={cn("p-2 rounded-md", pathname === item.href || (item.href === '/phase1' && pathname.startsWith('/phase1')) || (item.href === '/search' && pathname.startsWith('/search')) ? "bg-primary text-primary-foreground" : "")}>
                       <item.icon />
                    </span>
                    {(sidebarState === 'expanded' || isMobile) && <span className="ml-3">{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <SidebarMenu className="mt-auto">
          {bottomMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                href={item.href}
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
                asChild
              >
                <Link href={item.href} className="flex items-center w-full">
                  <span className={cn("p-2 rounded-md", pathname === item.href ? "bg-primary text-primary-foreground" : "")}>
                    <item.icon />
                  </span>
                  {(sidebarState === 'expanded' || isMobile) && <span className="ml-3">{item.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
