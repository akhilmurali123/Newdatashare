'use client';
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Will need for attribute selection later

import type {
  SelectedDataType,
  EntityTypeConfig,
  ConfigurableDataCategory,
  SampleProfile,
  SelectedAttribute,
  DataCategoryType,
} from '@/lib/types';

// Import other necessary UI components as needed (e.g., for attribute selection)

interface SelectExportDataTypesStepProps {
  // Props for top-level data type toggling (if used)
  dataTypes: SelectedDataType[];
  onDataTypeToggle: (dataTypeId: string) => void;

  // Props for detailed configuration of categories
  entityTypes: EntityTypeConfig[];
  onEntityTypeToggle: (entityTypeId: string) => void;
  relationshipTypes: ConfigurableDataCategory[];
  onRelationshipTypeToggle: (relationshipId: string) => void;
  interactionTypes: ConfigurableDataCategory[];
  onInteractionTypeToggle: (interactionId: string) => void;
  otherDataTypes: ConfigurableDataCategory[];
  onOtherDataTypeToggle: (otherDataTypeId: string) => void;

  // Props for attribute selection/configuration
  onAttributesChange: (
    itemId: string,
    category: DataCategoryType,
    updatedAttributes: SelectedAttribute[]
  ) => void;
  getSampleData: (itemId: string, category: DataCategoryType) => SampleProfile[];
  onNext?: () => void; // Add onNext prop for the Next button
  isNextDisabled?: boolean; // Add isNextDisabled prop
}

const SelectExportDataTypesStep: React.FC<SelectExportDataTypesStepProps> = ({
  dataTypes,
  onDataTypeToggle,
  entityTypes,
  onEntityTypeToggle,
  relationshipTypes,
  onRelationshipTypeToggle,
  interactionTypes,
  onInteractionTypeToggle,
  otherDataTypes,
  onOtherDataTypeToggle,
  onAttributesChange,
  getSampleData,
  onNext, // Destructure onNext
  isNextDisabled, // Destructure isNextDisabled
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Data Types for Export</h2>

      <Accordion type="multiple" className="w-full">
        {/* Entity Types Section */}
        <AccordionItem value="entity-types">
          <AccordionTrigger className="text-lg font-medium">
            Entity Types ({entityTypes.filter(et => et.selected).length}/{entityTypes.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-3 py-4">
            {entityTypes.map(entityType => (
              <div key={entityType.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`entity-${entityType.id}`}
                    checked={entityType.selected}
                    onCheckedChange={() => onEntityTypeToggle(entityType.id)}
                  />
                  <Label htmlFor={`entity-${entityType.id}`} className="text-sm font-normal cursor-pointer">
                    {entityType.name}
                  </Label>
                </div>
                {entityType.selected && entityType.attributes && entityType.attributes.length > 0 && (
                    // Placeholder for Attribute selection UI trigger
                   <Button variant="link" size="sm" className="h-auto p-0 text-xs font-semibold">
                      Configure Attributes ({entityType.selectedAttributesCount}/{entityType.attributes.length})
                   </Button>
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Relationship Types Section */}
        <AccordionItem value="relationship-types">
          <AccordionTrigger className="text-lg font-medium">
            Relationship Types ({relationshipTypes.filter(rt => rt.selected).length}/{relationshipTypes.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-3 py-4">
            {relationshipTypes.map(relationshipType => (
              <div key={relationshipType.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`relationship-${relationshipType.id}`}
                  checked={relationshipType.selected}
                  onCheckedChange={() => onRelationshipTypeToggle(relationshipType.id)}
                />
                <Label htmlFor={`relationship-${relationshipType.id}`} className="text-sm font-normal cursor-pointer">
                  {relationshipType.name}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Interaction Types Section */}
        <AccordionItem value="interaction-types">
          <AccordionTrigger className="text-lg font-medium">
            Interaction Types ({interactionTypes.filter(it => it.selected).length}/{interactionTypes.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-3 py-4">
            {interactionTypes.map(interactionType => (
              <div key={interactionType.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`interaction-${interactionType.id}`}
                  checked={interactionType.selected}
                  onCheckedChange={() => onInteractionTypeToggle(interactionType.id)}
                />
                <Label htmlFor={`interaction-${interactionType.id}`} className="text-sm font-normal cursor-pointer">
                  {interactionType.name}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Other Data Types Section */}
        <AccordionItem value="other-data-types">
          <AccordionTrigger className="text-lg font-medium">
            Other Data ({otherDataTypes.filter(odt => odt.selected).length}/{otherDataTypes.length})
          </AccordionTrigger>
          <AccordionContent className="space-y-3 py-4">
            {otherDataTypes.map(otherDataType => (
              <div key={otherDataType.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`other-${otherDataType.id}`}
                  checked={otherDataType.selected}
                  onCheckedChange={() => onOtherDataTypeToggle(otherDataType.id)}
                />
                <Label htmlFor={`other-${otherDataType.id}`} className="text-sm font-normal cursor-pointer">
                  {otherDataType.name}
                </Label>
              </div>
            ))}
             {/* TODO: Add attribute configuration for relevant 'Other' types like Sample Profiles if needed */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Placeholder for Relationships and Interactions count based on selection */}
       {/* This might be complex as it depends on the actual data graph, maybe show a simplified count or "Calculated after selection" */}
       <div className="text-sm text-muted-foreground mt-4">
           Relationships and Interactions counts will be displayed based on selected entity profiles.
           {/* TODO: Potentially calculate and display a mock or estimated count here */}
       </div>

    </div>
  );
};

export default SelectExportDataTypesStep; 