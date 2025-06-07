'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DatasetsList from '@/components/data-out/datasets-list';
import CreateDataShareWizard from '@/components/data-share/create-data-share-wizard/create-data-share-wizard';
import type { ActiveDataShare, DatasetListItem } from '@/lib/types';
import { mockDatasetListItems } from '@/lib/types'; // Import mock data
import { Button } from '@/components/ui/button';
import { ListFilter, PlusCircle } from 'lucide-react';

function AiAgentFlowPageContent() {
  const [datasetItems, setDatasetItems] = useState<DatasetListItem[]>(mockDatasetListItems);

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCreateDataShare = () => {
    // Navigate to the same page with openWizard=true to show the wizard
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    currentSearchParams.set('openWizard', 'true');
    // Optional: retain step if needed, though starting from step 1 usually implies no step param initially
    // currentSearchParams.delete('step');
    router.push(`/ai-agent-flow?${currentSearchParams.toString()}`);
  };

  const handleShareCreated = (newShare: ActiveDataShare) => {
    // This function might need to be adapted if the wizard creates a DatasetListItem
    // For now, it's based on ActiveDataShare
    console.log('New data share created (wizard):', newShare);
    // Potentially refresh or add to datasetItems if applicable
    // For now, just closing the wizard
    // On share created, navigate back to the list view (remove openWizard param)
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    currentSearchParams.delete('openWizard');
    currentSearchParams.delete('step'); // Also remove step param
    router.replace(`/ai-agent-flow?${currentSearchParams.toString()}`);
  };

  const openWizardParam = searchParams.get('openWizard');
  const isWizardOpen = openWizardParam === 'true';

  return (
    <div className="flex flex-col h-full w-full">
      {isWizardOpen ? (
        <CreateDataShareWizard
          isOpen={isWizardOpen}
          onClose={() => {
            // Navigate back to the list view (remove openWizard param)
            const currentSearchParams = new URLSearchParams(searchParams.toString());
            currentSearchParams.delete('openWizard');
            currentSearchParams.delete('step'); // Also remove step param
            router.replace(`/ai-agent-flow?${currentSearchParams.toString()}`);
          }}
          onShareCreated={handleShareCreated}
          originPage="ai-agent-flow"
        />
      ) : (
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-2xl font-bold text-foreground mb-2 sm:mb-0">
              Data exchange
            </h1>
          </div>

          {/* Datasets list section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Datasets | {datasetItems.length} item{datasetItems.length !== 1 ? 's' : ''}
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => alert('Filter clicked')}>
                  <ListFilter className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Filters</span>
                </Button>
                <Button onClick={handleCreateDataShare} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> CREATE NEW
                </Button>
              </div>
            </div>
            <DatasetsList items={datasetItems} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiAgentFlowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AiAgentFlowPageContent />
    </Suspense>
  );
}
