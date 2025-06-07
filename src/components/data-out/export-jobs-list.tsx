'use client';
import React from 'react';
import { ExportJobListItem } from '@/lib/types'; // Import the type
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DataStatusIndicator from './data-status-indicator'; // Assuming this component exists and is reusable
import { Eye, Download, Link2, Copy, Play, StopCircle, Clock, ListFilter, Plus } from 'lucide-react'; // Import necessary icons
import { useRouter } from 'next/navigation';

interface ExportJobsListProps {
  items: ExportJobListItem[];
  onCreateNew?: () => void; // Optional prop for the Create New button action
}

const ExportJobsList: React.FC<ExportJobsListProps> = ({ items, onCreateNew }) => {
  const router = useRouter();

  const handleAction = (action: string, itemName: string) => {
    alert(`${action} action for ${itemName}`);
  };

  const handleRowClick = (jobId: string) => {
    router.push(`/export-jobs/${jobId}`);
  };

  // Helper to render action icons based on the actionIcons array
  const renderActionIcons = (item: ExportJobListItem) => {
    const icons = [];

     // Always add the Clock icon as per the screenshot example (unless specified not to)
     // Note: Based on user feedback, Clock should NOT show if status is 'Not configured'.
     // The ExportJobListItem type doesn't have a direct 'Not configured' status for the job itself,
     // but rather for the destination. Let's assume if destination is 'Not configured', no Clock.
    if (item.exportDestination !== 'Not configured') {
         icons.push(
             <Button key="view" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleAction('View Details/History', item.name)} aria-label="View Details/History">
                 <Clock className="h-3.5 w-3.5" />
                 <span className="sr-only">View Details/History</span>
             </Button>
         );
    }

    // Render other icons based on the actionIcons array
    item.actionIcons.forEach(icon => {
      if (icon === 'play') {
        icons.push(
          <Button key="play" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleAction('Play Export', item.name)} aria-label="Play Export">
            <Play className="h-3.5 w-3.5" />
            <span className="sr-only">Play Export</span>
          </Button>
        );
      } else if (icon === 'stop') {
         icons.push(
          <Button key="stop" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleAction('Stop Export', item.name)} aria-label="Stop Export">
            <StopCircle className="h-3.5 w-3.5" />
            <span className="sr-only">Stop Export</span>
          </Button>
        );
      } else if (icon === 'download') {
        icons.push(
          <Button key="download" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleAction('Download Export', item.name)} aria-label="Download Export">
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only">Download Export</span>
          </Button>
        );
      } else if (icon === 'link') {
        icons.push(
          <Button key="link" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => handleAction('Get Link', item.name)} aria-label="Get Link">
            <Link2 className="h-3.5 w-3.5" />
            <span className="sr-only">Get Link</span>
          </Button>
        );
      } /* Copy icon is handled separately for spacing */
    });

    return icons;
  };


  return (
    <div className="flex flex-col gap-4">
      {/* Header: Jobs | X items and Create New button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          Jobs | {items.length} items
        </h2>
        <div className="flex items-center space-x-4">
           {/* Filter icon can be added here if needed later */}
           <Button variant="outline" size="sm" onClick={() => alert('Filters clicked')}>
             <ListFilter className="h-4 w-4" />
             <span className="ml-2">Filters</span>
           </Button>
          <Button onClick={onCreateNew} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> CREATE NEW
          </Button>
        </div>
      </div>

      {/* Export Jobs Table */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[150px]">Created by</TableHead>
              <TableHead className="w-[200px]">Export destination</TableHead>
              <TableHead className="w-[200px]">Schedule</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => handleRowClick(item.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                       <DataStatusIndicator color={item.statusColor} />
                       <span className="text-muted-foreground text-sm ml-1">{item.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.createdBy}</TableCell>
                  <TableCell className="text-muted-foreground">{item.exportDestination}</TableCell>
                   <TableCell className="text-muted-foreground">{item.schedule}</TableCell>
                  <TableCell className="text-right">
                     <div className="flex items-center justify-end space-x-0.5">
                         {renderActionIcons(item)}
                          {/* Copy icon with left margin for spacing */}
                          <Button key="copy" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary ml-2" onClick={() => handleAction('Copy Export Job', item.name)} aria-label="Copy Export Job">
                              <Copy className="h-3.5 w-3.5" />
                              <span className="sr-only">Copy Export Job</span>
                          </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                 <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                   No export jobs found.
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExportJobsList; 