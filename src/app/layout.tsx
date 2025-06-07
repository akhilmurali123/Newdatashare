'use client';
import type {Metadata} from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { RiaPanelProvider } from '@/contexts/ria-panel-context';
import RiaPanelLayoutWrapper from '@/components/ria-panel-layout-wrapper';
import AppMainContainer from '@/components/AppMainContainer';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';

const openSans = Open_Sans({ 
  variable: '--font-open-sans', 
  subsets: ['latin'],
  display: 'swap', 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleRiaNavigation = (targetPath: string) => {
    if (pathname === '/ai-agent-flow') {
      if (targetPath === '/phase1') {
        router.push('/ai-agent-flow');
        return;
      }
      const previewPath = '/phase1?openWizard=true&step=reviewDataset';
      if (targetPath === previewPath) {
        router.push('/ai-agent-flow?openWizard=true&step=reviewDataset');
        return;
      }
    }
    
    router.push(targetPath);
  };

  return (
    <html lang="en">
      <body className={`${openSans.variable} antialiased bg-background text-foreground`}>
        <RiaPanelProvider onRiaNavigate={handleRiaNavigation}>
          <SidebarProvider defaultOpen={false}>
            <RiaPanelLayoutWrapper />
            <AppMainContainer>
              <AppHeader />
              <div className="flex flex-1 h-[calc(100vh-var(--header-height,60px))]">
                <AppSidebar />
                <div className="flex flex-1 overflow-hidden">
                  <SidebarInset className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
                    {children}
                  </SidebarInset>
                </div>
              </div>
            </AppMainContainer>
          </SidebarProvider>
        </RiaPanelProvider>
        <Toaster />
      </body>
    </html>
  );
}
    
