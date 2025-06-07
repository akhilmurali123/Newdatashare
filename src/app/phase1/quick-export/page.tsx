'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import CreateDataExportWizard from '@/components/data-export/create-data-export-wizard/create-data-export-wizard';
import type { ExportJobListItem } from '@/lib/types';

function QuickExportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  // Get selections from modal via URL params
  const preselectEntities = searchParams.get('preselectEntities')?.split(',') || ['organizations', 'products', 'suppliers'];
  const includeRelationships = searchParams.get('includeRelationships') === 'true';
  const includeInteractions = searchParams.get('includeInteractions') === 'true';
  const fileFormat = searchParams.get('fileFormat') || 'csv';
  const destination = searchParams.get('destination') || 's3';
  const exportTiming = searchParams.get('exportTiming') || 'now';

  // Force step to configureData on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'configureData');
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Handle export created
  const handleExportCreated = (newExport: ExportJobListItem) => {
    setIsOpen(false);
    // Store the new export in session storage for the search page to pick up
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('newlyCreatedExport', JSON.stringify(newExport));
    }
    // Return to search page
    router.push('/search');
  };

  // Handle close/cancel
  const handleClose = () => {
    setIsOpen(false);
    router.push('/search');
  };

  return (
    <div className="p-8">
      <CreateDataExportWizard
        isOpen={isOpen}
        onClose={handleClose}
        onExportCreated={handleExportCreated}
      />
    </div>
  );
}

export default function QuickExportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuickExportPageContent />
    </Suspense>
  );
} 