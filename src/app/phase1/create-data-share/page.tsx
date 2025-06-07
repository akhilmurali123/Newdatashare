'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateDataShareWizard from '@/components/data-share/create-data-share-wizard/create-data-share-wizard';
import type { ActiveDataShare } from '@/lib/types';

export default function CreateDataSharePage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Optionally handle share created event
  const handleShareCreated = (newShare: ActiveDataShare) => {
    setIsOpen(false);
    router.push('/phase1');
  };

  return (
    <div className="p-8">
      <CreateDataShareWizard
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          router.push('/phase1');
        }}
        onShareCreated={handleShareCreated}
        originPage="phase1"
      />
    </div>
  );
} 