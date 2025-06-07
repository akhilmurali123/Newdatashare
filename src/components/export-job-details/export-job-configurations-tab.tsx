import React from 'react';
import { ExportJobDetails } from '@/lib/mock-export-job-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ExportJobConfigurationsTabProps {
  jobDetails: ExportJobDetails; // Accept the full jobDetails object
}

const ExportJobConfigurationsTab: React.FC<ExportJobConfigurationsTabProps> = ({
  jobDetails,
}) => {
    const { configurations } = jobDetails; // Destructure from jobDetails

  // Function to render the configuration value based on its type
  const renderConfigValue = (item: ExportJobDetails['configurations'][0]) => {
    if (item.type === 'boolean') {
      return item.value ? <Check className="h-4 w-4 text-green-600" /> : 'No';
    } else if (Array.isArray(item.value)) {
         return item.value.join(', ');
    } else {
      return String(item.value); // Ensure value is string for display
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Configurations</h3>

      {/* Configurations List */}
      <Card>
        <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {configurations.map((config, index) => (
                    <div key={index} className="flex items-center">
                       <span className="font-medium w-1/2 pr-2">{config.label}:</span>
                       <span className="text-muted-foreground w-1/2">{renderConfigValue(config)}</span>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportJobConfigurationsTab; 