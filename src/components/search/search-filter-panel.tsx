
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronRight, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const initialEntityTypes = [
  { id: 'customers', label: 'Customers', checked: false },
  { id: 'suppliers', label: 'Suppliers', checked: true },
  { id: 'organizations', label: 'Organizations', checked: true },
  { id: 'products', label: 'Products', checked: true },
  { id: 'assets', label: 'Assets', checked: false },
  { id: 'partners', label: 'Partners', checked: false },
  { id: 'employees', label: 'Employees', checked: false },
];

const initialAttributeFilters = [
    { id: 'city', parent: 'AddressNested', label: 'City', values: ['All values', 'New York', 'London', 'Tokyo'] },
    { id: 'cityTier', parent: 'AddressNested', label: 'City Tier', values: ['All values', 'Tier 1', 'Tier 2'] },
    { id: 'district', parent: 'AddressNested', label: 'District', values: ['All values', 'District A', 'District B'] },
];


export default function SearchFilterPanel() {
  const [entityTypes, setEntityTypes] = useState(initialEntityTypes);
  const [showAllEntityTypes, setShowAllEntityTypes] = useState(false);

  const handleEntityTypeChange = (id: string) => {
    setEntityTypes(prev =>
      prev.map(et => (et.id === id ? { ...et, checked: !et.checked } : et))
    );
  };

  const visibleEntityTypes = showAllEntityTypes ? entityTypes : entityTypes.slice(0, 5);


  return (
    <aside className="w-72 bg-card text-card-foreground p-4 flex flex-col h-full border-r">
      <Button variant="outline" className="w-full justify-between mb-4 text-sm">
        ADVANCED SEARCH
        <ChevronRight className="h-4 w-4" />
      </Button>

      <ScrollArea className="flex-grow">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">QUICK FILTERS</h3>
            <div className="flex items-center space-x-2 mb-4 p-2 hover:bg-muted rounded-md cursor-pointer">
              <Checkbox id="ov-only" />
              <Label htmlFor="ov-only" className="text-sm font-normal cursor-pointer">Search by OV only</Label>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Entity types</h3>
            <div className="space-y-1">
              {visibleEntityTypes.map(et => (
                <div key={et.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <Checkbox
                    id={et.id}
                    checked={et.checked}
                    onCheckedChange={() => handleEntityTypeChange(et.id)}
                  />
                  <Label htmlFor={et.id} className="text-sm font-normal cursor-pointer flex-1">{et.label}</Label>
                </div>
              ))}
              {entityTypes.length > 5 && (
                 <Button variant="link" className="p-2 text-primary h-auto text-sm" onClick={() => setShowAllEntityTypes(!showAllEntityTypes)}>
                    <ChevronDown className={`h-4 w-4 mr-1 transform transition-transform ${showAllEntityTypes ? 'rotate-180' : ''}`} />
                    View {showAllEntityTypes ? 'less' : 'more'}
                </Button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Attributes</h3>
            <div className="relative mb-3">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search & add attributes" className="pl-9 h-9 text-sm" />
            </div>
            <Accordion type="multiple" className="w-full">
              {initialAttributeFilters.map(attr => (
                <AccordionItem value={attr.id} key={attr.id}>
                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                    <div>
                        <div className="text-xs text-muted-foreground">{attr.parent}</div>
                        {attr.label}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    {/* Placeholder for attribute values/select */}
                    <Input placeholder={`Select ${attr.label}`} className="h-8 text-xs" />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
