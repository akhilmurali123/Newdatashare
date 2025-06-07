"use client";
import { useRiaPanel } from '@/contexts/ria-panel-context';
import { cn } from '@/lib/utils';

export default function AppMainContainer({ children }: { children: React.ReactNode }) {
  const { isRiaPanelOpen } = useRiaPanel();
  return (
    <div className={cn('flex-1 transition-all duration-300', isRiaPanelOpen ? 'pr-[444px]' : '')}>
      {children}
    </div>
  );
} 