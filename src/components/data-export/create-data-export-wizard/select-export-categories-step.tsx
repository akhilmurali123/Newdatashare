'use client';
import type { SelectedDataType } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from 'react';

interface SelectExportCategoriesStepProps {
  dataTypes: SelectedDataType[];
  onDataTypeToggle: (dataTypeId: string) => void;
}

const SelectExportCategoriesStep: React.FC<SelectExportCategoriesStepProps> = ({
  dataTypes,
  onDataTypeToggle,
}) => {
  return (
    <div className="flex flex-col h-full p-6 bg-background"> {/* Ensure padding and background */}
      <CardHeader className="px-0 pt-0 pb-4 text-center"> {/* Added text-center */}
        <CardTitle className="text-xl sm:text-2xl">Select data type to include in the export</CardTitle>
        <CardDescription>Choose the type of data you want to export.</CardDescription>
      </CardHeader>

      <ScrollArea className="flex-grow mb-6 pr-4 -mr-4">
        <div className="max-w-md mx-auto w-full"> {/* Added wrapper for centering and max width */}
          <div className="grid grid-cols-1 gap-4"> {/* Changed to a single column grid */}
            {dataTypes.map((dataType) => (
              <Card
                key={dataType.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg",
                  dataType.selected ? "border-primary ring-2 ring-primary" : "border-border"
                )}
                onClick={() => onDataTypeToggle(dataType.id)}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <Checkbox
                    id={`dt-${dataType.id}`}
                    checked={dataType.selected}
                    onCheckedChange={() => onDataTypeToggle(dataType.id)} // Direct toggle, onClick on Card also works
                    className="h-5 w-5"
                    aria-labelledby={`label-dt-${dataType.id}`}
                  />
                  <label htmlFor={`dt-${dataType.id}`} id={`label-dt-${dataType.id}`} className="font-medium text-sm text-foreground flex-grow cursor-pointer">
                    {dataType.name}
                  </label>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SelectExportCategoriesStep; 