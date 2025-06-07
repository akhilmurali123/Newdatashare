'use client';

import { useRiaPanel } from '@/contexts/ria-panel-context';
import RiaPanel from '@/components/ria-panel/ria-panel';

// Wrapper component to conditionally render RiaPanel
export default function RiaPanelLayoutWrapper() {
  const { isRiaPanelOpen } = useRiaPanel();

  if (!isRiaPanelOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-screen w-full max-w-md min-w-[340px] z-50 shadow-xl border-l bg-muted/30 flex flex-col">
      <RiaPanel />
    </div>
  );
}
