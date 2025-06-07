'use client';

import type { EntityTypeConfig, ConfigurableDataCategory, SelectedAttribute, SampleProfile, DataCategoryType, SelectedDataType } from "@/lib/types"; // Added SelectedDataType
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Edit, Info, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// We will use an adapted attribute sidebar for export
import AttributesSidebar from "@/components/data-share/create-data-share-wizard/attributes-sidebar"; // Import the shared attributes sidebar
import PreviewDataSidebar from "@/components/data-share/create-data-share-wizard/preview-data-sidebar";
import React, { useState, useMemo, useEffect } from "react"; // Added useEffect

interface ConfigureExportDataStepProps {
  // Only receive the *selected* top-level types
  selectedDataTypes: SelectedDataType[];
  // Receive the full configuration objects for selected categories
  entityTypesConfig: EntityTypeConfig[];
  relationshipTypesConfig: ConfigurableDataCategory[];
  interactionTypesConfig: ConfigurableDataCategory[];
  otherDataTypesConfig: ConfigurableDataCategory[];
  // Handlers to update the configuration in the parent wizard component
  onEntityTypeToggle: (entityTypeId: string) => void;
  onRelationshipTypeToggle: (relationshipId: string) => void;
  onInteractionTypeToggle: (interactionId: string) => void;
  onOtherDataTypeToggle: (otherDataTypeId: string) => void;
  onAttributesChange: (itemId: string, category: DataCategoryType, updatedAttributes: SelectedAttribute[]) => void;
  // Keep getSampleData if sample preview is needed
  getSampleData: (itemId: string, category: DataCategoryType) => SampleProfile[];
  showAllTabs?: boolean;
}

export default function ConfigureExportDataStep({
  selectedDataTypes,
  entityTypesConfig,
  relationshipTypesConfig,
  interactionTypesConfig,
  otherDataTypesConfig,
  onEntityTypeToggle,
  onRelationshipTypeToggle,
  onInteractionTypeToggle,
  onOtherDataTypeToggle,
  onAttributesChange,
  getSampleData,
  showAllTabs,
}: ConfigureExportDataStepProps) {
  const [isAttributesSidebarOpen, setIsAttributesSidebarOpen] = useState(false); // State for attribute sidebar
  const [activeItemForAttributes, setActiveItemForAttributes] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null); // Item for attribute sidebar
  const [currentTab, setCurrentTab] = useState<DataCategoryType | string>('entity'); // Allow string for initial empty state
  const [isPreviewSidebarOpen, setIsPreviewSidebarOpen] = useState(false); // State for preview sidebar
  const [activeItemForSamplePreview, setActiveItemForSamplePreview] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null); // Item for sample preview

   // Modify the availableTabs logic to only show selected data types
  const availableTabs = useMemo(() => {
    if (showAllTabs) {
      return [
        { value: 'entity', label: 'Entity types', items: entityTypesConfig },
        { value: 'relationship', label: 'Relationships', items: relationshipTypesConfig },
        { value: 'interaction', label: 'Interactions', items: interactionTypesConfig },
        { value: 'other', label: 'Other data types', items: otherDataTypesConfig },
      ];
    }
    const tabs = [];
    if (selectedDataTypes.find(dt => dt.id === 'entities' && dt.selected)) {
      tabs.push({ value: 'entity', label: 'Entity types', items: entityTypesConfig });
    }
    if (selectedDataTypes.find(dt => dt.id === 'relationships' && dt.selected)) {
      tabs.push({ value: 'relationship', label: 'Relationships', items: relationshipTypesConfig });
    }
    if (selectedDataTypes.find(dt => dt.id === 'interactions' && dt.selected)) {
      tabs.push({ value: 'interaction', label: 'Interactions', items: interactionTypesConfig });
    }
    if (selectedDataTypes.some(dt => 
      ['mergeTree', 'matchData', 'activityLog', 'workflowTasks'].includes(dt.id) && dt.selected
    )) {
      const selectedOtherConfig = otherDataTypesConfig.filter(item => 
        selectedDataTypes.some(dt => dt.id === item.id && dt.selected)
      );
      if (selectedOtherConfig.length > 0) {
        tabs.push({ value: 'other', label: 'Other data types', items: selectedOtherConfig });
      }
    }
    return tabs;
  }, [showAllTabs, selectedDataTypes, entityTypesConfig, relationshipTypesConfig, interactionTypesConfig, otherDataTypesConfig]);

  // Set initial tab when component mounts or when available tabs change
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.value === currentTab)) {
      setCurrentTab(availableTabs[0].value);
    }
    if (availableTabs.length === 0) {
      setCurrentTab(''); // Set to empty if no tabs are available
    }
  }, [availableTabs, currentTab]);

  const handleOpenAttributesSidebar = (itemId: string, category: DataCategoryType) => {
    let item: EntityTypeConfig | ConfigurableDataCategory | undefined;
    if (category === 'entity') {
      item = entityTypesConfig.find(et => et.id === itemId);
    } else if (category === 'relationship') {
      item = relationshipTypesConfig.find(rt => rt.id === itemId);
    } else if (category === 'interaction') {
      item = interactionTypesConfig.find(it => it.id === itemId);
    } else if (category === 'other') {
      item = otherDataTypesConfig.find(ot => ot.id === itemId);
    }

    if (item) {
      setActiveItemForAttributes(item);
      setIsAttributesSidebarOpen(true);
    }
  };

  const handleAttributesSidebarClose = () => {
    setIsAttributesSidebarOpen(false);
    setActiveItemForAttributes(null);
  };

  const handleAttributesSave = (itemId: string, category: DataCategoryType, updatedAttributes: SelectedAttribute[]) => {
      onAttributesChange(itemId, category, updatedAttributes); // Call the parent handler
  };

  // Prepare all configurable items for the AttributesSidebar dropdown
  const allConfigurableItems = useMemo(() => {
    return [
        ...entityTypesConfig.map(et => ({...et, category: 'entity' as DataCategoryType})), 
        ...relationshipTypesConfig.map(rt => ({...rt, category: 'relationship' as DataCategoryType})),
        ...interactionTypesConfig.map(it => ({...it, category: 'interaction' as DataCategoryType})),
        ...otherDataTypesConfig.map(ot => ({...ot, category: 'other' as DataCategoryType})),
    ];
  }, [entityTypesConfig, relationshipTypesConfig, interactionTypesConfig, otherDataTypesConfig]);

  // Handler for when an item is selected in the AttributesSidebar dropdown
  const handleAttributesSidebarItemChange = (itemId: string, category: DataCategoryType) => {
    const nextItem = allConfigurableItems.find(item => item.id === itemId && item.category === category);
    if (nextItem) {
        setActiveItemForAttributes(nextItem);
    }
  };

  // Helper to get all selected items across all categories
  const allSelectedItemsForSamplePreview = useMemo(() => [
    ...entityTypesConfig.filter(et => et.selected),
    ...relationshipTypesConfig.filter(rt => rt.selected),
    ...interactionTypesConfig.filter(it => it.selected),
    ...otherDataTypesConfig.filter(ot => ot.selected),
  ], [entityTypesConfig, relationshipTypesConfig, interactionTypesConfig, otherDataTypesConfig]);

  // Track if we want to show all selected items or just one
  const [showAllSelectedInPreview, setShowAllSelectedInPreview] = useState(false);

  // Handle opening sample preview for a single item
  const handleOpenSamplePreview = (item: EntityTypeConfig | ConfigurableDataCategory) => {
    setActiveItemForSamplePreview(item);
    setShowAllSelectedInPreview(false);
    setIsPreviewSidebarOpen(true);
  };

  // Handle opening sample preview for all selected items
  const handleOpenSamplePreviewAll = () => {
    setActiveItemForSamplePreview(null);
    setShowAllSelectedInPreview(true);
    setIsPreviewSidebarOpen(true);
  };

  const handleCloseSamplePreview = () => {
      setIsPreviewSidebarOpen(false);
      setActiveItemForSamplePreview(null);
  };

  const renderTabHeader = (
    category: DataCategoryType | string,
    items: (EntityTypeConfig | ConfigurableDataCategory)[]
  ) => {
    let title = '';
    let countText = '';

    // Find the corresponding top-level data type to get the label
    const topLevelDataType = selectedDataTypes.find(dt => dt.id === (category === 'entity' ? 'entities' : category + 's'));
    title = topLevelDataType?.name || 'Unknown Category';

    if (category === 'entity') {
      const totalSelectedProfiles = items
        .filter((item): item is EntityTypeConfig => item.selected && 'count' in item)
        .reduce((sum, item) => sum + item.count, 0);
      countText = `${totalSelectedProfiles.toLocaleString()} Profiles selected`;
    } else if (category === 'relationship') {
      const totalSelectedRelationships = items
        .filter((item): item is ConfigurableDataCategory => item.selected && 'count' in item)
        .reduce((sum, item) => sum + item.count, 0);
      countText = `${totalSelectedRelationships.toLocaleString()} Relationships selected`;
    } else if (category === 'interaction') {
      const totalSelectedInteractions = items
        .filter((item): item is ConfigurableDataCategory => item.selected && 'count' in item)
        .reduce((sum, item) => sum + item.count, 0);
      countText = `${totalSelectedInteractions.toLocaleString()} Interactions selected`;
    } else if (category === 'other') {
      const selectedOtherItems = items.filter(item => item.selected);
      const counts = selectedOtherItems.map(item => {
        const count = (item as any).count || 0;
        return `${count.toLocaleString()} ${item.name}`;
      });
      countText = counts.join(', ') || 'No other data types selected';
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          {category === 'relationship' && (
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
              Relationships among the selected entity profiles only
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div>The list displays only the relationships among the entities selected in the previous step. To add other relationships, go back to the previous step and include the relevant entity type.</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {category === 'interaction' && (
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
              Interactions in which any of the selected entity profiles are members.
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div>The list shows all interactions in which any of the entity types selected in the previous steps are members.</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <p className="text-lg font-semibold text-foreground mt-1">
            {countText}
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Filters Button (Adapt or remove if needed for export) */}
          {category !== 'other' && (
            <Button variant="outline" onClick={() => alert("Filters button clicked (Configure Export Data Step)")}> {/* Mock handler */}
              <ListFilter className="mr-2 h-4 w-4" /> Filters
            </Button>
          )}
           {/* View Sample Data Button (Keep if needed) */}
          <Button
            variant="outline"
            onClick={handleOpenSamplePreviewAll}
            disabled={!selectedDataTypes.some(dt => dt.id === (category === 'entity' ? 'entities' : category + 's') && dt.selected)}
          >
            <Eye className="mr-2 h-4 w-4" /> View Sample Data
          </Button>
        </div>
      </div>
    );
  };

  const renderTabContent = (category: DataCategoryType | string, items: (EntityTypeConfig | ConfigurableDataCategory)[]) => {
     if (items.length === 0) {
         return (
             <p className="text-muted-foreground text-sm text-center py-10">No {category} types defined or available for the current filters.</p>
         );
     }

     return (
         <ScrollArea className="flex-grow min-h-0">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="w-[50px]">
                   <Checkbox 
                     checked={items.every(item => item.selected)}
                     onCheckedChange={(checked) => {
                       items.forEach(item => {
                         if (category === 'entity') onEntityTypeToggle(item.id);
                         else if (category === 'relationship') onRelationshipTypeToggle(item.id);
                         else if (category === 'interaction') onInteractionTypeToggle(item.id);
                         else if (category === 'other') onOtherDataTypeToggle(item.id);
                       });
                     }}
                     title={`Select all ${category} types`}
                   />
                 </TableHead>
                 <TableHead>Type</TableHead>
                 {category === 'relationship' && <TableHead>Related entities</TableHead>}
                 {category === 'interaction' && <TableHead>Member types</TableHead>}
                 <TableHead className="text-right">Count</TableHead>
                 <TableHead>Selected Attributes</TableHead>
                 <TableHead className="w-[60px] text-right"><span className="sr-only">Actions</span></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {items.map((item: any) => (
                 <TableRow 
                   key={item.id} 
                   data-state={item.selected ? "selected" : ""}
                 >
                   <TableCell className="py-2">
                     <Checkbox
                       checked={item.selected}
                       onCheckedChange={() => {
                          if (selectedDataTypes.some(dt => dt.id === (category === 'entity' ? 'entities' : category + 's') && dt.selected)) {
                            if (category === 'entity') onEntityTypeToggle(item.id);
                            else if (category === 'relationship') onRelationshipTypeToggle(item.id);
                            else if (category === 'interaction') onInteractionTypeToggle(item.id);
                            else if (category === 'other') onOtherDataTypeToggle(item.id);
                          }
                       }}
                       aria-label={`Select ${item.name}`}
                       title={`Select ${item.name}`}
                     />
                   </TableCell>
                   <TableCell>
                     <div className="flex items-center justify-between w-full">
                       <span className="flex items-center">
                         {item.name}
                       </span>
                     </div>
                   </TableCell>
                   {category === 'relationship' && <TableCell className="text-muted-foreground">{item.relatedEntities}</TableCell>}
                   {category === 'interaction' && <TableCell className="text-muted-foreground">{item.memberTypes}</TableCell>}
                   <TableCell className="text-right text-muted-foreground py-2">
                     {item.count.toLocaleString()}
                   </TableCell>
                   <TableCell className="text-muted-foreground text-left py-2 flex items-center gap-1">
                     {item.totalAttributes > 0 ? `${item.selectedAttributesCount}/${item.totalAttributes}` : 'N/A'}
                     {item.totalAttributes > 0 && (
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => handleOpenAttributesSidebar(item.id, category as DataCategoryType)}
                         className="text-muted-foreground hover:text-primary focus:text-primary ml-1"
                         aria-label={`Edit attributes for ${item.name}`}
                         disabled={!selectedDataTypes.some(dt => dt.id === (category === 'entity' ? 'entities' : category + 's') && dt.selected)}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     )}
                   </TableCell>
                   <TableCell className="text-right py-2">
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => handleOpenSamplePreview(item)}
                       className="text-muted-foreground hover:text-primary focus:text-primary"
                       aria-label={`View sample data for ${item.name}`}
                     >
                       <Eye className="h-4 w-4" />
                     </Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </ScrollArea>
      );
  };

  return (
    <div className="flex flex-col h-full p-6 bg-background">
      <Tabs value={currentTab} className="flex-grow min-h-0 flex flex-col" onValueChange={(value) => setCurrentTab(value as DataCategoryType)}>
        <TabsList className="flex-shrink-0 bg-transparent p-0 h-auto border-b justify-start">
          {availableTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary pb-3.5 pt-0 mr-4 mb-[-1px] text-muted-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollArea className="flex-grow min-h-0">
          <div className="pt-6">
            {availableTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="m-0">
                {renderTabHeader(tab.value as DataCategoryType, tab.items)}
                {renderTabContent(tab.value as DataCategoryType, tab.items)}
              </TabsContent>
            ))}
          </div>
        </ScrollArea>
      </Tabs>

      {/* Attribute Selection Sidebar */}
      {isAttributesSidebarOpen && activeItemForAttributes && (
        <AttributesSidebar
          isOpen={isAttributesSidebarOpen}
          onClose={handleAttributesSidebarClose}
          items={allConfigurableItems}
          activeItem={{ id: activeItemForAttributes.id, category: activeItemForAttributes.category as DataCategoryType }}
          onAttributesChange={handleAttributesSave}
          onSave={handleAttributesSidebarClose}
          onActiveItemChange={handleAttributesSidebarItemChange}
        />
      )}

      {/* Sample Preview Sidebar */}
      {isPreviewSidebarOpen && (
        <PreviewDataSidebar
          isOpen={isPreviewSidebarOpen}
          onClose={() => {
            setIsPreviewSidebarOpen(false);
            setActiveItemForSamplePreview(null);
          }}
          selectedItems={(() => {
            // Get selected items from current tab only
            const currentTabItems = availableTabs.find(tab => tab.value === currentTab)?.items || [];
            return activeItemForSamplePreview
              ? [activeItemForSamplePreview]
              : currentTabItems.filter(item => item.selected);
          })()}
          getSampleData={getSampleData}
          initialCategory={currentTab as DataCategoryType}
        />
      )}

    </div>
  );
} 