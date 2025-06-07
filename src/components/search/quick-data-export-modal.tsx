'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface QuickDataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickExport: (
    jobName: string,
    includeRelationships: boolean,
    includeInteractions: boolean,
    fileFormat: string,
    destination: string,
    whenToExport: string
  ) => void;
  onAdvancedExportClick: (includeRelationships: boolean, includeInteractions: boolean) => void; // Handler to switch to advanced wizard
  // Props for displaying data to export summary
  selectedEntityTypesSummary?: { name: string; count: number; totalAttributes?: number }[]; // Simplified summary
  profilesCount?: number;
  relationshipsCount?: number;
  interactionsCount?: number;
}

export default function QuickDataExportModal({
  isOpen,
  onClose,
  onQuickExport,
  onAdvancedExportClick,
  selectedEntityTypesSummary = [],
  profilesCount = 0,
  relationshipsCount = 0,
  interactionsCount = 0,
}: QuickDataExportModalProps) {
  const [jobName, setJobName] = useState('');
  const [includeRelationships, setIncludeRelationships] = useState(true);
  const [includeInteractions, setIncludeInteractions] = useState(false);
  const [fileFormat, setFileFormat] = useState('');
  const [destination, setDestination] = useState('');
  const [whenToExport, setWhenToExport] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Reset fields when modal opens and set defaults
      setJobName('Export organizations, suppliers, products data'); // Updated default job name
      setIncludeRelationships(true);
      setIncludeInteractions(false);
      setFileFormat('CSV Flattened'); // Default from screenshot
      setDestination('Direct download'); // Default from screenshot
      setWhenToExport('Export now'); // Default from screenshot
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!jobName || !fileFormat || !destination || !whenToExport) {
      alert("All fields are required.");
      return;
    }
    onQuickExport(
      jobName,
      includeRelationships,
      includeInteractions,
      fileFormat,
      destination,
      whenToExport
    );
    toast({
      title: "Export job started",
      description: "Your export job is now underway and will be ready in about 34 minutes. We'll notify you once it's done, so you can download the files. In the meantime, you can keep an eye on the job status.",
      action: (
        <Button variant="outline" onClick={() => router.push("/phase1?tab=data-export")} className="mt-2">View export jobs</Button>
      ),
      duration: 10000,
    });
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const countsString = [
     profilesCount > 0 ? `${profilesCount.toLocaleString()} Profiles` : null,
     includeRelationships && relationshipsCount > 0 ? `${relationshipsCount.toLocaleString()} Relationships` : null,
     includeInteractions && interactionsCount > 0 ? `${interactionsCount.toLocaleString()} Interactions` : null,
   ].filter(Boolean).join(', ');

  // Filter out 'Customers' and 'Assets' from the summary for display
  const filteredEntityTypesSummary = useMemo(() => {
      return selectedEntityTypesSummary.filter(et => et.name !== 'Customers' && et.name !== 'Assets');
  }, [selectedEntityTypesSummary]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-lg font-semibold">Quick data export</DialogTitle>
        </DialogHeader>
        <div className="pt-4 px-6 pb-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">

          {/* Job Name */}
          <div className="space-y-2">
            <Label htmlFor="quickExportJobName" className="text-xs font-medium text-muted-foreground">Job name*</Label>
            <Input
              id="quickExportJobName"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Enter a name for this export job"
            />
          </div>

          {/* Data to export */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
               <h3 className="text-sm font-semibold text-foreground">Data to export</h3>
               <div className="flex items-center gap-1 text-xs">
                 <span className="text-muted-foreground">Switch to advanced mode for editing</span>
                 <Button 
                   variant="link" 
                   className="p-0 h-auto text-primary font-semibold text-xs" 
                   onClick={() => onAdvancedExportClick(includeRelationships, includeInteractions)}
                 >
                   ADVANCED EXPORT
                 </Button>
               </div>
             </div>

            <div className="bg-muted/50 p-4 rounded-md space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="text-muted-foreground">Entity types:</span>
                {filteredEntityTypesSummary.length > 0 ? (
                   filteredEntityTypesSummary.map((et, index) => (
                     <Badge key={index} variant="outline" className="font-normal bg-background text-foreground border-border">
                       {et.name}{et.totalAttributes !== undefined ? `: ${et.count}/${et.totalAttributes} attributes` : ` (${et.count})`}
                     </Badge>
                   ))
                ) : (
                   <span className="text-muted-foreground font-normal">No entity types selected</span>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quickIncludeRelationships"
                    checked={includeRelationships}
                    onCheckedChange={(checked) => setIncludeRelationships(Boolean(checked))}
                  />
                  <Label htmlFor="quickIncludeRelationships" className="text-sm font-normal text-foreground cursor-pointer">
                    Include all Relationships of selected entity profiles
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quickIncludeInteractions"
                    checked={includeInteractions}
                    onCheckedChange={(checked) => setIncludeInteractions(Boolean(checked))}
                  />
                  <Label htmlFor="quickIncludeInteractions" className="text-sm font-normal text-foreground cursor-pointer">
                    Include all Interactions of selected entity profiles
                  </Label>
                </div>
              </div>

              {countsString && (
                 <div className="text-sm text-foreground pt-3 font-semibold">
                   {countsString}
                 </div>
               )}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quickFileFormat" className="text-xs font-medium text-muted-foreground">File format</Label>
                <Select value={fileFormat} onValueChange={setFileFormat}>
                  <SelectTrigger id="quickFileFormat">
                    <SelectValue placeholder="Select file format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV Flattened">CSV Flattened</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="Parquet">Parquet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destination as plain text */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Destination</p>
                <p className="text-sm font-normal text-foreground">{destination}</p>
              </div>

              {/* When to export as plain text */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">When to export</p>
                <p className="text-sm font-normal text-foreground">{whenToExport}</p>
              </div>
            </div>
          </div>

        </div>
        <DialogFooter className="p-6 border-t bg-muted/30 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            CANCEL
          </Button>
          <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            EXPORT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 