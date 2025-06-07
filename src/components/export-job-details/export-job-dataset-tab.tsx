'use client';

import React, { useState } from 'react';
import { ExportJobDetails, DataSetSummary, ConfigurableDataItem } from '@/lib/mock-export-job-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PreviewDataSidebar from '@/components/data-share/create-data-share-wizard/preview-data-sidebar';
import ViewAttributesSidebar from '@/components/data-share/create-data-share-wizard/view-attributes-sidebar';
import type { EntityTypeConfig, ConfigurableDataCategory, DataCategoryType } from '@/lib/types';

interface ExportJobDatasetTabProps {
  jobDetails: ExportJobDetails;
}

// Helper function to convert ConfigurableDataItem to EntityTypeConfig or ConfigurableDataCategory
const convertToConfigurableType = (item: ConfigurableDataItem, category: DataCategoryType): EntityTypeConfig | ConfigurableDataCategory => {
  // Attributes in ConfigurableDataItem now match SelectedAttribute structure, so no complex mapping is needed.
  // We just need to ensure the attributes array is present.
  const attributesToSend = Array.isArray(item.attributes) ? item.attributes : [];

  return {
    id: item.name.toLowerCase().replace(/\s+/g, '_'),
    name: item.name,
    count: item.count,
    totalAttributes: attributesToSend.length, // Use the count of attributes being passed (already filtered for selection)
    selectedAttributesCount: attributesToSend.length, // In this context, selected is the same as total displayed
    attributes: attributesToSend, // Pass the (already filtered) attributes array
    selected: true, // Always true since these are already selected items
    category: category,
  };
};

const ExportJobDatasetTab: React.FC<ExportJobDatasetTabProps> = ({
  jobDetails,
}) => {
  const { dataSetSummary, entityTypes, relationshipTypes, interactionTypes, otherDataTypes } = jobDetails;

  // State for sample data panel
  const [isPreviewSidebarOpen, setIsPreviewSidebarOpen] = useState(false);
  const [activeItemForSamplePreview, setActiveItemForSamplePreview] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);

  // State for attributes panel
  const [isViewAttributesSidebarOpen, setIsViewAttributesSidebarOpen] = useState(false);
  const [itemForAttributeView, setItemForAttributeView] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);

  const handleOpenSamplePreview = (item: ConfigurableDataItem, category: DataCategoryType) => {
    const convertedItem = convertToConfigurableType(item, category);
    setActiveItemForSamplePreview(convertedItem);
    setIsPreviewSidebarOpen(true);
  };

  const handleOpenItemAttributesView = (item: ConfigurableDataItem, category: DataCategoryType) => {
    // Filter for only selected attributes before converting and setting state
    const selectedAttributesOnly = item.attributes?.filter(attr => attr.selected) || [];
    const itemWithSelectedAttributes = { ...item, attributes: selectedAttributesOnly };
    const convertedItem = convertToConfigurableType(itemWithSelectedAttributes, category);
    setItemForAttributeView(convertedItem);
    setIsViewAttributesSidebarOpen(true);
  };

  const filterIconItemIds = ['organization', 'customer', 'matchData'];

  const renderDataSection = (
    title: string,
    items: ConfigurableDataItem[],
    categoryTotalCount: string,
    category: DataCategoryType
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {title}{' '}
          <span className="text-muted-foreground font-normal text-base">{categoryTotalCount}</span>
        </h3>
        <div className="border rounded-md overflow-hidden shadow-sm bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right w-[150px]">Count</TableHead>
                <TableHead className="text-right w-[180px]">Selected attributes</TableHead>
                <TableHead className="text-right w-[60px]"><span className="sr-only">View Sample Data</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <div className="flex items-center justify-end">
                      {filterIconItemIds.includes(item.name.toLowerCase()) && <ListFilter className="h-3 w-3 mr-1.5 text-muted-foreground" />}
                      {item.count.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground flex items-center gap-1 justify-end">
                    {item.attributes && item.attributes.length > 0 ? (
                      <button
                        className="underline hover:text-primary focus:text-primary cursor-pointer bg-transparent border-0 p-0 m-0 text-inherit"
                        style={{ background: 'none' }}
                        onClick={() => handleOpenItemAttributesView(item, category)}
                        disabled={item.selectedAttributesCount === 0}
                        aria-label={`View attributes for ${item.name}`}
                      >
                        {`${item.selectedAttributesCount}/${item.attributes.length}`}
                      </button>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">{/* Eye icon for per-row sample preview */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenSamplePreview(item, category)}
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
        </div>
      </div>
    );
  };

  // Convert all items to the required type for the preview sidebar
  const allItemsForPreview = [
    ...entityTypes.map(item => convertToConfigurableType(item, 'entity')),
    ...relationshipTypes.map(item => convertToConfigurableType(item, 'relationship')),
    ...interactionTypes.map(item => convertToConfigurableType(item, 'interaction')),
    ...otherDataTypes.map(item => convertToConfigurableType(item, 'other')),
  ];

  return (
    <div className="p-6 bg-background flex flex-col gap-4 min-h-full">
      <div className="flex justify-between items-start pt-2 pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Data Set</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {dataSetSummary.totalProfiles} Profiles, {dataSetSummary.totalRelationships} Relationships, {dataSetSummary.totalInteractions} Interactions, {dataSetSummary.totalOtherDataTypes} Other data types
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setActiveItemForSamplePreview(null);
              setIsPreviewSidebarOpen(true);
            }}
            size="sm"
            className="flex items-center"
          >
            <Eye className="mr-2 h-4 w-4" /> VIEW SAMPLE DATA
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pt-2 -mx-2 px-2">
        {renderDataSection("Entity profiles", entityTypes, dataSetSummary.totalProfiles, 'entity')}
        {renderDataSection("Relationships", relationshipTypes, dataSetSummary.totalRelationships, 'relationship')}
        {renderDataSection("Interactions", interactionTypes, dataSetSummary.totalInteractions, 'interaction')}
        {renderDataSection("Other data types", otherDataTypes, dataSetSummary.totalOtherDataTypes, 'other')}
      </div>

      {isPreviewSidebarOpen && (
        <PreviewDataSidebar
          isOpen={isPreviewSidebarOpen}
          onClose={() => {
            setIsPreviewSidebarOpen(false);
            setActiveItemForSamplePreview(null);
          }}
          selectedItems={activeItemForSamplePreview ? [activeItemForSamplePreview] : allItemsForPreview}
          getSampleData={(itemId, category) => {
            // Find the item based on category and itemId
            let dataItems: ConfigurableDataItem[] = [];
            switch (category) {
              case 'entity':
                dataItems = entityTypes;
                break;
              case 'relationship':
                dataItems = relationshipTypes;
                break;
              case 'interaction':
                dataItems = interactionTypes;
                break;
              case 'other':
                dataItems = otherDataTypes;
                break;
              default:
                return [];
            }
            const foundItem = dataItems.find(item => item.name.toLowerCase().replace(/\s+/g, '_') === itemId);
            return foundItem?.sampleData || [];
          }}
        />
      )}

      {isViewAttributesSidebarOpen && itemForAttributeView && (
        <ViewAttributesSidebar
          isOpen={isViewAttributesSidebarOpen}
          onClose={() => {
            setIsViewAttributesSidebarOpen(false);
            setItemForAttributeView(null);
          }}
          item={itemForAttributeView}
        />
      )}
    </div>
  );
};

export default ExportJobDatasetTab; 