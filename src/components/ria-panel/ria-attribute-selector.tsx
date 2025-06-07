import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface Attribute {
  id: string;
  name: string;
  selected?: boolean;
}

interface RiaAttributeSelectorProps {
  attributes: Attribute[];
  onAddSelected: (selected: Attribute[]) => void;
  onClose: () => void;
}

const DEFAULT_VISIBLE = 5;

export default function RiaAttributeSelector({ attributes, onAddSelected, onClose }: RiaAttributeSelectorProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(attributes.filter(a => a.selected).map(a => a.id))
  );

  const filtered = useMemo(() =>
    attributes.filter(a => a.name.toLowerCase().includes(search.toLowerCase())),
    [attributes, search]
  );

  const visible = expanded ? filtered : filtered.slice(0, DEFAULT_VISIBLE);
  const allSelected = filtered.length > 0 && filtered.every(a => selectedIds.has(a.id));

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(a => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(a => next.add(a.id));
        return next;
      });
    }
  };

  const handleAdd = () => {
    onAddSelected(attributes.filter(a => selectedIds.has(a.id)));
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-auto">
      <div className="flex items-center mb-3 gap-2">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search attributes..."
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} id="select-all" />
        <label htmlFor="select-all" className="text-sm cursor-pointer">Select All</label>
      </div>
      <div className={expanded ? "max-h-64 overflow-y-auto" : ""}>
        {visible.map(attr => (
          <div key={attr.id} className="flex items-center gap-2 mb-1">
            <Checkbox
              checked={selectedIds.has(attr.id)}
              onCheckedChange={() => handleToggle(attr.id)}
              id={attr.id}
            />
            <label htmlFor={attr.id} className="text-sm cursor-pointer">{attr.name}</label>
          </div>
        ))}
        {!expanded && filtered.length > DEFAULT_VISIBLE && (
          <Button variant="link" size="sm" className="pl-0" onClick={() => setExpanded(true)}>
            Show all ({filtered.length - DEFAULT_VISIBLE} more)
          </Button>
        )}
      </div>
      <Button className="mt-4 w-full" onClick={handleAdd} disabled={selectedIds.size === 0}>
        Add Selected
      </Button>
    </div>
  );
} 