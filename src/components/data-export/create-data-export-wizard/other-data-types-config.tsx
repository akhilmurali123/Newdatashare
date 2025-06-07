import React from 'react';
import type { ConfigurableDataCategory, SelectedAttribute } from '@/lib/types';

interface OtherDataTypesConfigProps {
  otherDataTypesConfig: ConfigurableDataCategory[];
  onOtherDataTypeToggle: (id: string) => void;
  onAttributesChange: (itemId: string, category: string, updatedAttributes: SelectedAttribute[]) => void;
}

const OtherDataTypesConfig: React.FC<OtherDataTypesConfigProps> = ({ otherDataTypesConfig }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Other Data Types (Placeholder)</h3>
      <ul>
        {otherDataTypesConfig.map(dt => (
          <li key={dt.id}>{dt.name} (selected: {dt.selected ? 'yes' : 'no'})</li>
        ))}
      </ul>
      <div className="text-xs text-muted-foreground mt-2">This is a placeholder for Other Data Types configuration.</div>
    </div>
  );
};

export default OtherDataTypesConfig; 