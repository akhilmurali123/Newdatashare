import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, ListFilter } from 'lucide-react';
import type { EntityTypeConfig, ConfigurableDataCategory, DataCategoryType } from '@/lib/types';
import PreviewDataSidebar from '@/components/data-share/create-data-share-wizard/preview-data-sidebar';
import { Table, TableHeader, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface ReviewDatasetStepProps {
  config: {
    entityTypes: EntityTypeConfig[];
    relationshipTypes: ConfigurableDataCategory[];
    interactionTypes: ConfigurableDataCategory[];
    otherDataTypes: ConfigurableDataCategory[];
  };
  getSampleData: (itemId: string, category: DataCategoryType) => any[];
}

export default function ReviewDatasetStep({ config, getSampleData }: ReviewDatasetStepProps) {
  const [isPreviewSidebarOpen, setIsPreviewSidebarOpen] = useState(false);
  const [activeItemForSamplePreview, setActiveItemForSamplePreview] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);
  const [isViewAttributesSidebarOpen, setIsViewAttributesSidebarOpen] = useState(false);
  const [itemForAttributeView, setItemForAttributeView] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);

  const summaryCounts = useMemo(() => ({
    profiles: config.entityTypes.filter(et => et.selected).reduce((sum, et) => sum + et.count, 0),
    relationships: config.relationshipTypes.filter(rt => rt.selected).reduce((sum, rt) => sum + rt.count, 0),
    interactions: config.interactionTypes.filter(it => it.selected).reduce((sum, it) => sum + it.count, 0),
  }), [config]);

  const otherDataSpecificCounts = useMemo(() => ({
    mergeTrees: config.otherDataTypes.find(item => item.id === 'mergeTree' && item.selected)?.count ?? 0,
    matchData: config.otherDataTypes.find(item => item.id === 'matchData' && item.selected)?.count ?? 0,
  }), [config.otherDataTypes]);

  const otherHeaderCount = otherDataSpecificCounts.mergeTrees + otherDataSpecificCounts.matchData;

  const summaryString = useMemo(() => [
    summaryCounts.profiles > 0 && `${summaryCounts.profiles.toLocaleString()} Profiles`,
    summaryCounts.relationships > 0 && `${summaryCounts.relationships.toLocaleString()} Relationships`,
    summaryCounts.interactions > 0 && `${summaryCounts.interactions.toLocaleString()} Interactions`,
    otherDataSpecificCounts.mergeTrees > 0 && `${otherDataSpecificCounts.mergeTrees.toLocaleString()} Merge trees`,
    otherDataSpecificCounts.matchData > 0 && `${otherDataSpecificCounts.matchData.toLocaleString()} Match data`,
  ].filter(Boolean).join(', '), [summaryCounts, otherDataSpecificCounts]);

  const allSelectedItemsForSamplePreview = useMemo(() => [
    ...config.entityTypes.filter(et => et.selected),
    ...config.relationshipTypes.filter(rt => rt.selected),
    ...config.interactionTypes.filter(it => it.selected),
    ...config.otherDataTypes.filter(ot => ot.selected),
  ], [config]);

  const handleOpenSamplePreviewAll = () => {
    setIsPreviewSidebarOpen(true);
  };

  const renderDataSection = (
    title: string,
    items: (EntityTypeConfig | ConfigurableDataCategory)[],
    categoryTotalCount: number
  ) => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {title} <span className="text-muted-foreground font-normal text-base">{categoryTotalCount.toLocaleString()}</span>
        </h3>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Count</TableCell>
                <TableCell className="text-right">Attributes</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.count.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {item.totalAttributes > 0 ? (
                      <button
                        className="underline hover:text-primary focus:text-primary cursor-pointer bg-transparent border-0 p-0 m-0 text-inherit"
                        onClick={() => {
                          setItemForAttributeView(item);
                          setIsViewAttributesSidebarOpen(true);
                        }}
                        disabled={!item.selected}
                      >
                        {item.selectedAttributesCount}/{item.totalAttributes}
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      className="hover:text-primary focus:text-primary cursor-pointer bg-transparent border-0 p-0 m-0 text-inherit"
                      onClick={() => {
                        setActiveItemForSamplePreview(item);
                        setIsPreviewSidebarOpen(true);
                      }}
                      disabled={!item.selected}
                      title="Preview data"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-background flex flex-col gap-4 min-h-full">
      <div className="flex justify-between items-start pt-2 pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Review dataset</h2>
          {summaryString && <p className="text-sm text-muted-foreground mt-1">{summaryString}</p>}
        </div>
        <Button
          variant="outline"
          onClick={() => setIsPreviewSidebarOpen(true)}
          disabled={allSelectedItemsForSamplePreview.length === 0}
          size="sm"
        >
          <Eye className="mr-2 h-4 w-4" /> VIEW SAMPLE DATA
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto pt-2 -mx-2 px-2">
        {renderDataSection("Entity profiles", config.entityTypes, summaryCounts.profiles)}
        {renderDataSection("Relationships", config.relationshipTypes, summaryCounts.relationships)}
        {renderDataSection("Interactions", config.interactionTypes, summaryCounts.interactions)}
        {(() => {
          const otherSelectedItems = config.otherDataTypes.filter(ot => ot.selected);
          if (otherSelectedItems.length === 0 && otherHeaderCount === 0) return null;
          return renderDataSection("Other data types", config.otherDataTypes, otherHeaderCount);
        })()}
      </div>

      {isPreviewSidebarOpen && (
        <PreviewDataSidebar
          isOpen={isPreviewSidebarOpen}
          onClose={() => {
            setIsPreviewSidebarOpen(false);
            setActiveItemForSamplePreview(null);
          }}
          selectedItems={allSelectedItemsForSamplePreview}
          getSampleData={getSampleData}
        />
      )}
    </div>
  );
} 