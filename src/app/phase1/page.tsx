'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DataShareWelcome from '@/components/data-share/data-share-welcome';
import ActiveDataSharesList from '@/components/data-share/active-data-shares-list';
import { MOCK_EXPORT_JOBS } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExportJobsList from '@/components/data-out/export-jobs-list';
import type { ActiveDataShare } from '@/lib/types';

const MOCK_SHARES: ActiveDataShare[] = [
  {
    id: '1',
    name: 'US Organizations',
    description: 'All organizations based in the United States with key financial data.',
    createdBy: 'jubin.thomson',
    shareDestination: 'Microsoft Fabric',
    sharingStatus: 'Active',
    summary: { profiles: 1200, relationships: 300, interactions: 5000 }
  },
  {
    id: '2',
    name: 'EMEA Product Catalog',
    description: 'Product information for the EMEA region, updated daily.',
    createdBy: 'jane.doe',
    shareDestination: 'Snowflake Warehouse',
    sharingStatus: 'Active',
    summary: { profiles: 800, relationships: 150, interactions: 2500 }
  },
  {
    id: '3',
    name: 'Customer Interactions - Last 90 Days',
    description: 'Recent customer interaction data for sentiment analysis.',
    createdBy: 'alex.smith',
    shareDestination: 'Google BigQuery',
    sharingStatus: 'Not active',
    summary: { profiles: 500, relationships: 50, interactions: 10000 }
  }
];

function Phase1HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeShares, setActiveShares] = useState<ActiveDataShare[]>(MOCK_SHARES);
  const [showWelcome, setShowWelcome] = useState(MOCK_SHARES.length === 0);
  const [isLoading, setIsLoading] = useState(false);
  const currentTab = searchParams.get('tab') || 'data-share';

  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    router.push(`/phase1?tab=${value}`, { scroll: false });
  };

  // Handle delete share (mock)
  const handleDeleteShare = (shareId: string) => {
    setActiveShares(prevShares => {
      const updatedShares = prevShares.filter(share => share.id !== shareId);
      if (updatedShares.length === 0) {
        setShowWelcome(true);
      }
      return updatedShares;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-150px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-4">Data exchange</h1>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="flex flex-col flex-grow">
        <TabsList className="flex-shrink-0 w-full justify-start">
          <TabsTrigger value="data-share">DATA SHARE</TabsTrigger>
          <TabsTrigger value="data-export">DATA EXPORT</TabsTrigger>
        </TabsList>
        <TabsContent value="data-share" className="flex-grow min-h-0 mt-4">
          <div className="flex flex-col h-full w-full">
            {showWelcome && activeShares.length === 0 ? (
              <DataShareWelcome onCreateDataShare={() => router.push('/phase1/create-data-share')} />
            ) : (
              <ActiveDataSharesList 
                shares={activeShares} 
                onCreateNew={() => router.push('/phase1/create-data-share')}
                onDeleteShare={handleDeleteShare}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="data-export" className="flex-grow min-h-0 mt-4">
          <ExportJobsList items={MOCK_EXPORT_JOBS} onCreateNew={() => router.push('/phase1/create-export')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Phase1HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Phase1HomePageContent />
    </Suspense>
  );
}
