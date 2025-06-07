'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link'; // Import Link
import { useRouter } from 'next/navigation'; // Import useRouter
import { useToast } from '@/hooks/use-toast'; // Import useToast
import SearchFilterPanel from '@/components/search/search-filter-panel';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  CloudDownload,
  DatabaseZap,
  Save,
  MoreVertical,
  History,
  FileText,
} from 'lucide-react';
import QuickDataShareModal from '@/components/search/quick-data-share-modal';
import type { TargetOption, SearchResultItem, ActiveDataShare, ExportJobListItem, EntityTypeConfig } from '@/lib/types'; // Add ExportJobListItem and EntityTypeConfig
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchResultsTable from '@/components/search/search-results-table';
import { mockSearchResults, initialEntityTypes } from '@/lib/types'; // Import initialEntityTypes
import QuickDataExportWizard from '@/components/data-export/create-data-export-wizard/quick-data-export-wizard';
import QuickDataExportModal from '@/components/search/quick-data-export-modal'; // Import Quick Export Modal
import QuickDataShareWizard from "@/components/data-share/create-data-share-wizard/quick-data-share-wizard";

function SearchPageContent() {
  const [isQuickShareModalOpen, setIsQuickShareModalOpen] = useState(false);
  const [isQuickExportModalOpen, setIsQuickExportModalOpen] = useState(false); // State for Quick Export Modal
  const [isExportWizardOpen, setIsExportWizardOpen] = useState(false); // State for Full Export Wizard
  const [exportWizardInitialValues, setExportWizardInitialValues] = useState({
    initialSelectedEntityTypes: ['organizations', 'products', 'suppliers'],
    initialIncludeRelationships: true,
    initialIncludeInteractions: false,
    initialFileFormat: 'CSV Flattened',
    initialDestination: 'Direct download',
    initialWhenToExport: 'Export now',
  });
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>(mockSearchResults);
  const { toast } = useToast();
  const router = useRouter();

  const totalProfiles = 1304;
  const appliedFilters = [
    { id: 'type', display: 'Type: Organizations, Products, Suppliers' },
    { id: 'country', display: 'Country: US' },
  ];

  const entityTypeSummariesForQuickShare = [
    { name: "Organizations", selectedAttributes: 12, totalAttributes: 23 },
    { name: "Products", selectedAttributes: 12, totalAttributes: 33 },
    { name: "Suppliers", selectedAttributes: 10, totalAttributes: 15 },
  ];

  const [isShareWizardOpen, setIsShareWizardOpen] = useState(false);
  const [shareWizardInitialValues, setShareWizardInitialValues] = useState({
    initialSelectedEntityTypes: ['organizations', 'products', 'suppliers'],
    initialIncludeRelationships: false,
    initialIncludeInteractions: false,
    initialDatasetName: '',
    initialDescription: '',
    initialTarget: '',
  });

  const handleQuickShareStart = (
    datasetName: string,
    description: string,
    target: TargetOption,
    includeRelationships: boolean,
    includeInteractions: boolean
  ) => {
    console.log('Quick Share Started:', {
      datasetName,
      description,
      targetName: target.name,
      totalProfiles,
      includeRelationships,
      includeInteractions
    });

    const newShare: ActiveDataShare = {
      id: Date.now().toString(),
      name: datasetName,
      description: description || `Quick share of ${totalProfiles} profiles`,
      createdBy: 'search.user',
      shareDestination: target.name,
      sharingStatus: 'Active',
      summary: {
        profiles: totalProfiles,
        relationships: includeRelationships ? 567 : 0,
        interactions: includeInteractions ? 5638 : 0,
      }
    };

    if (typeof window !== 'undefined') {
        sessionStorage.setItem('newlyCreatedShare', JSON.stringify(newShare));
    }

    toast({
      title: "Data sharing is activated",
      description: "To manage sharing, visit Data exchange",
      action: (
        <Button variant="outline" onClick={() => router.push("/phase1?tab=data-share")} className="mt-2">
          Data exchange
        </Button>
      ),
      duration: 10000,
    });

    setIsQuickShareModalOpen(false);
  };

  const handleAdvancedShare = (includeRelationships: boolean, includeInteractions: boolean) => {
    setIsQuickShareModalOpen(false);
    setShareWizardInitialValues({
      initialSelectedEntityTypes: ['organizations', 'products', 'suppliers'],
      initialIncludeRelationships: includeRelationships,
      initialIncludeInteractions: includeInteractions,
      initialDatasetName: 'Organizations, suppliers and products data share',
      initialDescription: '',
      initialTarget: '',
    });
    setTimeout(() => setIsShareWizardOpen(true), 0);
  };

  const entityTabs = [
    { value: "organizations", label: "Organizations", count: 512 },
    { value: "products", label: "Products", count: 301 },
    { value: "suppliers", label: "Suppliers", count: 243 },
  ];

  // Prepare data summary for Quick Export Modal
  const selectedEntityTypesSummary = entityTabs
    .filter(tab => ['organizations', 'products', 'suppliers'].includes(tab.value)) // Only include org, supplier, product
    .map(tab => {
      const initialEntityType = initialEntityTypes.find(et => et.id === tab.value);
      return {
        name: tab.label,
        count: tab.count,
        totalAttributes: initialEntityType?.attributes.length,
      };
    });

  const totalRelationshipsCount = 278; // Mock count from screenshot
  const totalInteractionsCount = 1356; // Mock count from screenshot (profiles count seems to be relationships count in screenshot? let's follow screenshot labels)

  const handleQuickExport = (
    jobName: string,
    includeRelationships: boolean,
    includeInteractions: boolean,
    fileFormat: string,
    destination: string,
    whenToExport: string
  ) => {
    console.log('Quick Export Initiated:', {
      jobName,
      includeRelationships,
      includeInteractions,
      fileFormat,
      destination,
      whenToExport,
      // TODO: Include selected entity types/filters in the actual export initiation
    });
    // TODO: Call backend API to initiate quick export

    // Simulate creating a mock export job item
    const newMockExportJob: ExportJobListItem = {
        id: `quick-exp-${Date.now()}`,
        name: jobName || `Quick Export Job ${new Date().toLocaleString()}`,
        status: 'Yet to start', // Or 'Processing' depending on desired mock flow
        statusColor: 'gray', // Or 'blue'
        createdBy: 'search.user (Mock)',
        exportDestination: destination || 'Direct download',
        schedule: whenToExport === 'Export now' ? 'One time' : whenToExport || 'Unknown Schedule',
        // Simplify action icons for quick export mock
        actionIcons: ['view', 'download', 'copy'], // Assuming view/download/copy are common quick actions
        // You might want to add other details from the quick export config here
    };

    // In a real application, you'd send this config to a backend.
    // For mock, we can log it and maybe update a shared state if available.

    setIsQuickExportModalOpen(false);

     toast({
       description: `Quick export job \'${jobName}\' initiated.`, 
       duration: 3000,
     });

     // TODO: If a shared state or context for export jobs existed, you would add newMockExportJob to it here
     console.log("Mock Export Job created:", newMockExportJob);
  };

  const handleAdvancedExport = (includeRelationships: boolean, includeInteractions: boolean) => {
    setIsQuickExportModalOpen(false);
    const selectedEntityIds = selectedEntityTypesSummary.map(et => et.name.toLowerCase());
    setExportWizardInitialValues({
      initialSelectedEntityTypes: selectedEntityIds,
      initialIncludeRelationships: includeRelationships,
      initialIncludeInteractions: includeInteractions,
      initialFileFormat: 'CSV Flattened',
      initialDestination: 'Direct download',
      initialWhenToExport: 'Export now',
    });
    setTimeout(() => setIsExportWizardOpen(true), 0);
  };

  const handleExportCreated = (newExportJob: ExportJobListItem) => {
    setIsExportWizardOpen(false);
    toast({
      description: `Export job '${newExportJob.name}' created.`,
      duration: 3000,
    });
  };

  return (
    <>
      <div className="flex h-[calc(100vh-var(--header-height,60px))]">
        <SearchFilterPanel />
        <Separator orientation="vertical" className="h-full" />
        <main className="flex-1 p-6 overflow-y-auto bg-background flex flex-col">
          {/* Top bar with profile count, clear, action icons, and saved searches */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-foreground font-medium">
                {totalProfiles.toLocaleString()} <span className="text-muted-foreground font-normal">total profiles</span>
              </p>
              {appliedFilters.length > 0 && (
                <Button variant="link" className="p-0 h-auto text-primary text-xs font-semibold">
                  CLEAR
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary"
                title="Download"
                onClick={() => setIsQuickExportModalOpen(true)}
              >
                <CloudDownload className="h-6 w-6" />
                <span className="sr-only">Download</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary" 
                title="Quick Data Share" 
                onClick={() => setIsQuickShareModalOpen(true)}
              >
                <DatabaseZap className="h-6 w-6" />
                <span className="sr-only">Quick Data Share</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Save Search">
                <Save className="h-6 w-6" />
                <span className="sr-only">Save Search</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="More options">
                <MoreVertical className="h-6 w-6" />
                <span className="sr-only">More options</span>
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button variant="outline" size="sm" className="text-xs">
                <History className="mr-2 h-5 w-5" />
                SAVED & RECENT SEARCHES
              </Button>
            </div>
          </div>

          {/* Applied filters tags */}
          {appliedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {appliedFilters.map(filter => (
                <Badge
                  key={filter.id}
                  variant="outline"
                  className="bg-muted/60 text-foreground border-border py-1 px-3 text-xs font-normal flex items-center rounded-full hover:bg-muted"
                >
                  {filter.display}
                  <button className="ml-2 text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Tabs defaultValue="organizations" className="flex-grow flex flex-col mt-4">
            <TabsList className="bg-transparent p-0 h-auto border-b justify-start">
              {entityTabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-sm px-3 py-1.5 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none rounded-none text-muted-foreground hover:text-primary border-b-2 border-transparent"
                >
                  {tab.label} ({tab.count})
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex-grow mt-4 overflow-hidden">
              {entityTabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="h-full">
                  <SearchResultsTable items={searchResults} />
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </main>
      </div>
      <QuickDataShareModal
        isOpen={isQuickShareModalOpen}
        onClose={() => setIsQuickShareModalOpen(false)}
        onStartSharing={handleQuickShareStart}
        totalProfiles={totalProfiles}
        entityTypeSummaries={entityTypeSummariesForQuickShare}
        onAdvancedShareClick={handleAdvancedShare}
      />
      <QuickDataExportModal
        isOpen={isQuickExportModalOpen}
        onClose={() => setIsQuickExportModalOpen(false)}
        onQuickExport={handleQuickExport}
        onAdvancedExportClick={handleAdvancedExport}
        selectedEntityTypesSummary={selectedEntityTypesSummary}
        profilesCount={totalProfiles}
        relationshipsCount={totalRelationshipsCount}
        interactionsCount={totalInteractionsCount}
      />
      {isExportWizardOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="w-full h-full overflow-hidden">
            <QuickDataExportWizard
              isOpen={true}
              onClose={() => setIsExportWizardOpen(false)}
              onExportCreated={handleExportCreated}
              {...exportWizardInitialValues}
            />
          </div>
        </div>
      )}
      {isShareWizardOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="w-full h-full overflow-hidden">
            <QuickDataShareWizard
              isOpen={true}
              onClose={() => setIsShareWizardOpen(false)}
              onShareCreated={() => setIsShareWizardOpen(false)}
              originPage="phase1"
              initialSelectedEntityTypes={shareWizardInitialValues.initialSelectedEntityTypes}
              initialIncludeRelationships={shareWizardInitialValues.initialIncludeRelationships}
              initialIncludeInteractions={shareWizardInitialValues.initialIncludeInteractions}
              initialDatasetName={shareWizardInitialValues.initialDatasetName}
              initialDescription={shareWizardInitialValues.initialDescription}
              initialTarget={shareWizardInitialValues.initialTarget}
              hideSelectDataTypesStep={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
    
