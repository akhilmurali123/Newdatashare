
'use client';

import type { SearchResultItem } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchResultsTableProps {
  items: SearchResultItem[];
  itemsPerPage?: number;
}

const COLUMNS = [
  { id: 'profile', label: 'Profile', sortable: true },
  { id: 'name', label: 'Name', sortable: true },
  { id: 'lastName', label: 'Last Name', sortable: true },
  { id: 'mobilePhone', label: 'Mobile Phone', sortable: true },
  { id: 'addressLine1', label: 'Address Line 1', sortable: true },
  { id: 'street', label: 'Street', sortable: true },
  { id: 'state', label: 'State', sortable: true },
  { id: 'postalCode', label: 'Postal Code', sortable: true },
  { id: 'country', label: 'Country', sortable: true },
];

export default function SearchResultsTable({ items, itemsPerPage = 10 }: SearchResultsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof SearchResultItem | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);
  
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const newSelectedRows = new Set(paginatedItems.map(item => item.profile));
      setSelectedRows(newSelectedRows);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (profileId: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(profileId)) {
      newSelectedRows.delete(profileId);
    } else {
      newSelectedRows.add(profileId);
    }
    setSelectedRows(newSelectedRows);
  };

  const requestSort = (key: keyof SearchResultItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const isAllCurrentPageSelected = paginatedItems.length > 0 && paginatedItems.every(item => selectedRows.has(item.profile));
  const isSomeCurrentPageSelected = paginatedItems.some(item => selectedRows.has(item.profile));

  useEffect(() => {
    // Reset page if items change and current page becomes invalid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [items, totalPages, currentPage]);


  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={isAllCurrentPageSelected ? true : (isSomeCurrentPageSelected ? 'indeterminate' : false)}
                onCheckedChange={handleSelectAll}
                aria-label="Select all rows on current page"
              />
            </TableHead>
            {COLUMNS.map(col => (
              <TableHead key={col.id}>
                <Button
                  variant="ghost"
                  onClick={() => col.sortable && requestSort(col.id as keyof SearchResultItem)}
                  className="px-1 py-1 h-auto font-medium hover:bg-muted"
                >
                  {col.label}
                  {col.sortable && <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground" />}
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <TableRow
                key={item.profile}
                data-state={selectedRows.has(item.profile) ? 'selected' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(item.profile)}
                    onCheckedChange={() => handleSelectRow(item.profile)}
                    aria-label={`Select row for profile ${item.profile}`}
                  />
                </TableCell>
                {COLUMNS.map(col => (
                  <TableCell key={`${item.profile}-${col.id}`} className="text-xs text-foreground py-2">
                    {item[col.id as keyof SearchResultItem] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={COLUMNS.length + 1} className="h-24 text-center text-muted-foreground">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-xs text-muted-foreground">
            {selectedRows.size} of {items.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
             <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

