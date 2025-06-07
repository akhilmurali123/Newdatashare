'use client';

import React from 'react';
import type { ConfigurableDataCategory, SelectedAttribute, DataCategoryType, EntityTypeConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Not directly used, but good to keep if structure mirrors AttributesSidebar
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";

interface ViewAttributesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  item: EntityTypeConfig | ConfigurableDataCategory;
}

export default function ViewAttributesSidebar({
  isOpen,
  onClose,
  item
}: ViewAttributesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const currentAttributes = useMemo(() => Array.isArray(item.attributes) ? item.attributes : [], [item.attributes]);

  const filteredAttributes = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return currentAttributes.filter(attr => attr.name.toLowerCase().includes(lowerSearchTerm));
  }, [currentAttributes, searchTerm]);

  const attributeCount = useMemo(() => currentAttributes.length, [currentAttributes]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>View Attributes: {item.name}</SheetTitle>
          <SheetDescription>
            Viewing selected attributes for {item.name}.
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 flex-grow overflow-hidden flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{attributeCount} attributes included in dataset</span>
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
          
          <ScrollArea className="flex-grow -mx-6 px-6">
            <div className="space-y-2 py-2">
              {filteredAttributes.length > 0 ? (
                filteredAttributes.map((attribute) => (
                  attribute.id ? (
                  <div key={attribute.id} className="flex items-center space-x-2 py-1 group">
                    <span className="text-sm font-normal flex-grow text-foreground">
                      {attribute.name}
                    </span>
                  </div>
                  ) : null
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{searchTerm ? 'No selected attributes match your search.' : 'No selected attributes available for this item.'}</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="p-6 border-t mt-auto">
          <SheetClose asChild>
            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
