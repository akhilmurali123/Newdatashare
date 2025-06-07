export interface DataTypeOption {
  id: string;
  name: string;
  description?: string; // Optional description for display
}

export interface SelectedDataType extends DataTypeOption {
  selected: boolean;
}

export interface Attribute {
  id: string;
  name: string;
  category: 'common' | 'system' | string; // Allow custom categories
}

export interface SelectedAttribute extends Attribute {
  selected: boolean;
}

export type DataCategoryType = 'entity' | 'relationship' | 'interaction' | 'other';


export interface EntityTypeConfig {
  id: string;
  name: string;
  count: number;
  totalAttributes: number;
  selectedAttributesCount: number;
  attributes: SelectedAttribute[];
  selected: boolean;
  category: 'entity'; // To distinguish
}

// Generic type for Relationships, Interactions, Other data types
export interface ConfigurableDataCategory {
  id: string;
  name: string;
  count: number;
  totalAttributes: number;
  selectedAttributesCount: number;
  attributes: SelectedAttribute[];
  selected: boolean;
  relatedEntities?: string; // Specific to relationships
  memberTypes?: string; // Specific to interactions
  category: DataCategoryType;
}


export interface ActiveDataShare {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  shareDestination: string;
  sharingStatus: 'Active' | 'Not active';
  // Summary of data included, for display or review
  summary?: {
    profiles?: number;
    relationships?: number;
    interactions?: number;
    otherData?: number; // Added for other data types
    mergeTrees?: number; // Keep for potential specific backward compatibility or detailed summary
    matchData?: number; // Keep for potential specific backward compatibility or detailed summary
  };
}

export interface DataShareConfiguration {
  selectedDataTypes: SelectedDataType[];
  entityTypes: EntityTypeConfig[];
  relationshipTypes: ConfigurableDataCategory[];
  interactionTypes: ConfigurableDataCategory[];
  otherDataTypes: ConfigurableDataCategory[];
  datasetName: string;
  description: string;
  target: string;
}

export type WizardStep = 'selectTypes' | 'configureAndReview'; // Simplified
export type ConfigureProgressStep = 'selectDataTypes' | 'selectData' | 'reviewDataset';

export interface TargetOption {
  id: string;
  name: string;
}

// Sample data for preview
export type SampleProfile = Record<string, string | number | boolean | null>;

// Chat Message type for RIA

interface SimpleSummaryItem {
  label: string;
  value: string;
}

interface DataSelectionSummaryAttributeItem {
  name: string;
  attributeSummary?: string; // e.g., "(3/12 attributes)"
  selectedAttributes?: string[]; // For tooltip
}

interface DataSelectionSummarySection<T> {
  title: string;
  items: T[];
}

export interface DataSelectionSummaryDetails {
  entityTypes?: DataSelectionSummarySection<DataSelectionSummaryAttributeItem>;
  filtersApplied?: DataSelectionSummarySection<{ entityName: string; filterDescription: string }>;
  relatedData?: DataSelectionSummarySection<DataSelectionSummaryAttributeItem>;
}

// Add new interface for attribute table details
interface AttributeTableDetails {
  title: string;
  columns: string[];
  rows: Array<[string, string, string]>; // [name, description, count]
}

export interface ChatMessage {
  id: string;
  sender: 'ria' | 'user';
  text?: string; // Text content
  timestamp: number;
  contentType?: 'text' | 'summaryCard' | 'dataSelectionSummary' | 'attributeTable';
  summaryDetails?: { // For simple key-value summary cards
    title?: string;
    items: SimpleSummaryItem[];
  };
  dataSelectionSummaryDetails?: DataSelectionSummaryDetails;
  attributeTableDetails?: AttributeTableDetails; // Add new field for attribute table
  useTimeout?: boolean; // Whether to use a delay before showing this message
  delay?: number; // Delay in milliseconds before showing this message
}

// Types for the combined Datasets list in AI Agent Flow
export type DotColor = 'green' | 'gray' | 'yellow' | 'red';

export interface DataShareInfo {
  display: string; // "Microsoft fabric (Active)", "Not configured"
  dotColor: DotColor;
  actionIcon?: 'play'; // Icon to show if configured but not active
}

export interface FileExportInfo {
  display: string; // "Not configured", "AWS S3 - bucket name (Active)", "Direct download (In-progress)"
  dotColor: DotColor;
  actionIcons?: ('refresh' | 'link' | 'download')[];
}

export interface DatasetListItem {
  id: string;
  name: string;
  createdBy: string;
  dataShare: DataShareInfo;
  fileExport: FileExportInfo;
}

// Types for Export Jobs list
export interface ExportJobListItem {
  id: string;
  name: string;
  status: string; // e.g., 'Yet to start', 'Failed', 'In-Progress', 'Completed'
  statusColor: DotColor; // Map status to color: gray (Yet to start), red (Failed), yellow (In-Progress), green (Completed)
  createdBy: string;
  exportDestination: string; // e.g., 'Direct download', 'AWS S3 (bucket name)'
  schedule: string; // e.g., 'One time', 'Repeats every week'
  actionIcons: ('view' | 'download' | 'link' | 'copy' | 'play' | 'stop')[]; // Icons based on screenshot
  summary?: { // Add optional summary property
    dataTypes: string; // e.g., 'Entities, Relationships'
    // Add other relevant summary fields if needed
  };
}

// Mock data for Export Jobs List
export const MOCK_EXPORT_JOBS: ExportJobListItem[] = [
  {
    id: 'exp1',
    name: 'Customers_US - Sep 2024',
    status: 'Yet to start',
    statusColor: 'gray',
    createdBy: 'Alex@example.com',
    exportDestination: 'Direct download',
    schedule: 'One time',
    actionIcons: ['view', 'play', 'download', 'copy'], // Clock, Play, Download, Copy from screenshot
  },
  {
    id: 'exp2',
    name: 'User Activities - Sep - Aug 2024',
    status: 'Failed',
    statusColor: 'red',
    createdBy: 'Mathew@example.com',
    exportDestination: 'AWS S3 ( bucket name )',
    schedule: 'Repeats every week on Monday',
    actionIcons: ['view', 'stop', 'link', 'copy'], // Clock, Stop, Link, Copy from screenshot
  },
  {
    id: 'exp3',
    name: 'Customers latest July',
    status: 'In-Progress',
    statusColor: 'yellow',
    createdBy: 'Pradeep@example.com',
    exportDestination: 'AWS S3 ( bucket name )',
    schedule: 'Repeats every month on 12th day of the month',
    actionIcons: ['view', 'stop', 'link', 'copy'], // Clock, Stop, Link, Copy from screenshot
  },
  {
    id: 'exp4',
    name: 'Profiles for analytics- Aug 2024',
    status: 'Completed',
    statusColor: 'green',
    createdBy: 'Sara@example.com',
    exportDestination: 'Direct download',
    schedule: 'One time',
    actionIcons: ['view', 'download', 'copy'], // Clock, Download, Copy from screenshot
  },
];

// Search Page Result Item Type
export interface SearchResultItem {
  profile: string;
  name?: string;
  lastName?: string;
  mobilePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}


export const initialDataTypes: SelectedDataType[] = [
  { id: 'entities', name: 'Entities', selected: false },
  { id: 'relationships', name: 'Relationships', selected: false },
  { id: 'interactions', name: 'Interactions', selected: false },
  { id: 'mergeTree', name: 'Merge tree', selected: false },
  { id: 'matchData', name: 'Match data', selected: false },
  { id: 'activityLog', name: 'Activity log', selected: false },
  { id: 'workflowTasks', name: 'Workflow tasks', selected: false },
];

export const initialEntityTypes: EntityTypeConfig[] = [
  { id: 'organization', name: 'Organizations', count: 500, totalAttributes: 12, selectedAttributesCount: 0, attributes: [], selected: false, category: 'entity' },
  { id: 'product', name: 'Products', count: 300, totalAttributes: 15, selectedAttributesCount: 0, attributes: [], selected: false, category: 'entity' },
  { id: 'supplier', name: 'Suppliers', count: 250, totalAttributes: 20, selectedAttributesCount: 0, attributes: [], selected: false, category: 'entity' },
  { id: 'asset', name: 'Assets', count: 150, totalAttributes: 18, selectedAttributesCount: 0, attributes: [], selected: false, category: 'entity' },
  { id: 'employee', name: 'Employees', count: 80, totalAttributes: 22, selectedAttributesCount: 0, attributes: [], selected: false, category: 'entity' },
  { id: 'customer', name: 'Customers', count: 24, totalAttributes: 10, selectedAttributesCount: 0, attributes: [], selected: false, category: 'entity' },
];

// Populate attributes for Organization (example)
initialEntityTypes.find(et => et.id === 'organization')!.attributes = [
  { id: 'org_name', name: 'Name', category: 'common', selected: false },
  { id: 'org_email', name: 'Email', category: 'common', selected: false },
  { id: 'org_address', name: 'Address', category: 'common', selected: false },
  { id: 'org_mobile', name: 'Mobile', category: 'common', selected: false },
  { id: 'org_landline', name: 'Land line', category: 'common', selected: false },
  { id: 'org_year', name: 'Year', category: 'common', selected: false },
  { id: 'org_doj', name: 'Date of joining', category: 'common', selected: false },
  { id: 'org_legal_status', name: 'Legal status', category: 'common', selected: false },
  { id: 'org_industry', name: 'Industry', category: 'common', selected: false }, // Added for selection
  { id: 'org_location', name: 'Location', category: 'common', selected: false }, // Added for selection
  { id: 'org_crosswalk', name: 'Crosswalk info...', category: 'system', selected: false },
  { id: 'org_created_by', name: 'Created by', category: 'system', selected: false },
];
initialEntityTypes.find(et => et.id === 'organization')!.totalAttributes = initialEntityTypes.find(et => et.id === 'organization')!.attributes.length;

initialEntityTypes.find(et => et.id === 'product')!.attributes = Array.from({ length: 15 }, (_, i) => ({ id: `prod_attr_${i}`, name: `Product Attribute ${i+1}`, category: i < 5 ? 'common' : 'custom', selected: false }));
initialEntityTypes.find(et => et.id === 'product')!.totalAttributes = initialEntityTypes.find(et => et.id === 'product')!.attributes.length;

initialEntityTypes.find(et => et.id === 'supplier')!.attributes = Array.from({ length: 20 }, (_, i) => ({ id: `sup_attr_${i}`, name: `Supplier Attribute ${i+1}`, category: i < 5 ? 'common' : 'custom', selected: false }));
initialEntityTypes.find(et => et.id === 'supplier')!.totalAttributes = initialEntityTypes.find(et => et.id === 'supplier')!.attributes.length;

initialEntityTypes.find(et => et.id === 'customer')!.attributes = Array.from({ length: 10 }, (_, i) => ({ id: `cust_attr_${i}`, name: `Customer Attribute ${i+1}`, category: i < 3 ? 'common' : 'custom', selected: false }));
initialEntityTypes.find(et => et.id === 'customer')!.totalAttributes = initialEntityTypes.find(et => et.id === 'customer')!.attributes.length;


// Attributes for relationship types
const partnersWithAttributes: SelectedAttribute[] = Array.from({ length: 3 }, (_, i) => ({ id: `pw_attr_${i+1}`, name: `Partners With Attribute ${i+1}`, category: 'common', selected: true }));
const procuresFromAttributes: SelectedAttribute[] = Array.from({ length: 2 }, (_, i) => ({ id: `pf_attr_${i+1}`, name: `Procures From Attribute ${i+1}`, category: 'common', selected: true }));
const manufacturesAttributes: SelectedAttribute[] = Array.from({ length: 3 }, (_, i) => ({ id: `m_attr_${i+1}`, name: `Manufactures Attribute ${i+1}`, category: 'common', selected: true }));
const suppliedByAttributes: SelectedAttribute[] = Array.from({ length: 4 }, (_, i) => ({ id: `sb_attr_${i+1}`, name: `Supplied By Attribute ${i+1}`, category: 'common', selected: true }));


export const initialRelationshipTypes: ConfigurableDataCategory[] = [
  {
    id: 'partners_with',
    name: 'Partners With',
    relatedEntities: 'Organization · Organization',
    count: 349,
    totalAttributes: 5,
    selectedAttributesCount: 5,
    attributes: Array.from({ length: 5 }, (_, i) => ({ id: `rel_pw_attr_${i}`, name: `Partners With Attr ${i+1}`, category: 'common', selected: true })),
    selected: false,
    category: 'relationship'
  },
  {
    id: 'procures_from',
    name: 'Procures From',
    relatedEntities: 'Supplier · Organization',
    count: 238,
    totalAttributes: 5,
    selectedAttributesCount: 5,
    attributes: Array.from({ length: 5 }, (_, i) => ({ id: `rel_pf_attr_${i}`, name: `Procures From Attr ${i+1}`, category: 'common', selected: true })),
    selected: false,
    category: 'relationship'
  },
  {
    id: 'manufactures',
    name: 'Manufactures',
    relatedEntities: 'Organization · Product',
    count: 123,
    totalAttributes: 5,
    selectedAttributesCount: 5,
    attributes: Array.from({ length: 5 }, (_, i) => ({ id: `rel_m_attr_${i}`, name: `Manufactures Attr ${i+1}`, category: 'common', selected: true })),
    selected: true,
    category: 'relationship'
  },
  {
    id: 'supplied_by',
    name: 'Supplied By',
    relatedEntities: 'Supplier · Product',
    count: 234,
    totalAttributes: 5,
    selectedAttributesCount: 5,
    attributes: Array.from({ length: 5 }, (_, i) => ({ id: `rel_sb_attr_${i}`, name: `Supplied By Attr ${i+1}`, category: 'common', selected: true })),
    selected: false,
    category: 'relationship'
  },
];

const generateAttributes = (idPrefix: string, total: number, selectedCount: number): SelectedAttribute[] => {
  return Array.from({ length: total }, (_, i) => ({
    id: `${idPrefix}_attr_${i+1}`,
    name: `Attribute ${i+1}`,
    category: 'common', // Assuming common for simplicity
    selected: i < selectedCount,
  }));
};

export const initialInteractionTypes: ConfigurableDataCategory[] = [
  {
    id: 'purchase',
    name: 'Purchase',
    memberTypes: 'Organization, Product, Employees',
    count: 5000,
    totalAttributes: 4,
    selectedAttributesCount: 4,
    attributes: generateAttributes('purchase', 4, 4),
    selected: true,
    category: 'interaction',
  },
  {
    id: 'service_request',
    name: 'Service Request -',
    memberTypes: 'Organization, Product',
    count: 4000,
    totalAttributes: 5,
    selectedAttributesCount: 5,
    attributes: generateAttributes('service_request', 5, 5),
    selected: false,
    category: 'interaction',
  },
  {
    id: 'website_visit',
    name: 'Website visit',
    memberTypes: 'Product, Customer',
    count: 3200,
    totalAttributes: 4, 
    selectedAttributesCount: 3,
    attributes: generateAttributes('website_visit', 4, 3),
    selected: false,
    category: 'interaction',
  },
  {
    id: 'quality_check',
    name: 'Quality Check',
    memberTypes: 'Organization, Supplier',
    count: 2000,
    totalAttributes: 7, 
    selectedAttributesCount: 5,
    attributes: generateAttributes('quality_check', 7, 5),
    selected: false,
    category: 'interaction',
  },
  {
    id: 'warranty_claim',
    name: 'Warranty Claim',
    memberTypes: 'Customer, Product',
    count: 1000,
    totalAttributes: 4,
    selectedAttributesCount: 4,
    attributes: generateAttributes('warranty_claim', 4, 4),
    selected: false,
    category: 'interaction',
  },
];


export const initialOtherDataTypesConfig: ConfigurableDataCategory[] = [
  { 
    id: 'mergeTree', 
    name: 'Merge tree', 
    count: 400, 
    totalAttributes: 8, 
    selectedAttributesCount: 8, 
    attributes: generateAttributes('mergeTree', 8, 8), 
    selected: false, 
    category: 'other' 
  },
  { 
    id: 'matchData', 
    name: 'Match data', 
    count: 300, 
    totalAttributes: 8, 
    selectedAttributesCount: 8, 
    attributes: generateAttributes('matchData', 8, 8), 
    selected: false, 
    category: 'other' 
  },
  { 
    id: 'activityLog', 
    name: 'Activity log', 
    count: 12000, 
    totalAttributes: 4, 
    selectedAttributesCount: 3, 
    attributes: generateAttributes('activityLog', 4, 3), 
    selected: false, 
    category: 'other' 
  },
  { 
    id: 'workflowTasks', 
    name: 'Workflow tasks', 
    count: 300, 
    totalAttributes: 7, 
    selectedAttributesCount: 5, 
    attributes: generateAttributes('workflowTasks', 7, 5), 
    selected: false, 
    category: 'other' 
  },
];

// Helper to generate random dates within last year
const getRandomDate = () => {
  const now = new Date();
  const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return new Date(pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime()));
};

// Helper to generate random company names
const companyNames = [
  'Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Corp', 'Stark Industries',
  'Wayne Enterprises', 'Oscorp', 'Cyberdyne', 'Weyland-Yutani', 'Tyrell Corp',
  'Soylent Corp', 'Omni Consumer Products', 'Nakatomi Trading', 'Dunder Mifflin',
  'Prestige Worldwide', 'Vandelay Industries', 'Hooli', 'Pied Piper', 'Aviato',
  'Massive Dynamic'
];

// Helper to generate random industries
const industries = [
  'Technology', 'Manufacturing', 'Finance', 'Healthcare', 'Retail',
  'Energy', 'Transportation', 'Media', 'Education', 'Construction'
];

// Helper to generate random locations
const locations = [
  'US', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'Singapore',
  'India', 'Brazil', 'Mexico', 'South Africa', 'UAE', 'China', 'South Korea'
];

export const sampleOrganizationData: SampleProfile[] = Array.from({length: 20}, (_, i) => ({
  'Org ID': `org${i + 1}`,
  'Name': companyNames[i],
  'Industry': industries[i % industries.length],
  'Location': locations[i % locations.length],
  'Founded': getRandomDate().getFullYear(),
  'Employee Count': Math.floor(Math.random() * 10000) + 100,
  'Revenue': `$${(Math.random() * 1000000000).toFixed(2)}`,
  'Website': `www.${companyNames[i].toLowerCase().replace(/\s+/g, '')}.com`
}));

export const sampleSupplierData: SampleProfile[] = Array.from({length: 20}, (_, i) => ({
  'Supplier ID': `sup${i + 1}`,
  'Name': `Supplier ${String.fromCharCode(65 + i)}`,
  'Location': locations[i % locations.length],
  'Rating': (Math.random() * 2 + 3).toFixed(1),
  'Category': industries[i % industries.length],
  'Contact Person': `John Doe ${i + 1}`,
  'Email': `supplier${i + 1}@example.com`,
  'Phone': `+1-555-${String(i + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  'Contract Start': getRandomDate().toISOString().split('T')[0],
  'Payment Terms': `${Math.floor(Math.random() * 30) + 15} days`
}));

export const sampleProductData: SampleProfile[] = Array.from({length: 20}, (_, i) => ({
  'Product ID': `prod${i + 1}`,
  'Name': `Product ${String.fromCharCode(65 + i)}`,
  'Category': industries[i % industries.length],
  'Price': (Math.random() * 1000 + 100).toFixed(2),
  'SKU': `SKU-${String(i + 1).padStart(6, '0')}`,
  'Manufacturer': companyNames[i % companyNames.length],
  'In Stock': Math.random() > 0.2,
  'Weight': `${(Math.random() * 10 + 0.1).toFixed(2)} kg`,
  'Dimensions': `${Math.floor(Math.random() * 100)}x${Math.floor(Math.random() * 100)}x${Math.floor(Math.random() * 100)} cm`,
  'Launch Date': getRandomDate().toISOString().split('T')[0]
}));

export const sampleRelationshipData: SampleProfile[] = Array.from({length: 20}, (_, i) => ({
  'Relationship ID': `rel${i + 1}`,
  'Type': ['Manufactures', 'Supplies', 'Partners With', 'Acquired', 'Invests In'][i % 5],
  'From Entity': `org${Math.floor(Math.random() * 20) + 1}`,
  'To Entity': `org${Math.floor(Math.random() * 20) + 1}`,
  'Start Date': getRandomDate().toISOString().split('T')[0],
  'End Date': Math.random() > 0.7 ? getRandomDate().toISOString().split('T')[0] : null,
  'Status': ['Active', 'Inactive', 'Pending', 'Terminated'][i % 4],
  'Strength': (Math.random() * 100).toFixed(0),
  'Description': `Business relationship between organizations`,
  'Last Updated': getRandomDate().toISOString()
}));

export const sampleInteractionData: SampleProfile[] = Array.from({length: 20}, (_, i) => ({
  'Interaction ID': `int${i + 1}`,
  'Type': ['Purchase', 'Support', 'Inquiry', 'Complaint', 'Feedback'][i % 5],
  'Customer ID': `cust${Math.floor(Math.random() * 20) + 1}`,
  'Product ID': `prod${Math.floor(Math.random() * 20) + 1}`,
  'Amount': (Math.random() * 1000 + 50).toFixed(2),
  'Date': getRandomDate().toISOString(),
  'Channel': ['Web', 'Phone', 'Email', 'In-Store', 'Mobile'][i % 5],
  'Status': ['Completed', 'Pending', 'Failed', 'Refunded'][i % 4],
  'Notes': `Interaction notes for record ${i + 1}`,
  'Agent ID': `agent${Math.floor(Math.random() * 10) + 1}`
}));

export const sampleOtherData: SampleProfile[] = Array.from({length: 20}, (_, i) => ({
  'Data ID': `data${i + 1}`,
  'Type': ['Match', 'Merge', 'Activity Log', 'Workflow Task'][i % 4],
  'Created Date': getRandomDate().toISOString().split('T')[0],
  'Status': ['Processed', 'Pending', 'Failed', 'In Progress'][i % 4],
  'Source': ['System', 'Manual', 'API', 'Import'][i % 4],
  'Priority': ['High', 'Medium', 'Low'][i % 3],
  'Assigned To': `user${Math.floor(Math.random() * 10) + 1}`,
  'Completion Date': Math.random() > 0.3 ? getRandomDate().toISOString().split('T')[0] : null,
  'Description': `Data processing record ${i + 1}`,
  'Last Modified': getRandomDate().toISOString()
}));


export const targetOptions: TargetOption[] = [
  { id: 'fabric_sales', name: 'Fabric for sales forecasting' },
  { id: 'gcp_bq_analytics', name: 'Google BigQuery for Analytics' },
  { id: 'aws_s3_datalake', name: 'AWS S3 Data Lake Staging' },
];

// Mock Data for new combined Datasets list (AI Agent Flow)
export const mockDatasetListItems: DatasetListItem[] = [
  {
    id: '1',
    name: 'Organizational Data Sync to Microsoft Fabric',
    createdBy: 'Alex@example.com',
    dataShare: { display: 'Microsoft fabric (Active)', dotColor: 'green' },
    fileExport: { display: 'Not configured', dotColor: 'gray' },
  },
  {
    id: '2',
    name: 'User Activities - Sep - Aug 2024',
    createdBy: 'Mathew@example.com',
    dataShare: { display: 'Microsoft fabric (Active)', dotColor: 'green' },
    fileExport: { display: 'AWS S3 - bucket name (Active)', dotColor: 'green', actionIcons: ['refresh', 'link'] },
  },
  {
    id: '3',
    name: 'Customers latest July',
    createdBy: 'Pradeep@example.com',
    dataShare: { display: 'Not configured', dotColor: 'gray', actionIcon: 'play' },
    fileExport: { display: 'Direct download (In-progress)', dotColor: 'yellow', actionIcons: ['download', 'link'] },
  },
  {
    id: '4',
    name: 'Profiles for exporting to analytics',
    createdBy: 'Sara@example.com',
    dataShare: { display: 'Databricks (Active)', dotColor: 'green' },
    fileExport: { display: 'Not configured', dotColor: 'gray' },
  },
];

export const mockSearchResults: SearchResultItem[] = [
  { profile: "67b05843", name: "Phillip", lastName: "Harris", mobilePhone: "39929202", addressLine1: "PSC 6279", addressLine2: "Box 8617", street: "Maple St.", state: "FL", postalCode: "15591", country: "US" },
  { profile: "8b0a-48f7-1", name: "Terri", lastName: "Hall", mobilePhone: "234345345", addressLine1: "Unit 7236", addressLine2: "Suite 200", street: "Oak Ave.", state: "GA", postalCode: "23232", country: "US" },
  { profile: "2c82f5d8-1", name: "Lawrence", lastName: "Ayala", mobilePhone: "8287070073", addressLine1: "6077 Mathis Hill", addressLine2: "Apt. 312", street: "Elm Dr.", state: "MS", postalCode: "22121", country: "US" },
  { profile: "8b0a-48f7-2", name: "Jose", lastName: "Robinson", mobilePhone: "3399292", addressLine1: "Unit 7236 Box", addressLine2: "Hill Apt. 312", street: "Pine Ln.", state: "FL", postalCode: "23234", country: "US" },
  { profile: "72823b4ba103", name: "Breanna", lastName: "Hunter", country: "US" },
  { profile: "2c82f5d8-2", name: "Angela", state: "GA", street: "Spruce Blvd" },
  { profile: "5d1455dbb6d2", name: "Smith", lastName: "Clark", mobilePhone: "234234", addressLine1: "354 Sydney", street: "Spruce Blvd", state: "FL", postalCode: "23234", country: "US" },
  { profile: "a2db97219dd9-1", name: "Breanna", addressLine2: "Suite 10" },
  { profile: "2c82f5d8-3", name: "Wanda", lastName: "Silva" },
  { profile: "859587694ee2-1", name: "Johnny", mobilePhone: "3378383", addressLine1: "6756 Potter Greens", street: "Spruce Blvd", state: "FL", country: "US"},
  { profile: "909c511acf29-1", name: "Angela", lastName: "Hunter", street: "Pinewood Dr." },
  { profile: "8b0a-48f7-3", name: "Smith", state: "GA", postalCode: "32423", country: "US" },
  { profile: "a2db97219dd9-2", name: "Breanna", mobilePhone: "3434545", addressLine1: "32481 Moore", country: "US" },
  { profile: "5d1455dbb6d2-1", name: "Johnny", lastName: "Clark", mobilePhone: "567567657", addressLine1: "PSC 8470", street: "Pinewood Dr.", postalCode: "34343" },
  { profile: "8b0a-48f7-4", name: "Wanda", addressLine2: "Suite 10", country: "US" },
  { profile: "859587694ee2-2", name: "Johnny", state: "GA", postalCode: "64544" },
  { profile: "909c511acf29-2", name: "Breanna", lastName: "Hunter", mobilePhone: "34534545", addressLine1: "25980 Valencia", street: "Pinewood Dr." },
];
    