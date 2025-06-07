'use client';

import type {
  SelectedDataType,
  EntityTypeConfig,
  ConfigurableDataCategory,
  SampleProfile,
  SelectedAttribute
} from '@/lib/types';

// Define steps for the Export Wizard (updated to include configureData step)
export const WIZARD_STEPS = [
  { id: 'selectData', label: 'Select data type' },
  { id: 'configureData', label: 'Configure data' }, // New step
  { id: 'reviewDataset', label: 'Review dataset' },
  { id: 'configuration', label: 'Export configuration' }, // Renamed for clarity
] as const;

// Define a type for the export wizard progress steps, matching the WIZARD_STEPS ids
export type ExportWizardProgressStep = 'selectData' | 'configureData' | 'reviewDataset' | 'configuration';

// Define interface for Export Configuration
export interface ExportConfiguration {
  selectedDataTypes: SelectedDataType[]; // Top-level types
  entityTypes: EntityTypeConfig[];
  relationshipTypes: ConfigurableDataCategory[];
  interactionTypes: ConfigurableDataCategory[];
  otherDataTypes: ConfigurableDataCategory[];
  jobName: string;
  dataWithChanges: string;
  fileFormat: string;
  destination: string;
  whenToExport: string;
  // Add other export-specific configuration fields as needed
}

// Mock cloud destination settings for demo purposes
export interface CloudDestinationSetting {
  id: string;
  name: string;
  destinationType: string;
  region?: string;
  bucketName?: string;
  path?: string;
}

export const mockCloudSettings: CloudDestinationSetting[] = [
  {
    id: 'aws-prod',
    name: 'AWS S3 - Production',
    destinationType: 'AWS S3',
    region: 'us-east-1',
    bucketName: 'my-prod-bucket',
    path: '/exports',
  },
  {
    id: 'gcp-staging',
    name: 'Google Cloud Storage - Staging',
    destinationType: 'Google Cloud Storage',
    region: 'us-central1',
    bucketName: 'my-staging-bucket',
    path: '/data',
  },
]; 