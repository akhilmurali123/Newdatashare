'use client';
import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming ScrollArea is available
import { Input } from '@/components/ui/input'; // For attribute filtering/search

import type {
  EntityTypeConfig,
  ConfigurableDataCategory,
  SelectedAttribute,
  DataCategoryType,
} from '@/lib/types';

interface ExportAttributeSelectionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  item: EntityTypeConfig | ConfigurableDataCategory | null; // Use the actual union type
  onAttributesChange: (itemId: string, category: DataCategoryType, updatedAttributes: SelectedAttribute[]) => void; // Add handler
}

const ExportAttributeSelectionSidebar: React.FC<ExportAttributeSelectionSidebarProps> = ({
  isOpen,
  onClose,
  item,
  onAttributesChange,
}) => {
  // Use item's attributes for state, make a copy to avoid mutating props
  const [attributes, setAttributes] = useState<SelectedAttribute[]>(item?.attributes ? [...item.attributes] : []);

  // Update state when the item prop changes
  useEffect(() => {
    setAttributes(item?.attributes ? [...item.attributes] : []);
  }, [item]);

  const handleAttributeToggle = (attributeId: string) => {
    setAttributes(prevAttributes =>
      prevAttributes.map(attr =>
        attr.id === attributeId ? { ...attr, selected: !attr.selected } : attr
      )
    );
  };

  const handleSelectAll = (selected: boolean) => {
      setAttributes(prevAttributes =>
          prevAttributes.map(attr => ({ ...attr, selected }))
      );
  };

  const handleSave = () => {
      if (item) {
          // Call the parent handler with the updated attributes
          onAttributesChange(item.id, (item as any).category, attributes); // Assuming category is available on the item
      }
      // onClose(); // Parent handler should close the sidebar
  };

  if (!item) return null; // Don't render if no item is selected

  const selectedAttributesCount = attributes.filter(attr => attr.selected).length;
  const totalAttributesCount = attributes.length;
  const isAllSelected = totalAttributesCount > 0 && selectedAttributesCount === totalAttributesCount;


  return (
    <Sheet open={isOpen} onOpenChange={onClose}> {/* Use Sheet component */}
      <SheetContent side="right" className="flex flex-col"> {/* Use SheetContent */}
        <SheetHeader> {/* Use SheetHeader */}
          <SheetTitle>Select Attributes for {item.name}</SheetTitle> {/* Use SheetTitle */}
        </SheetHeader>
        <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-attributes"
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                />
                <Label htmlFor="select-all-attributes" className="text-sm font-medium leading-none">
                  Select All ({selectedAttributesCount}/{totalAttributesCount})
                </Label>
             </div>
             {/* Optional: Add filter/search input here */}
             {/* <Input placeholder="Search attributes..." className="max-w-xs" /> */}
        </div>
        <ScrollArea className="flex-grow pr-4 -mr-4"> {/* Use ScrollArea */}
          <div className="grid gap-3">
            {attributes.length > 0 ? (
              attributes.map((attribute) => (
                <div key={attribute.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`attribute-${attribute.id}`}
                    checked={attribute.selected}
                    onCheckedChange={() => handleAttributeToggle(attribute.id)}
                  />
                  <Label htmlFor={`attribute-${attribute.id}`} className="text-sm font-medium leading-none">
                    {attribute.name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm text-center">No attributes available for this data type.</p>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end"> {/* Use SheetFooter */}
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Attributes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ExportAttributeSelectionSidebar;