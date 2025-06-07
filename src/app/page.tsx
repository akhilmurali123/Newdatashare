'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cpu, DatabaseZap } from 'lucide-react';

export default function SelectFlowPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 md:p-6 bg-background text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-12">
          Data exchange
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl"> {/* Changed max-w-md to max-w-xl */}
        <Button
          asChild
          className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
          // Removed disabled prop
        >
          <Link href="/ai-agent-flow">
            <Cpu className="h-5 w-5" />
            AI Agent Flow
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button
          asChild
          className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
        >
          <Link href="/phase1">
            <DatabaseZap className="h-5 w-5" />
            Data Share App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
