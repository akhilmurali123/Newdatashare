'use client';
import { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TargetOption } from '@/lib/types';
import { targetOptions } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface QuickDataShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSharing: (
    datasetName: string,
    description: string,
    target: TargetOption,
    includeRelationships: boolean,
    includeInteractions: boolean
  ) => void;
  totalProfiles: number;
  entityTypeSummaries?: { name: string; selectedAttributes: number; totalAttributes: number }[];
  onAdvancedShareClick: (includeRelationships: boolean, includeInteractions: boolean) => void;
}

export default function QuickDataShareModal({
  isOpen,
  onClose,
  onStartSharing,
  totalProfiles,
  entityTypeSummaries = [],
  onAdvancedShareClick,
}: QuickDataShareModalProps) {
  const [datasetName, setDatasetName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<string | undefined>(undefined);
  const [includeRelationships, setIncludeRelationships] = useState(false);
  const [includeInteractions, setIncludeInteractions] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Reset fields when modal opens
      setDatasetName('Organizations, suppliers and products data share');
      setDescription('');
      setIncludeRelationships(false);
      setIncludeInteractions(false);
      if (!selectedTargetId && targetOptions.length > 0) {
        setSelectedTargetId(targetOptions[0].id);
      }
    }
  }, [isOpen, selectedTargetId]);

  const handleSubmit = () => {
    if (!datasetName || !selectedTargetId) {
      alert("Dataset name and target are required.");
      return;
    }
    const target = targetOptions.find(t => t.id === selectedTargetId);
    if (target) {
      onStartSharing(datasetName, description, target, includeRelationships, includeInteractions);
      toast({
        title: "Data sharing is activated",
        description: "To manage sharing, visit Data out application",
        action: (
          <Button variant="outline" onClick={() => router.push("/phase1?tab=data-share")} className="mt-2">Data out application</Button>
        ),
        duration: 10000, // 10 seconds
      });
    }
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const displayedEntityTypes = entityTypeSummaries.slice(0, 2);
  const remainingEntityTypeCount = entityTypeSummaries.length - 2;

  const MOCK_RELATIONSHIPS_COUNT = 567;
  const MOCK_INTERACTIONS_COUNT = 5638;

  const countsString = [
    `${totalProfiles.toLocaleString()} profiles`,
    includeRelationships && `${MOCK_RELATIONSHIPS_COUNT.toLocaleString()} relationships`,
    includeInteractions && `${MOCK_INTERACTIONS_COUNT.toLocaleString()} interactions`
  ].filter(Boolean).join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-lg font-semibold">Quick data share</DialogTitle>
        </DialogHeader>
        <div className="pt-4 px-6 pb-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <Label htmlFor="quickDatasetName" className="text-xs font-medium text-muted-foreground">Dataset name*</Label>
            <Input
              id="quickDatasetName"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="mt-1"
              placeholder="e.g., US Organization Q3"
            />
          </div>
          <div>
            <Label htmlFor="quickDescription" className="text-xs font-medium text-muted-foreground">Description</Label>
            <Textarea
              id="quickDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={2}
              placeholder="Optional: Brief description of the dataset"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <h3 className="text-sm font-semibold text-foreground">Data to share</h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Switch to advanced mode for editing</span>
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary font-semibold text-xs" 
                onClick={() => onAdvancedShareClick(includeRelationships, includeInteractions)}
              >
                ADVANCED SHARE
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-md space-y-3">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="text-muted-foreground">Entity types:</span>
              {displayedEntityTypes.map(et => (
                <Badge key={et.name} variant="outline" className="font-normal bg-background text-foreground border-border">
                  {et.name}: {et.selectedAttributes}/{et.totalAttributes} attributes
                </Badge>
              ))}
              {remainingEntityTypeCount > 0 && (
                <Badge variant="outline" className="font-normal bg-background text-foreground border-border">
                  +{remainingEntityTypeCount} more
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRelationships"
                  checked={includeRelationships}
                  onCheckedChange={(checked) => setIncludeRelationships(Boolean(checked))}
                />
                <Label htmlFor="includeRelationships" className="text-sm font-normal text-foreground cursor-pointer">
                  Include relationships between selected entities
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInteractions"
                  checked={includeInteractions}
                  onCheckedChange={(checked) => setIncludeInteractions(Boolean(checked))}
                />
                <Label htmlFor="includeInteractions" className="text-sm font-normal text-foreground cursor-pointer">
                  Include interactions in which selected entities are members
                </Label>
              </div>
            </div>

            <div className="text-sm text-foreground pt-3 font-semibold flex items-center gap-1">
              {countsString}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>The counts reflect the current data snapshot. The shared data will continue to update over time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div>
            <Label htmlFor="quickTarget" className="text-xs font-medium text-muted-foreground">Datashare destination*</Label>
            <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
              <SelectTrigger id="quickTarget" className="mt-1">
                <SelectValue placeholder="Select data warehouse" />
              </SelectTrigger>
              <SelectContent>
                {targetOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="p-6 border-t bg-muted/30">
          <Button type="button" variant="outline" onClick={onClose}>
            CANCEL
          </Button>
          <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!datasetName || !selectedTargetId}>
            START SHARING
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
