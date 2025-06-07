import type { EntityTypeConfig, ConfigurableDataCategory, SelectedAttribute, SampleProfile, DataCategoryType, SelectedDataType } from "@/lib/types";
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
import AttributesSidebar from "./attributes-sidebar";
import PreviewDataSidebar from "./preview-data-sidebar";
import React, { useState, useMemo, useEffect } from "react";

interface ConfigureDataStepProps {
  selectedDataTypes: SelectedDataType[];
  entityTypes: EntityTypeConfig[];
  relationshipTypes: ConfigurableDataCategory[];
  interactionTypes: ConfigurableDataCategory[];
  otherDataTypes: ConfigurableDataCategory[];
  onEntityTypeToggle: (entityTypeId: string) => void;
  onRelationshipTypeToggle: (relationshipId: string) => void;
  onInteractionTypeToggle: (interactionId: string) => void;
  onOtherDataTypeToggle: (otherDataTypeId: string) => void;
  onAttributesChange: (itemId: string, category: DataCategoryType, updatedAttributes: SelectedAttribute[]) => void;
  getSampleData: (itemId: string, category: DataCategoryType) => SampleProfile[];
  showAllTabs?: boolean;
}

export default function ConfigureDataStep({
  selectedDataTypes,
  entityTypes: entityTypesProp,
  relationshipTypes: relationshipTypesProp,
  interactionTypes: interactionTypesProp,
  otherDataTypes: otherDataTypesProp,
  onEntityTypeToggle,
  onRelationshipTypeToggle,
  onInteractionTypeToggle,
  onOtherDataTypeToggle,
  onAttributesChange,
  getSampleData,
  showAllTabs,
}: ConfigureDataStepProps) {
  console.log('ConfigureDataStep Props:');
  console.log('entityTypesProp:', entityTypesProp);
  console.log('relationshipTypesProp:', relationshipTypesProp);
  console.log('interactionTypesProp:', interactionTypesProp);
  console.log('otherDataTypesProp:', otherDataTypesProp);

  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [activeItemForAttributes, setActiveItemForAttributes] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);
  const [currentTab, setCurrentTab] = useState<DataCategoryType | string>('entity');
  const [isPreviewSidebarOpen, setIsPreviewSidebarOpen] = useState(false);
  const [activeItemForSamplePreview, setActiveItemForSamplePreview] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);

  const handleEntityTypeToggleInternal = (entityTypeId: string) => {
    onEntityTypeToggle(entityTypeId);
  };

  const handleRelationshipTypeToggleInternal = (relationshipId: string) => {
    onRelationshipTypeToggle(relationshipId);
  };

  const handleInteractionTypeToggleInternal = (interactionId: string) => {
    onInteractionTypeToggle(interactionId);
  };
  
  const handleOtherDataTypeToggleInternal = (otherDataTypeId: string) => {
    onOtherDataTypeToggle(otherDataTypeId);
  };

  const handleOpenAttributesModal = (itemId: string, category: DataCategoryType) => {
    let item: EntityTypeConfig | ConfigurableDataCategory | undefined;
    if (category === 'entity') {
      item = entityTypesProp.find(et => et.id === itemId);
    } else if (category === 'relationship') {
      item = relationshipTypesProp.find(rt => rt.id === itemId);
    } else if (category === 'interaction') {
      item = interactionTypesProp.find(it => it.id === itemId);
    } else if (category === 'other') {
      item = otherDataTypesProp.find(ot => ot.id === itemId);
    }

    if (item) {
      setActiveItemForAttributes(item);
      setIsAttributesModalOpen(true);
    }
  };

  const handleAttributesSave = () => {
    setIsAttributesModalOpen(false);
    setActiveItemForAttributes(null);
  };

  const handleInternalAttributesChange = (itemId: string, category: DataCategoryType, updatedAttributes: SelectedAttribute[]) => {
    onAttributesChange(itemId, category, updatedAttributes);
  };
  
  const allConfigurableItemsForAttributes = useMemo(() => {
    return [
        ...entityTypesProp.map(et => ({...et, category: 'entity' as DataCategoryType})), 
        ...relationshipTypesProp.map(rt => ({...rt, category: 'relationship' as DataCategoryType})),
        ...interactionTypesProp.map(it => ({...it, category: 'interaction' as DataCategoryType})),
        ...otherDataTypesProp.map(ot => ({...ot, category: 'other' as DataCategoryType})),
    ];
  }, [entityTypesProp, relationshipTypesProp, interactionTypesProp, otherDataTypesProp]);

  const appliedFilterNames = ["Organization", "Products", "Suppliers"]; 

  // Helper to get all selected items across all categories
  const allSelectedItemsForSamplePreview = useMemo(() => [
    ...entityTypesProp.filter(et => et.selected),
    ...relationshipTypesProp.filter(rt => rt.selected),
    ...interactionTypesProp.filter(it => it.selected),
    ...otherDataTypesProp.filter(ot => ot.selected),
  ], [entityTypesProp, relationshipTypesProp, interactionTypesProp, otherDataTypesProp]);

  // Handle opening sample preview for a single item
  const handleOpenSamplePreview = (item: EntityTypeConfig | ConfigurableDataCategory) => {
    if (!item.selected) return; // Don't show preview for unselected items
    setActiveItemForSamplePreview(item);
    setIsPreviewSidebarOpen(true);
  };

  // Handle opening sample preview for all selected items in current tab
  const handleOpenSamplePreviewAll = (category: DataCategoryType, items: (EntityTypeConfig | ConfigurableDataCategory)[]) => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) return; // Don't show preview if no items selected
    
    // If only one item is selected, show just that item
    if (selectedItems.length === 1) {
      setActiveItemForSamplePreview(selectedItems[0]);
    } else {
      setActiveItemForSamplePreview(null); // Show all selected items in the tab
    }
    setIsPreviewSidebarOpen(true);
  };

  const renderTabHeader = (category: DataCategoryType, items: (EntityTypeConfig | ConfigurableDataCategory)[], totalCount: number) => {
    const selectedCount = items.filter(item => item.selected).length;
    let countText = '';

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
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-muted-foreground mt-1 mb-1">
            <strong>Note:</strong> All counts reflect the current data snapshot. The shared data will continue to update over time.
          </p>
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
          {category !== 'other' && (
            <Button variant="outline" onClick={() => alert("Filters button clicked")}>
              <ListFilter className="mr-2 h-4 w-4" /> Filters
            </Button>
          )}
          <Button 
            variant="outline" 
            disabled={!items.some(item => item.selected)}
            onClick={() => handleOpenSamplePreviewAll(category, items)}
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
             <p className="text-muted-foreground text-sm text-center py-10">No {category} types defined or available based on your selection.</p>
         );
     }

     const filterIconItemIds = ['organization', 'customer', 'matchData']; // Keep or adapt filter icon logic

    return (
       // Removed the extra ScrollArea here to avoid potential empty space issues
         <Table>
           <TableHeader>
             <TableRow>
               {/* Checkbox for Select All (Keep disabled for now) */}
               <TableHead className="w-[50px]"><Checkbox disabled title={`Select all ${category} types (not implemented)`}/></TableHead>
               <TableHead>Type</TableHead>
               {/* Conditional Table Heads based on category */}
                {category === 'relationship' && <TableHead>Related entities</TableHead>}
                {category === 'interaction' && <TableHead>Member types</TableHead>}
               <TableHead className="text-right">Count</TableHead>
               <TableHead>Selected Attributes</TableHead>
               <TableHead className="w-[60px] text-right"><span className="sr-only">Actions</span></TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {/* Filter items based on selected status before mapping */}
             {items.map((item: any) => (
               <TableRow key={item.id} data-state={item.selected ? "selected" : ""}>
                 <TableCell className="py-2"> {/* Reduced padding */}
                   <Checkbox
                     checked={item.selected}
                     onCheckedChange={() => {
                        if (category === 'entity') handleEntityTypeToggleInternal(item.id);
                        else if (category === 'relationship') handleRelationshipTypeToggleInternal(item.id);
                        else if (category === 'interaction') handleInteractionTypeToggleInternal(item.id);
                        else if (category === 'other') handleOtherDataTypeToggleInternal(item.id);
                     }}
                     aria-label={`Select ${item.name}`}
                   />
                 </TableCell>
                 <TableCell className="py-2"> {/* Reduced padding */}
                   <div className="flex items-center justify-between w-full">
                     <span className="flex items-center">
                       {item.name}
                     </span>
                     {/* Optional Filter Icon - only for 'other' category */}
                     {category === 'other' && (
                       <ListFilter className="h-4 w-4 text-muted-foreground ml-2" />
                     )}
                   </div>
                 </TableCell>
                 {/* Conditional Table Cells based on category */}
                 {category === 'relationship' && <TableCell className="text-muted-foreground py-2">{item.relatedEntities}</TableCell>}
                 {category === 'interaction' && <TableCell className="text-muted-foreground py-2">{item.memberTypes}</TableCell>}

                 <TableCell className="text-right text-muted-foreground py-2">{item.count.toLocaleString()}</TableCell>
                 <TableCell className="text-muted-foreground text-left py-2 flex items-center gap-1"> {/* Make cell flex for inline */}
                   {item.totalAttributes > 0 ? `${item.selectedAttributesCount}/${item.totalAttributes}` : 'N/A'}
                   {item.totalAttributes > 0 && (
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => handleOpenAttributesModal(item.id, category as DataCategoryType)}
                       className="text-muted-foreground hover:text-primary focus:text-primary ml-1"
                       aria-label={`Edit attributes for ${item.name}`}
                       disabled={item.totalAttributes === 0}
                     >
                       <Edit className="h-4 w-4" />
                     </Button>
                   )}
                 </TableCell>
                 <TableCell className="text-right py-2"> {/* Reduced padding */}
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
    );
  };

  const itemsForAttributesSidebar = useMemo(() => {
      if (!activeItemForAttributes) return [];

      const category = activeItemForAttributes.category;
      let items: (EntityTypeConfig | ConfigurableDataCategory)[] = [];

      if (category === 'entity') {
          items = entityTypesProp;
      } else if (category === 'relationship') {
          items = relationshipTypesProp;
      } else if (category === 'interaction') {
          items = interactionTypesProp;
      } else if (category === 'other') {
          items = otherDataTypesProp;
      }

      return items;

  }, [activeItemForAttributes, entityTypesProp, relationshipTypesProp, interactionTypesProp, otherDataTypesProp]);

  // Determine available tabs based on selected top-level data types
  const availableTabs = useMemo(() => {
    if (showAllTabs) {
      return [
        { value: 'entity', label: 'Entity types', items: entityTypesProp },
        { value: 'relationship', label: 'Relationships', items: relationshipTypesProp },
        { value: 'interaction', label: 'Interactions', items: interactionTypesProp },
        { value: 'other', label: 'Other data types', items: otherDataTypesProp },
      ];
    }
    const tabs = [];
    if (selectedDataTypes.find(dt => dt.id === 'entities' && dt.selected)) {
      tabs.push({ value: 'entity', label: 'Entity types', items: entityTypesProp });
    }
    if (selectedDataTypes.find(dt => dt.id === 'relationships' && dt.selected)) {
      tabs.push({ value: 'relationship', label: 'Relationships', items: relationshipTypesProp });
    }
    if (selectedDataTypes.find(dt => dt.id === 'interactions' && dt.selected)) {
      tabs.push({ value: 'interaction', label: 'Interactions', items: interactionTypesProp });
    }
    // Show Other data types tab if any of these types are selected
    if (selectedDataTypes.some(dt => 
      ['mergeTree', 'matchData', 'activityLog', 'workflowTasks'].includes(dt.id) && dt.selected
    )) {
      // Filter initialOtherDataTypesConfig to only include the selected ones for display in the tab
      const selectedOtherConfig = otherDataTypesProp.filter(item => 
           // Check if the item itself is selected (as per the initial multi-select)
           selectedDataTypes.some(dt => dt.id === item.id && dt.selected)
       );
       tabs.push({ value: 'other', label: 'Other data types', items: selectedOtherConfig });
    }
    return tabs;
  }, [showAllTabs, selectedDataTypes, entityTypesProp, relationshipTypesProp, interactionTypesProp, otherDataTypesProp]);

  // Set initial tab when availableTabs changes (e.g., on component mount or when selections change)
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.value === currentTab)) {
      setCurrentTab(availableTabs[0].value);
    }
     if (availableTabs.length === 0) {
         setCurrentTab(''); // Set to empty if no tabs are available
     }
  }, [availableTabs, currentTab]);

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
                  {renderTabHeader(tab.value as DataCategoryType, tab.items, tab.items.length)}
                  {renderTabContent(tab.value as DataCategoryType, tab.items)}
        </TabsContent>
            ))}
                          </div>
              </ScrollArea>
      </Tabs>

      {isAttributesModalOpen && activeItemForAttributes && (
        <AttributesSidebar
          isOpen={isAttributesModalOpen}
          onClose={() => setIsAttributesModalOpen(false)}
          items={itemsForAttributesSidebar}
          activeItem={activeItemForAttributes}
          onAttributesChange={handleInternalAttributesChange}
          onSave={handleAttributesSave}
          onActiveItemChange={(itemId, category) => { 
            console.log("onActiveItemChange called with:", itemId, category);
            const nextItem = itemsForAttributesSidebar.find(item => item.id === itemId && item.category === category);
            if (nextItem) {
                setActiveItemForAttributes(nextItem);
            }
          }}
        />
      )}

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

