import React from 'react';
import { ExportJobDetails } from '@/lib/mock-export-job-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming a shadcn/ui table component
import { Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox from your UI library

interface ExportJobFilesTabProps {
  jobDetails: ExportJobDetails; // Accept the full jobDetails object
}

const ExportJobFilesTab: React.FC<ExportJobFilesTabProps> = ({ jobDetails }) => {
  const files = jobDetails.files; // Access files from jobDetails

  return (
    <div className="space-y-6">
      {/* Metadata Section - Wrapped in a box */}
      <div className="border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center"><span className="font-medium w-32 text-foreground">Created by:</span> {jobDetails.createdBy}</div>
          <div className="flex items-center"><span className="font-medium w-32 text-foreground">Created on:</span> {jobDetails.createdOn}</div>
          <div className="flex items-center"><span className="font-medium w-32 text-foreground">Last run:</span> {jobDetails.lastRun}</div>
          {jobDetails.nextScheduledRun && (
            <div className="flex items-center"><span className="font-medium w-32 text-foreground">Next scheduled run:</span> {jobDetails.nextScheduledRun}</div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold">Files</h3>

      {/* Files Section Header */}
      <div className="flex items-start justify-between text-sm text-muted-foreground mb-4">
        <div className="flex items-center space-x-4">
          <span>Job Started {jobDetails.createdOn}</span> {/* Using Created On for Job Started as per screenshot */}
          {/* Status Indicator - assuming a mapping or component exists for statusColor/status */}
          {/* For now, hardcoding a green dot as per screenshot */}
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Completed in 7m 48s {/* Mock time */}
        </div>
        {/* Right section with Select dropdown, Note, and Download All */}
        <div className="flex flex-col items-end space-y-2">
          {/* Select Export Job Dropdown */}
          <div className="flex items-center space-x-2">
            <span>Select export job</span>
            <Select defaultValue="12:23 PM, 23 Sep 2024"> {/* Mock dropdown value */}
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                {/* Add SelectItems for other export jobs if available */}
                <SelectItem value="12:23 PM, 23 Sep 2024">12:23 PM, 23 Sep 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Note and Download All Link */}
          <div className="flex items-center space-x-4">
            <span>Total file size: {jobDetails.totalFileSize}. Files will be preserved till: 09/10/2024, 10:55 AM</span> {/* Using mock date */}
            <a href="#download-all" className="text-blue-600 hover:underline flex items-center">
              <Download className="mr-1 h-4 w-4" />
              Download all
            </a>
          </div>
        </div>
      </div>

      {/* Files Table - Wrapped in a bordered div */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><Checkbox id="select-all-files" /></TableHead>
              <TableHead className="w-1/2">Name</TableHead>
              <TableHead className="w-1/4">Size</TableHead>
              <TableHead className="text-right w-1/4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, index) => (
              <TableRow key={index}>
                <TableCell><Checkbox id={`select-file-${index}`} /></TableCell>
                <TableCell className="font-medium">{file.name}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell className="text-right">
                  <a href={file.downloadUrl} className="text-blue-600 hover:underline">
                    <Download className="h-4 w-4 inline" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExportJobFilesTab; 