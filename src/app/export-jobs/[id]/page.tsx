'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockExportJob } from '@/lib/mock-export-job-data';
import ExportJobFilesTab from '@/components/export-job-details/export-job-files-tab';
import ExportJobDatasetTab from '@/components/export-job-details/export-job-dataset-tab';
import ExportJobConfigurationsTab from '@/components/export-job-details/export-job-configurations-tab';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExportJobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // In a real app, we would fetch the job details based on the ID
  // For now, we'll use mock data
  const jobDetails = mockExportJob;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/phase1?tab=data-export')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">{jobDetails.jobName}</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="dataset">Dataset</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <ExportJobFilesTab jobDetails={jobDetails} />
        </TabsContent>

        <TabsContent value="dataset">
          <ExportJobDatasetTab jobDetails={jobDetails} />
        </TabsContent>

        <TabsContent value="configurations">
          <ExportJobConfigurationsTab jobDetails={jobDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 