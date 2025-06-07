
import { Button } from "@/components/ui/button";

interface DataShareWelcomeProps {
  onCreateDataShare: () => void;
}

export default function DataShareWelcome({ onCreateDataShare }: DataShareWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg shadow-md bg-card min-h-[calc(100vh-200px)]">
      <h2 className="text-3xl font-bold text-foreground mb-4">
        Welcome to Data share
      </h2>
      <p className="text-md text-muted-foreground max-w-2xl mb-8">
        Reltio Data share empower customers to seamlessly share curated, high-quality master data with analytical platforms to drive data analytics and informed decision-making.
      </p>
      <Button
        size="lg"
        onClick={onCreateDataShare}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        CREATE DATA SHARE
      </Button>
    </div>
  );
}
