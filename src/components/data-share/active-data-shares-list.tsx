
import type { ActiveDataShare } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Share2, Trash2, PlusCircle, ListFilter, Copy, StopCircle } from "lucide-react"; // Added Copy, StopCircle

interface ActiveDataSharesListProps {
  shares: ActiveDataShare[];
  onCreateNew: () => void;
  onDeleteShare: (shareId: string) => void; // Kept for now if other parts of app use it, though UI button is removed
}

export default function ActiveDataSharesList({ shares, onCreateNew, onDeleteShare }: ActiveDataSharesListProps) {
  return (
    <div className="p-0 sm:p-6 bg-card rounded-lg shadow-md"> {/* Adjusted padding for consistency */}
      <div className="flex justify-between items-center mb-6 px-6 sm:px-0 pt-6 sm:pt-0"> {/* Add padding for inner content if parent has p-0 */}
        <h2 className="text-xl font-semibold text-foreground"> {/* Adjusted font size/weight */}
          Datasets | {shares.length} item{shares.length !== 1 ? 's' : ''}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <ListFilter className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Filters</span>
          </Button>
          <Button onClick={onCreateNew} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> CREATE NEW
          </Button>
        </div>
      </div>
      {shares.length === 0 ? (
         <div className="text-center py-10">
           <p className="text-muted-foreground text-lg">No active data shares found.</p>
           <p className="text-muted-foreground mt-2">Click "CREATE NEW" to get started.</p>
         </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead>Share destination</TableHead>
              <TableHead>Sharing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shares.map((share) => (
              <TableRow key={share.id}>
                <TableCell className="font-medium">{share.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">{share.description}</TableCell>
                <TableCell className="text-muted-foreground">{share.createdBy}</TableCell>
                <TableCell className="text-muted-foreground">{share.shareDestination}</TableCell>
                <TableCell>
                  <span className={share.sharingStatus === 'Active' ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                    {share.sharingStatus}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => alert(`Download ${share.name}`)} 
                            className="text-muted-foreground hover:text-primary focus:text-primary">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    {share.sharingStatus === 'Active' ? (
                      <Button variant="ghost" size="icon" onClick={() => alert(`Stop Sharing ${share.name}`)}
                              className="text-muted-foreground hover:text-destructive focus:text-destructive">
                        <StopCircle className="h-4 w-4" />
                        <span className="sr-only">Stop Sharing</span>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => alert(`Share ${share.name}`)}
                              className="text-muted-foreground hover:text-primary focus:text-primary">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => alert(`Copy ${share.name}`)}
                            className="text-muted-foreground hover:text-primary focus:text-primary">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    {/* Delete button removed as per request 
                    <Button variant="ghost" size="icon" onClick={() => onDeleteShare(share.id)}
                            className="text-destructive hover:text-destructive/80 focus:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

