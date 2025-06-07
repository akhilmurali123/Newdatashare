'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge'; // Not needed for export wizard header
// import { X } from 'lucide-react'; // Not needed for export wizard header
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Suspense } from 'react';

import type {
  SelectedDataType,
  EntityTypeConfig,
  ConfigurableDataCategory,
  SampleProfile,
  TargetOption,
  DataCategoryType,
  ExportJobListItem,
  SelectedAttribute // Import SelectedAttribute
} from '@/lib/types';

// Import initial data/types - some might be reused, some new for export
import {
  initialDataTypes,
  initialEntityTypes,
  initialRelationshipTypes,
  initialInteractionTypes,
  initialOtherDataTypesConfig,
  sampleOrganizationData,
  sampleProductData,
  sampleSupplierData,
  sampleRelationshipData,
  sampleInteractionData,
  sampleOtherData,
  targetOptions // Target options might be relevant for export destination
} from '@/lib/types';

// Import components for the four steps
import SelectExportCategoriesStep from './select-export-categories-step'; // Use this for the new first step
import ConfigureExportDataStep from './configure-export-data-step'; // New component for Step 2 (Detailed Config in Tabs)
import ReviewDatasetStep from '@/components/data-share/create-data-share-wizard/review-dataset-step'; // Reuse for Step 3
import ExportConfigurationStep from './export-configuration-step'; // Reuse for Step 4

// Import wizard-specific types and components
import { WIZARD_STEPS, ExportWizardProgressStep } from './types';
import ExportAttributeSelectionSidebar from './export-attribute-selection-sidebar';
import { X } from 'lucide-react';
import WizardProgressIndicator from '@/components/data-share/create-data-share-wizard/wizard-progress-indicator';
import ExportWizardProgressIndicator from './export-wizard-progress-indicator';
import type { ExportConfiguration } from './types';

interface CreateDataExportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onExportCreated?: (newExportJob: ExportJobListItem) => void;
  initialSelectedEntityTypes?: string[]; // Prop to receive pre-selected entity types
  initialIncludeRelationships?: boolean; // Whether to include relationships
  initialIncludeInteractions?: boolean; // Whether to include interactions
  initialFileFormat?: string; // Initial file format
  initialDestination?: string; // Initial destination
  initialWhenToExport?: string; // Initial export schedule
  flowType?: 'quick' | 'create'; // Add flowType prop to distinguish between quick export and create new export flows
}

function CreateDataExportWizardContent({ isOpen, onClose, onExportCreated, initialSelectedEntityTypes, initialIncludeRelationships, initialIncludeInteractions, initialFileFormat, initialDestination, initialWhenToExport, flowType }: CreateDataExportWizardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<ExportWizardProgressStep>(() => {
    const stepFromUrl = searchParams.get('step') as ExportWizardProgressStep;
    return stepFromUrl && WIZARD_STEPS.some(s => s.id === stepFromUrl) ? stepFromUrl : WIZARD_STEPS[0].id;
  });

  // Initialize export config with URL parameters and props
  const [exportConfig, setExportConfig] = useState<ExportConfiguration>(() => {
    const initialConfig: ExportConfiguration = {
      selectedDataTypes: JSON.parse(JSON.stringify(initialDataTypes)).map((dt: SelectedDataType) => ({
        ...dt,
        selected: false // All unselected by default
      })),
      entityTypes: JSON.parse(JSON.stringify(initialEntityTypes)).map((et: EntityTypeConfig) => ({
        ...et,
        // Always select organizations, suppliers, and products by default
        selected: ['organization', 'supplier', 'product'].includes(et.id)
      })),
      relationshipTypes: JSON.parse(JSON.stringify(initialRelationshipTypes)).map((rt: ConfigurableDataCategory) => ({
        ...rt,
        selected: false // Don't pre-select any relationships
      })),
      interactionTypes: JSON.parse(JSON.stringify(initialInteractionTypes)).map((it: ConfigurableDataCategory) => ({
        ...it,
        selected: false // Don't pre-select any interactions
      })),
      otherDataTypes: JSON.parse(JSON.stringify(initialOtherDataTypesConfig)).map((ot: ConfigurableDataCategory) => ({
        ...ot,
        selected: false // Don't pre-select any other data types
      })),
      jobName: 'Export organizations, suppliers, products data',
      dataWithChanges: 'all',
      fileFormat: initialFileFormat || 'CSV',
      destination: initialDestination || 'Direct download',
      whenToExport: initialWhenToExport || 'Export now',
    };

    // If coming from quick export with specific selections, only override relationships and interactions
    if (searchParams.get('step')) {
      // If relationships were selected in quick export, select all relationships
      if (initialIncludeRelationships) {
        initialConfig.relationshipTypes = initialConfig.relationshipTypes.map(rt => ({
          ...rt,
          selected: true
        }));
      }

      // If interactions were selected in quick export, select all interactions
      if (initialIncludeInteractions) {
        initialConfig.interactionTypes = initialConfig.interactionTypes.map(it => ({
          ...it,
          selected: true
        }));
      }

      // Note: We don't override entity types here anymore since we want to keep the default selection
    }

    return initialConfig;
  });

  // Update URL when step changes
  useEffect(() => {
    if (currentStep) {
      const url = new URL(window.location.href);
      url.searchParams.set('step', currentStep);
      window.history.replaceState({}, '', url.toString());
    }
  }, [currentStep]);

  // Function to update exportConfig state (passed down to configuration step)
  const handleExportConfigChange = useCallback((updates: Partial<ExportConfiguration>) => {
    setExportConfig(prevConfig => ({ ...prevConfig, ...updates }));
  }, []);

  // Handlers for toggling selection in Step 1 (Select Categories)
  const handleDataTypeToggle = useCallback((dataTypeId: string) => {
    setExportConfig(prevConfig => {
        const updatedSelectedDataTypes = prevConfig.selectedDataTypes.map(dt =>
            dt.id === dataTypeId ? { ...dt, selected: !dt.selected } : dt
        );

        // Optional: When a top-level category is deselected, deselect all its sub-items (entities, relationships, etc.)
        const deselectedType = prevConfig.selectedDataTypes.find(dt => dt.id === dataTypeId && !updatedSelectedDataTypes.find(udt => udt.id === dataTypeId)?.selected);

        let updatedEntityTypes = prevConfig.entityTypes;
        let updatedRelationshipTypes = prevConfig.relationshipTypes;
        let updatedInteractionTypes = prevConfig.interactionTypes;
        let updatedOtherDataTypes = prevConfig.otherDataTypes;

        if (deselectedType) {
            if (deselectedType.id === 'entities') {
                updatedEntityTypes = updatedEntityTypes.map(et => ({ ...et, selected: false, selectedAttributesCount: 0 }));
            } else if (deselectedType.id === 'relationships') {
                 updatedRelationshipTypes = updatedRelationshipTypes.map(rt => ({ ...rt, selected: false, selectedAttributesCount: 0 }));
            } else if (deselectedType.id === 'interactions') {
                 updatedInteractionTypes = updatedInteractionTypes.map(it => ({ ...it, selected: false, selectedAttributesCount: 0 }));
            } else if (deselectedType.id === 'other') {
                 // When the general 'other' category is deselected, deselect all its sub-items
                 updatedOtherDataTypes = updatedOtherDataTypes.map(ot => ({ ...ot, selected: false, selectedAttributesCount: 0 }));
            }
        }

        // Also update the selected status of individual items within otherDataTypes
        // if their corresponding top-level data type is toggled.
        if (['mergeTree', 'matchData', 'activityLog', 'workflowTasks'].includes(dataTypeId)) {
           updatedOtherDataTypes = updatedOtherDataTypes.map(odt => 
             odt.id === dataTypeId ? { ...odt, selected: updatedSelectedDataTypes.find(dt => dt.id === dataTypeId)?.selected ?? false } : odt
           );
        }

        return {
            ...prevConfig,
            selectedDataTypes: updatedSelectedDataTypes,
            entityTypes: updatedEntityTypes,
            relationshipTypes: updatedRelationshipTypes,
            interactionTypes: updatedInteractionTypes,
            otherDataTypes: updatedOtherDataTypes,
        };
    });
  }, []);


  // Handlers for toggling selection in Step 2 (Configure Data - within Tabs)
   const handleEntityTypeToggle = useCallback((entityTypeId: string) => {
     setExportConfig(prevConfig => ({
       ...prevConfig,
       entityTypes: prevConfig.entityTypes.map(et =>
         et.id === entityTypeId ? { ...et, selected: !et.selected } : et
       ),
     }));
   }, []);

    const handleRelationshipTypeToggle = useCallback((relationshipId: string) => {
       setExportConfig(prevConfig => ({
         ...prevConfig,
         relationshipTypes: prevConfig.relationshipTypes.map(rt =>
           rt.id === relationshipId ? { ...rt, selected: !rt.selected } : rt
         ),
       }));
     }, []);

    const handleInteractionTypeToggle = useCallback((interactionId: string) => {
         setExportConfig(prevConfig => ({
           ...prevConfig,
           interactionTypes: prevConfig.interactionTypes.map(it =>
             it.id === interactionId ? { ...it, selected: !it.selected } : it
           ),
         }));
       }, []);

    const handleOtherDataTypeToggle = useCallback((otherDataTypeId: string) => {
         setExportConfig(prevConfig => ({
           ...prevConfig,
           otherDataTypes: prevConfig.otherDataTypes.map(odt =>
             odt.id === otherDataTypeId ? { ...odt, selected: !odt.selected } : odt
           ),
         }));
       }, []);

    // Handler for attribute changes (called from the attribute sidebar)
    const handleAttributesChange = useCallback((itemId: string, category: DataCategoryType, updatedAttributes: SelectedAttribute[]) => {
         setExportConfig(prevConfig => {
             const categoryKey = `${category}Types` as keyof ExportConfiguration;
             // Ensure the key exists and is an array before mapping
             if (Array.isArray(prevConfig[categoryKey])) {
                 const updatedCategoryItems = (prevConfig[categoryKey] as (EntityTypeConfig | ConfigurableDataCategory)[]).map(item => {
                     if (item.id === itemId) {
                         const selectedCount = updatedAttributes.filter(attr => attr.selected).length;
                         // Update both attributes and selectedAttributesCount
                         return { ...item, attributes: updatedAttributes, selectedAttributesCount: selectedCount };
                     }
                     return item;
                 });
                 // Update the specific category array in the state
                 return { ...prevConfig, [categoryKey]: updatedCategoryItems as any }; // Use 'any' temporarily if types are complex
             }
             return prevConfig; // Return previous state if categoryKey is not valid
         });
     }, []);

    // getSampleData can likely be reused as is
    const getSampleDataCallback = useCallback((itemId: string, category: DataCategoryType): SampleProfile[] => {
         // This logic can likely be reused as it depends on the data structure
         if (category === 'entity') {
           if (itemId === 'organization') return sampleOrganizationData;
           if (itemId === 'product') return sampleProductData;
           if (itemId === 'supplier') return sampleSupplierData;
           // Add other entity types if needed
         }
         if (category === 'relationship') {
           return sampleRelationshipData;
         }
         if (category === 'interaction') {
           return sampleInteractionData;
         }
         if (category === 'other') {
           return sampleOtherData; // Or specific sample data if created e.g. sampleMergeTreeData
         }
         return [];
       }, []);

  const handleNext = () => {
    const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentStep === 'selectData') {
      if (!exportConfig.selectedDataTypes.some(dt => dt.selected)) return;
      setCurrentStep('configureData');
      return;
    }
    if (currentStep === 'configureData') {
      const hasSelectedItems = exportConfig.entityTypes.some(et => et.selected) ||
        exportConfig.relationshipTypes.some(rt => rt.selected) ||
        exportConfig.interactionTypes.some(it => it.selected) ||
        exportConfig.otherDataTypes.some(ot => ot.selected);
      if (!hasSelectedItems) {
        alert("Please select at least one item to continue.");
        return;
      }
      setCurrentStep('reviewDataset');
      return;
    }
    if (currentStep === 'reviewDataset') {
      setCurrentStep('configuration');
      return;
    }
  };

  const handleBack = () => {
    if (currentStep === 'configureData') {
      setCurrentStep('selectData');
      return;
    }
    if (currentStep === 'reviewDataset') {
      setCurrentStep('configureData');
      return;
    }
    if (currentStep === 'configuration') {
      setCurrentStep('reviewDataset');
      return;
    }
  };

  const handleSave = () => {
    console.log("Export configuration saved (mock):", exportConfig);
    alert("Export configuration saved (mock).");
    // TODO: Implement save logic (e.g., save to user preferences or draft exports)
  };

  const handleExport = () => {
    console.log("Initiating export with config:", exportConfig);
    if (onExportCreated) {
        const newMockExportJob: ExportJobListItem = {
             id: `exp-${Date.now()}`,
             name: exportConfig.jobName || `New Export Job ${new Date().toLocaleString()}`,
             status: 'Yet to start',
             statusColor: 'gray',
             createdBy: 'Current User (Mock)',
             exportDestination: exportConfig.destination || 'Unknown Destination',
             schedule: exportConfig.whenToExport === 'Export now' ? 'One time' : exportConfig.whenToExport || 'Unknown Schedule',
             actionIcons: ['view', 'play', 'download', 'copy'],
             summary: {
                  dataTypes: exportConfig.selectedDataTypes.filter(dt => dt.selected).map(dt => dt.name).join(', ') || 'No data types selected',
             },
        };
        onExportCreated(newMockExportJob);
        toast({
          title: "Export job started",
          description: "Your export job is now underway and will be ready in about 34 minutes. We'll notify you once it's done.",
          action: (
            <Button variant="outline" onClick={() => router.push("/phase1?tab=data-export")} className="mt-2">View export jobs</Button>
          ),
          duration: 10000,
        });
    }
    onClose();
  };

  // Determine if the 'Continue' button should be disabled
  const isContinueDisabled = useMemo(() => {
    if (currentStep === 'selectData') {
      // Disable Continue if no data types are selected in the first step
      return !exportConfig.selectedDataTypes.some(dt => dt.selected);
    }
    if (currentStep === 'reviewDataset') {
      // Disable Continue if no specific items within the selected categories are selected
      const anyItemSelected = exportConfig.entityTypes.some(et => et.selected) ||
                             exportConfig.relationshipTypes.some(rt => rt.selected) ||
                             exportConfig.interactionTypes.some(it => it.selected) ||
                             exportConfig.otherDataTypes.some(ot => ot.selected);
      return !anyItemSelected;
    }
    return false; // Enable by default for other steps
  }, [currentStep, exportConfig]);

  // Add a flag to determine if we're in quick flow mode
  const isQuickFlow = searchParams.get('openWizard') === 'true' && searchParams.get('step') === 'configureData';

  const renderStepContent = () => {
    if (isQuickFlow && currentStep === WIZARD_STEPS[0].id) {
      // If in quick flow and on the first step, jump to configureData
      setCurrentStep('configureData');
      return null;
    }
    switch (currentStep) {
      case 'selectData':
        return (
          <SelectExportCategoriesStep
            dataTypes={exportConfig.selectedDataTypes}
            onDataTypeToggle={handleDataTypeToggle}
          />
        );
      case 'configureData':
        const selectedEntityConfig = exportConfig.selectedDataTypes.find(dt => dt.id === 'entities' && dt.selected) ? exportConfig.entityTypes : [];
        const selectedRelationshipConfig = exportConfig.selectedDataTypes.find(dt => dt.id === 'relationships' && dt.selected) ? exportConfig.relationshipTypes : [];
        const selectedInteractionConfig = exportConfig.selectedDataTypes.find(dt => dt.id === 'interactions' && dt.selected) ? exportConfig.interactionTypes : [];
        const selectedOtherDataConfig = exportConfig.selectedDataTypes.some(dt =>
          ['mergeTree', 'matchData', 'activityLog', 'workflowTasks'].includes(dt.id) && dt.selected
        ) ? exportConfig.otherDataTypes : [];
        return (
          <ConfigureExportDataStep
            selectedDataTypes={exportConfig.selectedDataTypes}
            entityTypesConfig={selectedEntityConfig}
            relationshipTypesConfig={selectedRelationshipConfig}
            interactionTypesConfig={selectedInteractionConfig}
            otherDataTypesConfig={selectedOtherDataConfig}
            onEntityTypeToggle={handleEntityTypeToggle}
            onRelationshipTypeToggle={handleRelationshipTypeToggle}
            onInteractionTypeToggle={handleInteractionTypeToggle}
            onOtherDataTypeToggle={handleOtherDataTypeToggle}
            onAttributesChange={handleAttributesChange}
            getSampleData={getSampleDataCallback}
          />
        );
      case 'reviewDataset':
        return (
          <ReviewDatasetStep
            config={{
              selectedDataTypes: exportConfig.selectedDataTypes,
              entityTypes: exportConfig.entityTypes,
              relationshipTypes: exportConfig.relationshipTypes,
              interactionTypes: exportConfig.interactionTypes,
              otherDataTypes: exportConfig.otherDataTypes,
              datasetName: exportConfig.jobName || 'New Export',
              description: '',
              target: exportConfig.destination || ''
            }}
            getSampleData={getSampleDataCallback}
          />
        );
      case 'configuration':
        return (
          <ExportConfigurationStep
            config={exportConfig}
            onConfigChange={handleExportConfigChange}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // Determine if it's the last step in the configureAndReview phase
  const isLastStep = currentStep === WIZARD_STEPS[WIZARD_STEPS.length - 1].id;

  // Find the current step object to get its label (only for configureAndReview phase)
  const currentStepObject = WIZARD_STEPS.find(step => step.id === currentStep);
  const wizardTitle = currentStepObject?.label
    ? `${flowType === 'quick' ? 'Quick Export' : 'Create New Export'} - ${currentStepObject.label}`
    : flowType === 'quick' ? 'Quick Export' : 'Create New Export';


  return (
    <div className="flex flex-col h-full w-full bg-background shadow-2xl">
      {/* Sticky header */}
      <div className="p-4 border-b flex flex-row items-center justify-between shrink-0 relative h-[70px] bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-8 h-8"
          >
            <X className="h-5 w-5" />
             <span className="sr-only">Close</span>
          </Button>
          {/* Use the step label in the title */}
          <span className="text-lg font-semibold">
            { wizardTitle }
          </span>
        </div>
        {/* Progress Indicator */}
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
           <ExportWizardProgressIndicator currentStep={currentStep} steps={[...WIZARD_STEPS]} />
         </div>
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-2">
          {/* Buttons for Configure and Review phases */}
          {currentStep !== WIZARD_STEPS[0].id && (
             <Button variant="outline" onClick={handleBack} className="px-6 py-2 h-auto">Back</Button>
          )}
          <Button variant="outline" onClick={handleSave} className="px-6 py-2 h-auto">Save</Button>
          {isLastStep ? (
            <Button onClick={handleExport} disabled={isContinueDisabled} className="px-6 py-2 h-auto">Export</Button>
          ) : (
            <Button onClick={handleNext} disabled={isContinueDisabled} className="px-6 py-2 h-auto">Continue</Button>
          )}
        </div>
      </div>
      {/* Main wizard content */}
      <div className="flex-grow overflow-y-auto bg-background p-6">
        {renderStepContent()}
      </div>
      {/* The Attribute Selection Sidebar component is rendered here, its visibility is controlled by state within ConfigureExportDataStep */}
      {/* Ensure ExportAttributeSelectionSidebar is fixed/created correctly */}
      {/* It needs to be here at the wizard level to overlay the entire wizard content */}
      {/* If you manually fixed export-attribute-selection-sidebar.tsx, uncomment this */}
      {/* <ExportAttributeSelectionSidebar
         isOpen={isAttributesSidebarOpen} // Need state here or pass from ConfigureExportDataStep
         onClose={handleAttributesSidebarClose} // Need handler here or pass from ConfigureExportDataStep
         item={activeItemForAttributes} // Need state here or pass from ConfigureExportDataStep
         onAttributesChange={handleAttributesSave} // Pass handler down to sidebar
      /> */}
       {/* Temporarily rendered by ConfigureExportDataStep if uncommented there */}

       {/* Footer removed */}

    </div>
  );
}

export default function CreateDataExportWizard(props: CreateDataExportWizardProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateDataExportWizardContent {...props} />
    </Suspense>
  );
}