'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import CreateDataShareWizard from '@/components/data-share/create-data-share-wizard/create-data-share-wizard';
import type { ActiveDataShare } from '@/lib/types';

function QuickDataSharePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  // Get selections from modal via URL params
  const preselectEntities = searchParams.get('preselectEntities')?.split(',') || ['organizations', 'products', 'suppliers'];
  const includeRelationships = searchParams.get('includeRelationships') === 'true';
  const includeInteractions = searchParams.get('includeInteractions') === 'true';
  const datasetName = searchParams.get('datasetName') || 'Quick Data Share';
  const description = searchParams.get('description') || '';
  const target = searchParams.get('target') || 'fabric_sales';

  // Force step to configureData on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'configureData');
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Handle share created
  const handleShareCreated = (newShare: ActiveDataShare) => {
    setIsOpen(false);
    // Store the new share in session storage for the search page to pick up
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('newlyCreatedShare', JSON.stringify(newShare));
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
      <CreateDataShareWizard
        isOpen={isOpen}
        onClose={handleClose}
        onShareCreated={handleShareCreated}
        originPage="phase1"
      />
    </div>
  );
}

export default function QuickDataSharePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuickDataSharePageContent />
    </Suspense>
  );
} 