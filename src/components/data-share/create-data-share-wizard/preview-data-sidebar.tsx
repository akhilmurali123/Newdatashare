'use client';

import React from 'react';
import type { ConfigurableDataCategory, SampleProfile, EntityTypeConfig, DataCategoryType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useMemo, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "entity", label: "Entities" },
  { value: "relationship", label: "Relationships" },
  { value: "interaction", label: "Interactions" },
  { value: "other", label: "Other data types" },
];

interface PreviewDataSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: (EntityTypeConfig | ConfigurableDataCategory)[];
  getSampleData: (itemId: string, category: DataCategoryType) => SampleProfile[];
  initialCategory?: DataCategoryType;
  showCategoryDropdown?: boolean;
}

export default function PreviewDataSidebar({
  isOpen,
  onClose,
  selectedItems,
  getSampleData,
  initialCategory = "entity",
  showCategoryDropdown = false,
}: PreviewDataSidebarProps) {
  // State for category dropdown
  const [category, setCategory] = useState<DataCategoryType>(initialCategory);

  // Filter items for the selected category
  const validSelectedItems = useMemo(() => {
    if (!Array.isArray(selectedItems)) return [];
    return selectedItems.filter(
      (item) =>
        item.category === category &&
        item.selected &&
        Array.isArray(getSampleData(item.id, item.category as DataCategoryType)) &&
        getSampleData(item.id, item.category as DataCategoryType).length > 0
    );
  }, [selectedItems, getSampleData, category]);

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Preview data selection</SheetTitle>
          <SheetDescription>
            View sample profiles for the selected data categories.
          </SheetDescription>
        </SheetHeader>

        {/* Dropdown at the top */}
        {showCategoryDropdown && (
          <div className="px-6 pt-4 pb-2">
            <label htmlFor="category-select" className="text-sm font-medium mr-2">Category:</label>
            <select
              id="category-select"
              className="border rounded px-2 py-1 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as DataCategoryType)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs below dropdown, with spacing */}
        <div className="px-6 pt-2 pb-0">
          <Tabs defaultValue={validSelectedItems[0]?.id ? `${validSelectedItems[0].id}-${validSelectedItems[0].category}` : undefined} className="flex flex-col h-full">
            <div className="overflow-x-auto mb-2">
              <TabsList className="shrink-0 min-w-max">
                {validSelectedItems.map((item) => (
                  <TabsTrigger key={`${item.id}-${item.category}`} value={`${item.id}-${item.category}`}>{item.name}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="flex-grow overflow-hidden">
              {validSelectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center mt-8">
                  <p className="text-muted-foreground">No items selected or no sample data available for preview in this category.</p>
                </div>
              ) : (
                <ScrollArea className="h-full pr-3 -mr-3">
                  {validSelectedItems.map((item) => {
                    const sampleData = getSampleData(item.id, item.category as DataCategoryType);
                    const headers = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
                    const rowsToShow = sampleData.slice(0, 20); // Show only first 20 rows
                    return (
                      <TabsContent key={`${item.id}-${item.category}-content`} value={`${item.id}-${item.category}`} className="mt-0 h-full">
                        <p className="text-sm text-muted-foreground mb-2 mt-4">
                          Showing {rowsToShow.length} of {sampleData.length} sample profiles for {item.name}
                        </p>
                        {rowsToShow.length > 0 ? (
                          <Table className="border mt-2">
                            <TableHeader>
                              <TableRow>
                                {headers.map((header) => (
                                  <TableHead key={header} className="whitespace-nowrap bg-muted/50">{header}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rowsToShow.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  {headers.map((header) => (
                                    <TableCell key={`${rowIndex}-${header}`} className="text-xs whitespace-nowrap">
                                      {String(row[header])}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground text-sm mt-4">No sample data to display for {item.name}.</p>
                        )}
                      </TabsContent>
                    );
                  })}
                </ScrollArea>
              )}
            </div>
          </Tabs>
        </div>

        <SheetFooter className="p-6 border-t mt-auto">
          <SheetClose asChild>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

