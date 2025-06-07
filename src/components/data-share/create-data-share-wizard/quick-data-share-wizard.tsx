import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

import type {
  SelectedDataType,
  EntityTypeConfig,
  ConfigureProgressStep,
  DataShareConfiguration,
  SampleProfile,
  ConfigurableDataCategory,
  TargetOption,
  ActiveDataShare,
  DataCategoryType
} from '@/lib/types';
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
  targetOptions
} from '@/lib/types'; 

import SelectDataTypesStep from './select-data-types-step';
import ConfigureDataStep from './configure-data-step';
import ReviewDatasetStep from './review-dataset-step';
import WizardProgressIndicator from './wizard-progress-indicator';
import ShareDataDialog from '../share-data-dialog'; 

interface QuickDataShareWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onShareCreated: (newShare: ActiveDataShare) => void;
  originPage: 'phase1' | 'ai-agent-flow';
  initialSelectedEntityTypes?: string[];
  initialIncludeRelationships?: boolean;
  initialIncludeInteractions?: boolean;
  initialDatasetName?: string;
  initialDescription?: string;
  initialTarget?: string;
  hideSelectDataTypesStep?: boolean;
}

export interface ActiveItemForModal {
  id: string;
  category: DataCategoryType;
}

export default function QuickDataShareWizard({ isOpen, onClose, onShareCreated, originPage, initialSelectedEntityTypes, initialIncludeRelationships, initialIncludeInteractions, initialDatasetName, initialDescription, initialTarget, hideSelectDataTypesStep }: QuickDataShareWizardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const showPreview = searchParams.get('showPreview') === 'true';
  const initialStepFromUrl = searchParams.get('step');

  // Dynamically build steps based on hideSelectDataTypesStep
  const WIZARD_PROGRESS_STEPS = hideSelectDataTypesStep
    ? [
        { id: 'selectData' as ConfigureProgressStep, label: 'Configure data' },
        { id: 'reviewDataset' as ConfigureProgressStep, label: 'Review dataset' },
      ]
    : [
        { id: 'selectDataTypes' as ConfigureProgressStep, label: 'Select data types' },
        { id: 'selectData' as ConfigureProgressStep, label: 'Configure data' },
        { id: 'reviewDataset' as ConfigureProgressStep, label: 'Review dataset' },
      ];

  // Set initial step based on hideSelectDataTypesStep
  const [progressStep, setProgressStep] = useState<ConfigureProgressStep>(() => {
    if (hideSelectDataTypesStep) return 'selectData';
    const stepFromUrl = searchParams.get('step') as ConfigureProgressStep;
    return stepFromUrl && WIZARD_PROGRESS_STEPS.some(s => s.id === stepFromUrl) ? stepFromUrl : 'selectDataTypes';
  });
  
  const [dataConfig, setDataConfig] = useState<DataShareConfiguration>(() => {
    // Get parameters from URL or props
    const preselectEntities = initialSelectedEntityTypes || searchParams.get('preselectEntities')?.split(',') || ['organization', 'supplier', 'product'];
    const includeRelationships = initialIncludeRelationships ?? (searchParams.get('includeRelationships') === 'true');
    const includeInteractions = initialIncludeInteractions ?? (searchParams.get('includeInteractions') === 'true');
    const datasetName = initialDatasetName || searchParams.get('datasetName') || '';
    const description = initialDescription || searchParams.get('description') || '';
    const target = initialTarget || searchParams.get('target') || '';

    // Determine selectedDataTypes based on flow
    let selectedDataTypes: SelectedDataType[];
    if (hideSelectDataTypesStep) {
      // In search modal, preselect based on initial values if provided
      selectedDataTypes = JSON.parse(JSON.stringify(initialDataTypes)).map((dt: SelectedDataType) => {
        if (dt.id === 'entities') return { ...dt, selected: preselectEntities.length > 0 };
        if (dt.id === 'relationships') return { ...dt, selected: !!includeRelationships };
        if (dt.id === 'interactions') return { ...dt, selected: !!includeInteractions };
        // Other data types always unselected by default
        return { ...dt, selected: false };
      });
    } else {
      // In Create New flow, all unselected by default
      selectedDataTypes = JSON.parse(JSON.stringify(initialDataTypes)).map((dt: SelectedDataType) => ({
        ...dt,
        selected: false
      }));
    }

    const initialConfig: DataShareConfiguration = {
      selectedDataTypes: JSON.parse(JSON.stringify(initialDataTypes)).map((dt: SelectedDataType) => ({
        ...dt,
        // Preselect entities, relationships, interactions, and match/merge data
        selected: ['entities', 'relationships', 'interactions', 'mergeTree', 'matchData'].includes(dt.id)
      })),
      entityTypes: JSON.parse(JSON.stringify(initialEntityTypes)).map((et: EntityTypeConfig) => ({
        ...et,
        // Preselect organizations, suppliers, and products
        selected: ['organization', 'supplier', 'product'].includes(et.id)
      })),
      relationshipTypes: JSON.parse(JSON.stringify(initialRelationshipTypes)).map((rt: ConfigurableDataCategory) => ({
        ...rt,
        // Preselect all relationship types
        selected: true
      })),
      interactionTypes: JSON.parse(JSON.stringify(initialInteractionTypes)).map((it: ConfigurableDataCategory) => ({
        ...it,
        // Preselect all interaction types
        selected: true
      })),
      otherDataTypes: JSON.parse(JSON.stringify(initialOtherDataTypesConfig)).map((ot: ConfigurableDataCategory) => ({
        ...ot,
        // Preselect merge tree and match data
        selected: ['mergeTree', 'matchData'].includes(ot.id)
      })),
      datasetName: datasetName || '',
      description: description,
      target: target || (targetOptions[0]?.id || '')
    };

    return initialConfig;
  });

  const [isShareDataDialogOpen, setIsShareDataDialogOpen] = useState(false);

  // Set initial step only once when the wizard opens
  useEffect(() => {
    if (isOpen) {
      const initialStepFromUrl = searchParams.get('step');
      const showPreview = searchParams.get('showPreview') === 'true';
      if (hideSelectDataTypesStep) {
        setProgressStep('selectData');
        const url = new URL(window.location.href);
        url.searchParams.set('step', 'configureData');
        window.history.replaceState({}, '', url.toString());
      } else if (searchParams.get('openWizard') === 'true' && searchParams.get('step') === 'configureData') {
        setProgressStep('selectData');
      } else if (initialStepFromUrl === 'reviewDataset') {
        setProgressStep('reviewDataset');
      } else if (showPreview) {
        setProgressStep('reviewDataset');
      } else {
        setProgressStep('selectDataTypes');
      }
    }
  }, [isOpen, hideSelectDataTypesStep]);

  // Separate effect for URL updates
  useEffect(() => {
    if (progressStep) {
      const url = new URL(window.location.href);
      url.searchParams.set('step', progressStep === 'selectData' ? 'configureData' : progressStep);
      window.history.replaceState({}, '', url.toString());
    }
  }, [progressStep]);

  const handleDataTypeToggle = (dataTypeId: string) => {
    setDataConfig(prev => {
      const newSelectedDataTypes = prev.selectedDataTypes.map(dt =>
        dt.id === dataTypeId ? { ...dt, selected: !dt.selected } : dt
      );

      const isSelected = newSelectedDataTypes.find(dt => dt.id === dataTypeId)?.selected || false;

      let updatedEntityTypes = prev.entityTypes;
      let updatedRelationshipTypes = prev.relationshipTypes;
      let updatedInteractionTypes = prev.interactionTypes;
      let updatedOtherDataTypes = prev.otherDataTypes;

      // Propagate selection to individual items based on the *new* top-level selected state
      if (dataTypeId === 'entities') {
        updatedEntityTypes = prev.entityTypes.map(et => ({ ...et, selected: isSelected ? et.selected : false }));
      } else if (dataTypeId === 'relationships') {
        updatedRelationshipTypes = prev.relationshipTypes.map(rt => ({ ...rt, selected: isSelected ? rt.selected : false }));
      } else if (dataTypeId === 'interactions') {
        updatedInteractionTypes = prev.interactionTypes.map(it => ({ ...it, selected: isSelected ? it.selected : false }));
      } else if (['mergeTree', 'matchData', 'activityLog', 'workflowTasks'].includes(dataTypeId)) {
        updatedOtherDataTypes = prev.otherDataTypes.map(ot => 
          ot.id === dataTypeId ? { ...ot, selected: isSelected } : ot
        );
      }

      return {
        ...prev,
        selectedDataTypes: newSelectedDataTypes,
        entityTypes: updatedEntityTypes,
        relationshipTypes: updatedRelationshipTypes,
        interactionTypes: updatedInteractionTypes,
        otherDataTypes: updatedOtherDataTypes,
        datasetName: prev.datasetName,
        description: prev.description,
        target: prev.target
      };
    });
  };

  const handleEntityTypeToggle = (entityTypeId: string) => {
    setDataConfig(prev => ({
      ...prev,
      entityTypes: prev.entityTypes.map(et =>
        et.id === entityTypeId ? { ...et, selected: !et.selected } : et
      )
    }));
  };

  const handleRelationshipTypeToggle = (relationshipId: string) => {
    setDataConfig(prev => ({
      ...prev,
      relationshipTypes: prev.relationshipTypes.map(rt =>
        rt.id === relationshipId ? { ...rt, selected: !rt.selected } : rt
      )
    }));
  };

  const handleInteractionTypeToggle = (interactionId: string) => {
    setDataConfig(prev => ({
      ...prev,
      interactionTypes: prev.interactionTypes.map(it =>
        it.id === interactionId ? { ...it, selected: !it.selected } : it
      )
    }));
  };

  const handleOtherDataTypeToggle = (otherDataTypeId: string) => {
    setDataConfig(prev => ({
      ...prev,
      otherDataTypes: prev.otherDataTypes.map(ot =>
        ot.id === otherDataTypeId ? { ...ot, selected: !ot.selected } : ot
      )
    }));
  };
  
  const handleAttributesChange = (itemId: string, category: DataCategoryType, updatedAttributes: any[]) => {
    setDataConfig(prev => {
      const newConfig = { ...prev };
      const newSelectedCount = updatedAttributes.filter(a => a.selected).length;
      
      switch (category) {
        case 'entity':
          newConfig.entityTypes = newConfig.entityTypes.map(et =>
            et.id === itemId 
            ? { ...et, attributes: updatedAttributes, selectedAttributesCount: newSelectedCount } 
            : et
          );
          break;
        case 'relationship':
          newConfig.relationshipTypes = newConfig.relationshipTypes.map(rt =>
            rt.id === itemId 
            ? { ...rt, attributes: updatedAttributes, selectedAttributesCount: newSelectedCount } 
            : rt
          );
          break;
        case 'interaction':
          newConfig.interactionTypes = newConfig.interactionTypes.map(it =>
            it.id === itemId 
            ? { ...it, attributes: updatedAttributes, selectedAttributesCount: newSelectedCount } 
            : it
          );
          break;
        case 'other':
          newConfig.otherDataTypes = newConfig.otherDataTypes.map(ot =>
            ot.id === itemId
            ? { ...ot, attributes: updatedAttributes, selectedAttributesCount: newSelectedCount }
            : ot
          );
          break;
      }
      return newConfig;
    });
  };

  const getSampleDataCallback = useCallback((itemId: string, category: DataCategoryType): SampleProfile[] => {
    if (category === 'entity') {
      if (itemId === 'organization') return sampleOrganizationData;
      if (itemId === 'product') return sampleProductData;
      if (itemId === 'supplier') return sampleSupplierData;
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

  const handleSelectTypesNext = () => {
    setProgressStep('selectData');
    const basePath = originPage === 'ai-agent-flow' ? '/ai-agent-flow' : '/phase1';
    router.push(`${basePath}?openWizard=true&step=configureData`);
  };

  const handleConfigureContinue = () => {
    // First check if any items are selected
    const hasSelectedItems = dataConfig.entityTypes.some(et => et.selected) ||
                           dataConfig.relationshipTypes.some(rt => rt.selected) ||
                           dataConfig.interactionTypes.some(it => it.selected) ||
                           dataConfig.otherDataTypes.some(ot => ot.selected);

    if (!hasSelectedItems) {
      alert("Please select at least one item to continue.");
      return;
    }

    setProgressStep('reviewDataset');
    const basePath = originPage === 'ai-agent-flow' ? '/ai-agent-flow' : '/phase1';
    router.replace(`${basePath}?openWizard=true&step=reviewDataset`, { scroll: false });
  };
  
  const handleReviewBack = () => {
    setProgressStep('selectData');
    const basePath = originPage === 'ai-agent-flow' ? '/ai-agent-flow' : '/phase1';
    router.push(`${basePath}?openWizard=true&step=configureData`);
  };

  const handleConfigureBack = () => {
    setProgressStep('selectDataTypes');
    const basePath = originPage === 'ai-agent-flow' ? '/ai-agent-flow' : '/phase1';
    router.push(`${basePath}?openWizard=true&step=selectDataTypes`);
  };

  const handleSave = () => {
    alert("Dataset configuration saved (mock).");
  };

  const handleOpenShareDialog = () => {
    setIsShareDataDialogOpen(true);
  };

  const handleStartSharing = (name: string, description: string, target: TargetOption) => {
    const newShare: ActiveDataShare = {
      id: Date.now().toString(),
      name,
      description,
      createdBy: "current.user", 
      shareDestination: target.name,
      sharingStatus: 'Active',
      summary: { 
        profiles: dataConfig.entityTypes.filter(et => et.selected).reduce((sum, et) => sum + et.count, 0),
        relationships: dataConfig.relationshipTypes.filter(rt => rt.selected).reduce((sum, rt) => sum + rt.count, 0),
        interactions: dataConfig.interactionTypes.filter(it => it.selected).reduce((sum, it) => sum + it.count, 0),
        otherData: dataConfig.otherDataTypes.filter(ot => ot.selected).reduce((sum, ot) => sum + ot.count, 0),
      }
    };
    onShareCreated(newShare);
    setIsShareDataDialogOpen(false);
    toast({
      title: "Data sharing activated",
      description: "You can manage it from the data share page",
      action: (
        <Button variant="outline" onClick={() => router.push("/phase1?tab=data-share")} className="mt-2">View data shares</Button>
      ),
      duration: 5000,
    });
    onClose(); 
  };

  const renderHeaderActions = () => {
    switch (progressStep) {
      case 'selectDataTypes':
        if (hideSelectDataTypesStep) return null;
        return (
          <Button
            onClick={handleSelectTypesNext}
            disabled={!dataConfig.selectedDataTypes.some(dt => dt.selected)}
          >
            Next
          </Button>
        );
      case 'selectData':
        return (
          <div className="flex items-center space-x-2">
            {!hideSelectDataTypesStep && (
              <Button variant="outline" onClick={handleConfigureBack} className="px-6 py-2 h-auto">Back</Button>
            )}
            <Button
              onClick={handleConfigureContinue}
              disabled={!dataConfig.entityTypes.some(et => et.selected) &&
                         !dataConfig.relationshipTypes.some(rt => rt.selected) &&
                         !dataConfig.interactionTypes.some(it => it.selected) &&
                         !dataConfig.otherDataTypes.some(ot => ot.selected)}
            >
              Continue
            </Button>
          </div>
        );
      case 'reviewDataset':
        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleReviewBack} className="px-6 py-2 h-auto">Back</Button>
            <Button variant="outline" onClick={handleSave} className="px-6 py-2 h-auto">Save</Button>
            <Button onClick={handleOpenShareDialog}>Share</Button>
          </div>
        );
      default:
        return <div className="w-[88px]" />;
    }
  };

  const renderContent = () => {
    switch (progressStep) {
      case 'selectDataTypes':
        if (hideSelectDataTypesStep) return null;
        return (
          <SelectDataTypesStep
            dataTypes={dataConfig.selectedDataTypes}
            onDataTypeToggle={handleDataTypeToggle}
          />
        );
      case 'selectData':
        return (
          <ConfigureDataStep
            selectedDataTypes={dataConfig.selectedDataTypes}
            entityTypes={dataConfig.entityTypes}
            relationshipTypes={dataConfig.relationshipTypes}
            interactionTypes={dataConfig.interactionTypes}
            otherDataTypes={dataConfig.otherDataTypes}
            onEntityTypeToggle={handleEntityTypeToggle}
            onRelationshipTypeToggle={handleRelationshipTypeToggle}
            onInteractionTypeToggle={handleInteractionTypeToggle} 
            onOtherDataTypeToggle={handleOtherDataTypeToggle}
            onAttributesChange={handleAttributesChange}
            getSampleData={getSampleDataCallback}
            showAllTabs={true}
          />
        );
      case 'reviewDataset':
        return (
          <ReviewDatasetStep
            config={dataConfig}
            getSampleData={getSampleDataCallback}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-popover shadow-2xl">
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
          <span className="text-lg font-semibold">
            {showPreview ? 'Preview Data Share' : 'Create new data share'}
          </span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <WizardProgressIndicator currentStep={progressStep} steps={WIZARD_PROGRESS_STEPS} />
        </div>
        <div className="flex items-center">
          {showPreview ? (
            <Button
              onClick={onClose}
              className="bg-foreground hover:bg-foreground/90 text-background px-6 py-2 h-auto"
            >
              Close Preview
            </Button>
          ) : (
            renderHeaderActions()
          )}
        </div>
      </div>
      {/* Main wizard content */}
      <div className="flex-grow overflow-y-auto bg-background">
        {renderContent()}
      </div>
      {/* Only show share dialog in review step */}
      {!showPreview && progressStep === 'reviewDataset' && (
        <ShareDataDialog
          isOpen={isShareDataDialogOpen}
          onClose={() => {
            setIsShareDataDialogOpen(false);
          }}
          onStartSharing={handleStartSharing}
          initialDatasetName={dataConfig.datasetName}
          initialDescription={dataConfig.description}
          initialTargetId={dataConfig.target}
        />
      )}
    </div>
  );
} 