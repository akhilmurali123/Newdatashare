'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CreateDataExportWizard from '@/components/data-export/create-data-export-wizard/create-data-export-wizard';
import type { ExportJobListItem } from '@/lib/types';

export default function CreateExportPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Optionally handle export created event
  const handleExportCreated = (newExportJob: ExportJobListItem) => {
    setIsOpen(false);
    router.push('/phase1');
  };

  return (
    <div className="p-8">
      <CreateDataExportWizard
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          router.push('/phase1');
        }}
        onExportCreated={handleExportCreated}
        flowType="create"
      />
    </div>
  );
} 