import type { DotColor } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DataStatusIndicatorProps {
  color: DotColor;
}

export default function DataStatusIndicator({ color }: DataStatusIndicatorProps) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full mr-2 shrink-0',
        {
          'bg-green-500': color === 'green',
          'bg-gray-400': color === 'gray',
          'bg-yellow-400': color === 'yellow',
          'bg-red-500': color === 'red',
        }
      )}
      aria-hidden="true"
    />
  );
}
