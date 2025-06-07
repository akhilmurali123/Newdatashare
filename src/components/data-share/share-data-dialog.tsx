'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { targetOptions } from '@/lib/types'; // Mock data

interface ShareDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSharing: (datasetName: string, description: string, target: TargetOption) => void;
  initialDatasetName?: string;
  initialDescription?: string;
  initialTargetId?: string;
}

export default function ShareDataDialog({ 
  isOpen, 
  onClose, 
  onStartSharing,
  initialDatasetName = '',
  initialDescription = '',
  initialTargetId = ''
}: ShareDataDialogProps) {
  const [datasetName, setDatasetName] = useState(initialDatasetName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(initialTargetId);

  // Update state when initial values change
  useEffect(() => {
    if (initialDatasetName) setDatasetName(initialDatasetName);
    if (initialDescription) setDescription(initialDescription);
    if (initialTargetId) setSelectedTargetId(initialTargetId);
  }, [initialDatasetName, initialDescription, initialTargetId]);

  const handleSubmit = () => {
    if (!datasetName || !selectedTargetId) {
      alert("Dataset name and target are required.");
      return;
    }
    const target = targetOptions.find(t => t.id === selectedTargetId);
    if (target) {
      onStartSharing(datasetName, description, target);
      // Reset fields
      setDatasetName('');
      setDescription('');
      setSelectedTargetId('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share data</DialogTitle>
          <DialogDescription>
            Provide details for your new data share configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="datasetName" className="text-right">
              Dataset name
            </Label>
            <Input
              id="datasetName"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., US Organizations Q3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional: Brief description of the dataset"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target" className="text-right">
              Target
            </Label>
            <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
              <SelectTrigger className="col-span-3">
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!datasetName || !selectedTargetId}>
            Start Sharing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
