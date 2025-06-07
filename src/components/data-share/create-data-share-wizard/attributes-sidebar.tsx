import type { ConfigurableDataCategory, SelectedAttribute, DataCategoryType, EntityTypeConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import type { ActiveItemForModal } from "./create-data-share-wizard";

interface AttributesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: (EntityTypeConfig | ConfigurableDataCategory)[]; // All available items for the dropdown
  activeItem: ActiveItemForModal | null; // The item currently being configured
  onActiveItemChange: (itemId: string, category: DataCategoryType) => void;
  onAttributesChange: (itemId: string, category: DataCategoryType, updatedAttributes: SelectedAttribute[]) => void;
  onSave: () => void;
}

export default function AttributesSidebar({
  isOpen,
  onClose,
  items,
  activeItem,
  onActiveItemChange,
  onAttributesChange,
  onSave
}: AttributesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const currentActiveItemDetails = useMemo(() => 
    items.find(it => it.id === activeItem?.id && it.category === activeItem?.category)
  , [items, activeItem]);

  const [currentAttributes, setCurrentAttributes] = useState<SelectedAttribute[]>([]);

  useEffect(() => {
    if (currentActiveItemDetails) {
      setCurrentAttributes(JSON.parse(JSON.stringify(currentActiveItemDetails.attributes))); // Deep copy
    } else {
      setCurrentAttributes([]);
    }
  }, [currentActiveItemDetails]);
  
  const filteredAttributes = useMemo(() => {
    if (!currentAttributes) return { common: [], system: [], other: [] };
    const lowerSearchTerm = searchTerm.toLowerCase();
    const categorized = { common: [] as SelectedAttribute[], system: [] as SelectedAttribute[], other: [] as SelectedAttribute[] };
    currentAttributes.forEach(attr => {
      if (attr.name.toLowerCase().includes(lowerSearchTerm)) {
        if (attr.category === 'common') categorized.common.push(attr);
        else if (attr.category === 'system') categorized.system.push(attr);
        else categorized.other.push(attr); // This includes 'custom' or any other string
      }
    });
    return categorized;
  }, [currentAttributes, searchTerm]);

  const selectedCount = useMemo(() => currentAttributes.filter(attr => attr.selected).length, [currentAttributes]);
  const totalCount = useMemo(() => currentAttributes.length, [currentAttributes]);

  const handleAttributeToggle = (attributeId: string) => {
    setCurrentAttributes(prevAttributes => 
      prevAttributes.map(attr => 
        attr.id === attributeId ? { ...attr, selected: !attr.selected } : attr
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setCurrentAttributes(prevAttributes =>
      prevAttributes.map(attr => ({ ...attr, selected: checked }))
    );
  };

  const handleSaveChanges = () => {
    if (activeItem && activeItem.id && activeItem.category) {
      onAttributesChange(activeItem.id, activeItem.category, currentAttributes);
    }
    onSave(); 
  };
  
  const handleSelectChange = (value: string) => {
    const [id, category] = value.split(':');
    onActiveItemChange(id, category as DataCategoryType);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Attributes</SheetTitle>
          <SheetDescription>
            Select attributes for the chosen item.
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 flex-grow overflow-hidden flex flex-col gap-4">
          <Select
            value={activeItem ? `${activeItem.id}:${activeItem.category}` : ""}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select item type" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={`${item.id}:${item.category}`} value={`${item.id}:${item.category}`}>
                  {item.name} ({item.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentActiveItemDetails && (
            <>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{selectedCount}/{totalCount} selected</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search attributes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2 py-2 border-b">
                <Checkbox
                  id="select-all-attrs"
                  checked={totalCount > 0 && selectedCount === totalCount}
                  onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  disabled={totalCount === 0}
                />
                <Label htmlFor="select-all-attrs" className="font-medium">Select all</Label>
              </div>
              <ScrollArea className="flex-grow -mx-6 px-6">
                <div className="space-y-4">
                  {Object.entries(filteredAttributes).map(([categoryKey, attrs]) => {
                    if (categoryKey === 'other') return null;
                    if (attrs.length === 0 && searchTerm) return null;
                     const categoryName = categoryKey === 'other' ? 'Custom' : categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);


                    return (
                      (attrs.length > 0 || !searchTerm) && (
                        <div key={categoryKey}>
                          <h4 className="text-sm font-semibold text-foreground mb-2 capitalize">{categoryName} attributes</h4>
                          {attrs.length > 0 ? (
                            attrs.map((attribute) => (
                            <div key={attribute.id} className="flex items-center space-x-2 py-1.5">
                              <Checkbox
                                id={`attr-${attribute.id}`}
                                checked={attribute.selected}
                                onCheckedChange={() => handleAttributeToggle(attribute.id)}
                                aria-labelledby={`label-attr-${attribute.id}`}
                              />
                              <Label htmlFor={`attr-${attribute.id}`} id={`label-attr-${attribute.id}`} className="text-sm font-normal text-foreground flex-grow cursor-pointer">
                                {attribute.name}
                              </Label>
                            </div>
                          ))
                          ) : (
                            searchTerm && <p className="text-xs text-muted-foreground">No {categoryName.toLowerCase()} attributes match your search.</p>
                          )}
                           {!searchTerm && attrs.length === 0 && <p className="text-xs text-muted-foreground">No {categoryName.toLowerCase()} attributes defined.</p>}
                        </div>
                      )
                    )
                  })}
                  {currentAttributes.length === 0 && !searchTerm && <p className="text-sm text-muted-foreground">No attributes available for this item.</p>}
                </div>
              </ScrollArea>
            </>
          )}
          {!currentActiveItemDetails && <p className="text-sm text-muted-foreground text-center py-10">Select an item to see attributes.</p>}
        </div>

        <SheetFooter className="p-6 border-t mt-auto">
          <SheetClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </SheetClose>
          <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!activeItem}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
