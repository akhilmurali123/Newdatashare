'use client';
import type { ChatMessage } from '@/lib/types';
import { Bot, User, Check, ThumbsUp, ThumbsDown, Copy as CopyIcon, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactMarkdown from 'react-markdown';
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from '@/components/ui/table';

interface RiaChatMessageProps {
  message: ChatMessage;
}

export default function RiaChatMessage({ message }: RiaChatMessageProps) {
  const isRia = message.sender === 'ria';

  const renderTextContent = (text: string | undefined) => {
    if (!text) return null;
    if (isRia) {
      return (
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-sm whitespace-pre-wrap" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-sm" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1 text-sm" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            // Add more custom renderers if needed
          }}
        >
          {text}
        </ReactMarkdown>
      );
    }
    // User messages: fallback to plain text rendering
    return text.split('\n').map((line, index, arr) => (
      <div key={index} className="text-sm whitespace-pre-wrap mb-1">{line}</div>
    ));
  };

  return (
    <div className={cn('flex mb-4', isRia ? 'justify-start' : 'justify-end')}>
      <div className={cn('flex items-start gap-2.5 max-w-[85%]', isRia ? '' : 'flex-row-reverse')}> {/* Increased max-width for card */}
        {isRia ? (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Bot size={20} />
          </div>
        ) : (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted text-foreground flex items-center justify-center font-semibold">
            U 
          </div>
        )}
        <div
          className={cn(
            'p-3 rounded-lg shadow-sm w-full relative group',
            isRia ? 'bg-muted/60 rounded-tl-none' : 'bg-card text-card-foreground rounded-tr-none border'
          )}
        >
          <TooltipProvider> {/* Added TooltipProvider here to wrap potential tooltips */}
            {message.contentType === 'summaryCard' && message.summaryDetails ? (
              <div className="w-full">
                {message.summaryDetails.title && <p className="font-semibold mb-1 text-sm text-foreground">{message.summaryDetails.title}</p>}
                <ul className="space-y-0.5 text-sm">
                  {message.summaryDetails.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      {item.value && <span className="ml-2 text-foreground">{item.value}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : message.contentType === 'dataSelectionSummary' && message.dataSelectionSummaryDetails ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[400px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Filters Applied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {message.dataSelectionSummaryDetails?.entityTypes?.items.map((item, index) => {
                      const filterObj = message.dataSelectionSummaryDetails?.filtersApplied?.items.find(f => f.entityName === item.name);
                      const filterDescription = filterObj?.filterDescription || 'No filters applied.';
                      return (
                        <TableRow key={index}>
                          <TableCell className="align-top w-1/3">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">✓</span>
                              <span className="font-semibold">{item.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {item.attributeSummary}
                                {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="ml-1 cursor-pointer text-primary">🛈</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <ul className="text-xs">
                                        {item.selectedAttributes.map((attr, i) => (
                                          <li key={i}>{attr}</li>
                                        ))}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top w-2/3">
                            {filterDescription.split(' AND ').map((filter, i) => (
                              <div key={i}>{filter}</div>
                            ))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : message.contentType === 'attributeTable' && message.attributeTableDetails ? (
              <div className="w-full">
                {message.attributeTableDetails.title && (
                  <p className="font-semibold mb-2 text-sm text-foreground">{message.attributeTableDetails.title}</p>
                )}
                <div className="overflow-x-auto max-h-80 border rounded-md">
                  <table className="min-w-full text-xs border-collapse">
                    <thead className="bg-muted sticky top-0 z-10">
                      <tr>
                        {message.attributeTableDetails.columns.map((col, idx) => (
                          <th key={idx} className="px-3 py-2 font-semibold text-left border-b border-border text-muted-foreground whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {message.attributeTableDetails.rows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/40'}>
                          {row.map((cell, cidx) => (
                            <td key={cidx} className="px-3 py-1 border-b border-border whitespace-nowrap align-top">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              renderTextContent(message.text)
            )}
          </TooltipProvider>
           <p className="text-xs text-muted-foreground mt-1.5 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {/* Action icons for RIA messages */}
          {isRia && (
            <div className="absolute right-2 bottom-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-10 bg-background/80 rounded-md px-1.5 py-0.5 shadow-sm border border-border">
              <button type="button" className="hover:text-primary text-muted-foreground p-1" title="Like">
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button type="button" className="hover:text-primary text-muted-foreground p-1" title="Dislike">
                <ThumbsDown className="h-4 w-4" />
              </button>
              <button type="button" className="hover:text-primary text-muted-foreground p-1" title="Copy" onClick={() => {navigator.clipboard.writeText(message.text || '')}}>
                <CopyIcon className="h-4 w-4" />
              </button>
              <button type="button" className="hover:text-primary text-muted-foreground p-1" title="Pin">
                <Pin className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    
