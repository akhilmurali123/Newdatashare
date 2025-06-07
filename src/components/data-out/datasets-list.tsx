'use client';
import type { DatasetListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Play, RefreshCcw, Link2, Download, Copy, ArrowDown, StopCircle, Clock } from "lucide-react";
import DataStatusIndicator from "./data-status-indicator";

interface DatasetsListProps {
  items: DatasetListItem[];
  // onCreateNew: () => void; // If needed later
}

export default function DatasetsList({ items }: DatasetsListProps) {
  const handleAction = (action: string, itemName: string) => {
    alert(`${action} action for ${itemName}`);
  };

  const renderDataShareIcons = (item: DatasetListItem) => {
    const icons = [];
    // Render Play icon if status is 'Draft' or 'Not configured'
    if (item.dataShare.display.includes('Draft') || item.dataShare.display.includes('Not configured')) {
      icons.push(
        <Button
          key="play-data-share"
          variant="ghost"
          size="icon"
          className="ml-1 h-6 w-6 text-muted-foreground hover:text-primary flex items-center justify-center"
          onClick={() => handleAction('Play Data Share', item.name)}
        >
          <Play className="h-3.5 w-3.5" />
          <span className="sr-only">Play Data Share</span>
        </Button>
      );
    }
     // Render Stop icon if status is 'Active'
    if (item.dataShare.display.includes('Active')) {
       icons.push(
        <Button
          key="stop-data-share"
          variant="ghost"
          size="icon"
          className="ml-1 h-6 w-6 text-muted-foreground hover:text-primary flex items-center justify-center"
          onClick={() => handleAction('Stop Data Share', item.name)}
        >
          <StopCircle className="h-3.5 w-3.5" />
          <span className="sr-only">Stop Data Share</span>
        </Button>
      );
    }
    return icons;
  };

  const renderFileExportIcons = (item: DatasetListItem) => {
    const icons = [];
    // Add clock icon UNLESS display is 'Not configured'
    if (!item.fileExport.display.includes('Not configured')) {
      icons.push(
        <Button
          key="clock-file-export"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={() => handleAction('View History', item.name)}
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="sr-only">View Export History</span>
        </Button>
      );
    }

    // Add Play/Stop icon based on display text
    if (item.fileExport.display.includes('AWS S3') && item.fileExport.display.includes('Active')) { // Stop icon for 'AWS S3 - bucket name (Active)'
       icons.push(
        <Button
          key="stop-file-export"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={() => handleAction('Stop File Export', item.name)}
        >
          <StopCircle className="h-3.5 w-3.5" />
          <span className="sr-only">Stop File Export</span>
        </Button>
      );
    } else if (item.fileExport.display.includes('In-progress')) { // Stop icon for 'In-progress' downloads
        icons.push(
        <Button
          key="stop-file-export-inprogress"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={() => handleAction('Stop File Export', item.name)}
        >
          <StopCircle className="h-3.5 w-3.5" />
          <span className="sr-only">Stop File Export</span>
        </Button>
      );
    } else if (item.fileExport.display.includes('Not configured')) { // Play icon for 'Not configured' file export
       icons.push(
        <Button
          key="play-file-export"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={() => handleAction('Play File Export', item.name)}
        >
          <Play className="h-3.5 w-3.5" />
          <span className="sr-only">Play File Export</span>
        </Button>
      );
    }

    // Add download icon (if display indicates completed or in-progress download)
    if (item.fileExport.display.includes('Completed') || item.fileExport.display.includes('In-progress')) {
      icons.push(
        <Button
          key="download-file-export"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={() => handleAction('Download File Export', item.name)}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only">Download File Export</span>
        </Button>
      );
    }

     // Add link icon (if display indicates link is available)
     if (item.fileExport.display.includes('AWS S3') && item.fileExport.display.includes('Active')) { // Link icon for 'AWS S3 - bucket name (Active)'
      icons.push(
       <Button
         key="link-file-export"
         variant="ghost"
         size="icon"
         className="h-6 w-6 text-muted-foreground hover:text-primary"
         onClick={() => handleAction('Link File Export', item.name)}
       >
         <Link2 className="h-3.5 w-3.5" />
         <span className="sr-only">Link File Export</span>
       </Button>
     );
   }

    // Note: Copy icon is rendered separately in the TableCell
    return icons;
  };

  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">
              <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                Name <ArrowDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Created by</TableHead>
            <TableHead>Data share</TableHead>
            <TableHead>File export</TableHead>
            <TableHead className="text-right w-[60px]"><span className="sr-only">Copy</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.createdBy}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end w-full">
                  <div className="flex items-center">
                    <DataStatusIndicator color={item.dataShare.dotColor} />
                    <span className="text-muted-foreground text-sm ml-1">{item.dataShare.display}</span>
                  </div>
                  <div className="flex items-center space-x-0.5 ml-2 shrink-0">
                    {renderDataShareIcons(item)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                     <DataStatusIndicator color={item.fileExport.dotColor} />
                     <span className="text-muted-foreground text-sm ml-1 flex-grow whitespace-nowrap truncate max-w-[200px]">{item.fileExport.display}</span>
                  </div>
                  <div className="flex items-center space-x-0.5 ml-2 shrink-0">
                    {/* Render all file export icons except Copy */}
                    {renderFileExportIcons(item)}
                    {/* Render Copy icon separately with spacing */}
                     <Button
                      key="copy-dataset"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary ml-2"
                      onClick={() => handleAction('Copy', item.name)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="sr-only">Copy {item.name}</span>
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
