import type { DataShareConfiguration, EntityTypeConfig, SampleProfile, ConfigurableDataCategory, DataCategoryType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PreviewDataSidebar from "./preview-data-sidebar";
import ViewAttributesSidebar from "./view-attributes-sidebar"; // New import
import { useState, useMemo } from "react";
import { Eye, ListFilter } from "lucide-react";

interface ReviewDatasetStepProps {
  config: DataShareConfiguration;
  getSampleData: (itemId: string, category: DataCategoryType) => SampleProfile[];
}

export default function ReviewDatasetStep({ config, getSampleData }: ReviewDatasetStepProps) {
  const [isPreviewSidebarOpen, setIsPreviewSidebarOpen] = useState(false);
  const [activeItemForSamplePreview, setActiveItemForSamplePreview] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);
  const [isViewAttributesSidebarOpen, setIsViewAttributesSidebarOpen] = useState(false);
  const [itemForAttributeView, setItemForAttributeView] = useState<EntityTypeConfig | ConfigurableDataCategory | null>(null);

  const summaryCounts = {
    profiles: config.entityTypes.filter(et => et.selected).reduce((sum, et) => sum + et.count, 0),
    relationships: config.relationshipTypes.filter(rt => rt.selected).reduce((sum, rt) => sum + rt.count, 0),
    interactions: config.interactionTypes.filter(it => it.selected).reduce((sum, it) => sum + it.count, 0),
    otherData: config.otherDataTypes.filter(ot => ot.selected).reduce((sum, ot) => sum + ot.count, 0),
  };

  const otherDataSpecificCounts = {
      mergeTrees: config.otherDataTypes.find(item => item.id === 'mergeTree' && item.selected)?.count ?? 0,
      matchData: config.otherDataTypes.find(item => item.id === 'matchData' && item.selected)?.count ?? 0,
      // Add other specific items if they contribute to the summary or header count
  };
  const otherHeaderCount = otherDataSpecificCounts.mergeTrees + otherDataSpecificCounts.matchData;


  const summaryString = [
    summaryCounts.profiles > 0 && `${summaryCounts.profiles.toLocaleString()} Profiles`,
    summaryCounts.relationships > 0 && `${summaryCounts.relationships.toLocaleString()} Relationships`,
    summaryCounts.interactions > 0 && `${summaryCounts.interactions.toLocaleString()} Interactions`,
    otherDataSpecificCounts.mergeTrees > 0 && `${otherDataSpecificCounts.mergeTrees.toLocaleString()} Merge trees`,
    otherDataSpecificCounts.matchData > 0 && `${otherDataSpecificCounts.matchData.toLocaleString()} Match data`,
  ].filter(Boolean).join(', ');

  // Get all selected items for sample preview
  const allSelectedItemsForSamplePreview = useMemo(() => [
    ...config.entityTypes.filter(et => et.selected),
    ...config.relationshipTypes.filter(rt => rt.selected),
    ...config.interactionTypes.filter(it => it.selected),
    ...config.otherDataTypes.filter(ot => ot.selected),
  ], [config]);

  // Handle opening sample preview for a single item
  const handleOpenSamplePreview = (item: EntityTypeConfig | ConfigurableDataCategory) => {
    if (!item.selected) return; // Don't show preview for unselected items
    setActiveItemForSamplePreview(item);
    setIsPreviewSidebarOpen(true);
  };

  // Handle opening sample preview for all selected items
  const handleOpenSamplePreviewAll = () => {
    if (allSelectedItemsForSamplePreview.length === 0) return; // Don't show preview if no items selected
    setActiveItemForSamplePreview(null);
    setIsPreviewSidebarOpen(true);
  };

  const handleOpenItemAttributesView = (item: EntityTypeConfig | ConfigurableDataCategory) => {
    setItemForAttributeView(item);
    setIsViewAttributesSidebarOpen(true);
  };

  const renderDataSection = (title: string, items: (EntityTypeConfig | ConfigurableDataCategory)[], totalCount: number) => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Count</TableHead>
                <TableHead className="text-right">Attributes</TableHead>
                <TableHead></TableHead>
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
                        onClick={() => handleOpenItemAttributesView(item)}
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
                      onClick={() => handleOpenSamplePreview(item)}
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
    <div className="flex flex-col h-full p-6 bg-background">
      <div className="text-xs text-muted-foreground">
        Note: All counts reflect the current data snapshot. The shared data will continue to update over time.
      </div>

      <div className="flex justify-between items-start pt-2 pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Review dataset</h2>
          {summaryString && <p className="text-sm text-muted-foreground mt-1">{summaryString}</p>}
        </div>
        <Button
          variant="outline"
          onClick={() => setIsPreviewSidebarOpen(true)}
          disabled={allSelectedItemsForSamplePreview.length === 0}
        >
          <Eye className="mr-2 h-4 w-4" /> View Sample Data
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto pt-2 -mx-2 px-2">
        {renderDataSection("Entity profiles", config.entityTypes, summaryCounts.profiles)}
        {renderDataSection("Relationships", config.relationshipTypes, summaryCounts.relationships)}
        {renderDataSection("Interactions", config.interactionTypes, summaryCounts.interactions)}
        {renderDataSection("Other data types", config.otherDataTypes, summaryCounts.otherData)}
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
          showCategoryDropdown={true}
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
}
