export interface ExportJobFile {
  name: string;
  size: string;
  downloadUrl: string; // Mock URL for download
}

export interface DataSetSummary {
  totalProfiles: string;
  totalRelationships: string;
  totalInteractions: string;
  totalOtherDataTypes: string;
}

export interface ConfigurableDataItem {
  name: string;
  count: number;
  selectedAttributesCount: number;
  selectedAttributesVisible?: boolean; // For UI state in the dataset tab
  sampleData?: { [key: string]: any }[]; // Sample data for dataset tab
  attributes?: { id: string; name: string; category: string; selected: boolean }[]; // Updated attributes to match SelectedAttribute type more closely
}

export interface ExportJobDetails {
  id: string;
  jobName: string;
  createdBy: string;
  createdOn: string;
  lastRun: string;
  nextScheduledRun?: string;
  totalFileSize?: string; // Optional for Files tab summary
  files: ExportJobFile[];
  dataSetSummary: DataSetSummary;
  entityTypes: ConfigurableDataItem[];
  relationshipTypes: ConfigurableDataItem[];
  interactionTypes: ConfigurableDataItem[];
  otherDataTypes: ConfigurableDataItem[];
  configurations: {
    label: string;
    value: string | boolean | string[];
    type: 'text' | 'boolean' | 'list'; // Helps rendering
  }[];
}

// Mock data for a single export job
export const mockExportJob: ExportJobDetails = {
  id: 'customers-us-sep-2024',
  jobName: 'Customers_US - Sep 2024',
  createdBy: 'Alex@example.com',
  createdOn: '09/03/2024, 10:47 AM',
  lastRun: '04 Sep 2024, 12:34 PM',
  nextScheduledRun: '12:23 PM, 23 Sep 2024',
  totalFileSize: '288KB', // Example total size
  files: [
    { name: 'Customers Profiles Part 1.zip', size: '211 KB', downloadUrl: '#download1' },
    { name: 'Customers Profiles Part 2.zip', size: '211 KB', downloadUrl: '#download2' },
    // Add more mock files as needed
  ],
  dataSetSummary: {
    totalProfiles: '1,304',
    totalRelationships: '123',
    totalInteractions: '5000',
    totalOtherDataTypes: '550', // Updated total count (300 + 250)
  },
  entityTypes: [
    { name: 'Organizations', count: 506, selectedAttributesCount: 12, sampleData: [{ 'Entity ID': 'Org1', 'Name': 'Acme Corp', 'Location': 'New York' }, { 'Entity ID': 'Org2', 'Name': 'Globex Inc.', 'Location': 'London' }],
      attributes: [
        { id: 'org_id', name: 'Organization ID', category: 'general', selected: true },
        { id: 'org_name', name: 'Organization Name', category: 'general', selected: true },
        { id: 'org_address', name: 'Address', category: 'general', selected: true },
        { id: 'org_type', name: 'Type', category: 'general', selected: false },
        { id: 'org_employees', name: 'Number of Employees', category: 'general', selected: true },
        { id: 'org_industry', name: 'Industry', category: 'general', selected: true },
        { id: 'org_website', name: 'Website', category: 'general', selected: false },
        { id: 'org_phone', name: 'Phone', category: 'general', selected: true },
        { id: 'org_email', name: 'Email', category: 'general', selected: true },
        { id: 'org_foundingDate', name: 'Founding Date', category: 'general', selected: true },
        { id: 'org_status', name: 'Status', category: 'general', selected: true },
        { id: 'org_description', name: 'Description', category: 'general', selected: true },
        { id: 'org_timezone', name: 'Timezone', category: 'general', selected: false },
        { id: 'org_parent', name: 'Parent Company', category: 'general', selected: true },
      ]
    },
    { name: 'Products', count: 342, selectedAttributesCount: 8, sampleData: [{ 'Product ID': 'P1', 'Name': 'Laptop', 'Price': 1200 }, { 'Product ID': 'P2', 'Name': 'Keyboard', 'Price': 75 }],
      attributes: [
        { id: 'product_id', name: 'Product ID', category: 'general', selected: true },
        { id: 'product_name', name: 'Product Name', category: 'general', selected: true },
        { id: 'product_description', name: 'Description', category: 'general', selected: true },
        { id: 'product_price', name: 'Price', category: 'general', selected: true },
        { id: 'product_category', name: 'Category', category: 'general', selected: true },
        { id: 'product_weight', name: 'Weight', category: 'general', selected: true },
        { id: 'product_dimensions', name: 'Dimensions', category: 'general', selected: true },
        { id: 'product_manufacturer', name: 'Manufacturer', category: 'general', selected: true },
        { id: 'product_releaseDate', name: 'Release Date', category: 'general', selected: false },
      ]
    },
    { name: 'Suppliers', count: 456, selectedAttributesCount: 5, sampleData: [{ 'Supplier ID': 'S1', 'Name': 'Supplier A', 'City': 'Los Angeles' }, { 'Supplier ID': 'S2', 'Name': 'Supplier B', 'City': 'Chicago' }],
      attributes: [
        { id: 'supplier_id', name: 'Supplier ID', category: 'general', selected: true },
        { id: 'supplier_name', name: 'Supplier Name', category: 'general', selected: true },
        { id: 'supplier_contact', name: 'Contact Person', category: 'general', selected: false },
        { id: 'supplier_phone', name: 'Phone', category: 'general', selected: true },
        { id: 'supplier_email', name: 'Email', category: 'general', selected: true },
        { id: 'supplier_address', name: 'Address', category: 'general', selected: false },
      ]
    },
    { name: 'Customers', count: 234, selectedAttributesCount: 7, sampleData: [{ 'Customer ID': 'C1', 'Name': 'Alice Smith', 'Email': 'alice@example.com' }, { 'Customer ID': 'C2', 'Name': 'Bob Johnson', 'Email': 'bob@example.com' }],
      attributes: [
        { id: 'customer_id', name: 'Customer ID', category: 'general', selected: true },
        { id: 'customer_name', name: 'Customer Name', category: 'general', selected: true },
        { id: 'customer_email', name: 'Email Address', category: 'general', selected: true },
        { id: 'customer_phone', name: 'Mobile Phone', category: 'general', selected: true },
        { id: 'customer_address', name: 'Address line 1', category: 'general', selected: true },
        { id: 'customer_city', name: 'City', category: 'general', selected: false },
        { id: 'customer_state', name: 'State', category: 'general', selected: false },
        { id: 'customer_zip', name: 'Zip Code', category: 'general', selected: false },
        { id: 'customer_country', name: 'Country', category: 'general', selected: true },
        { id: 'customer_signupDate', name: 'Signup Date', category: 'general', selected: true },
      ]
    },
  ],
  relationshipTypes: [
     { name: 'Manufactures', count: 123, selectedAttributesCount: 3, sampleData: [{ 'Relationship ID': 'R1', 'From': 'Org1', 'To': 'P1' }, { 'Relationship ID': 'R2', 'From': 'S1', 'To': 'P2' }],
       attributes: [
         { id: 'rel_id', name: 'Relationship ID', category: 'general', selected: true },
         { id: 'rel_name', name: 'Relationship Name', category: 'general', selected: true },
         { id: 'rel_startDate', name: 'Start Date', category: 'general', selected: true },
         { id: 'rel_endDate', name: 'End Date', category: 'general', selected: false },
         { id: 'rel_type', name: 'Type', category: 'general', selected: false },
       ]
     },
  ],
  interactionTypes: [
     { name: 'Purchase', count: 5000, selectedAttributesCount: 4, sampleData: [{ 'Interaction ID': 'I1', 'Customer': 'C1', 'Product': 'P1', 'Amount': 1200 }, { 'Interaction ID': 'I2', 'Customer': 'C2', 'Product': 'P2', 'Amount': 75 }],
       attributes: [
         { id: 'int_id', name: 'Interaction ID', category: 'general', selected: true },
         { id: 'int_date', name: 'Date', category: 'general', selected: true },
         { id: 'int_amount', name: 'Amount', category: 'general', selected: true },
         { id: 'int_product', name: 'Product ID', category: 'general', selected: false },
         { id: 'int_customer', name: 'Customer ID', category: 'general', selected: false },
         { id: 'int_type', name: 'Type', category: 'general', selected: true },
       ]
     },
  ],
  otherDataTypes: [
      { name: 'Merge data', count: 300, selectedAttributesCount: 2, sampleData: [{ 'Merge ID': 'M1', 'Date': '2024-01-01' }, { 'Merge ID': 'M2', 'Date': '2024-02-15' }],
        attributes: [
          { id: 'merge_id', name: 'Merge ID', category: 'general', selected: true },
          { id: 'merge_date', name: 'Date', category: 'general', selected: true },
          { id: 'merge_count', name: 'Merged Records Count', category: 'general', selected: false },
        ]
      },
      { name: 'Match data', count: 250, selectedAttributesCount: 3, sampleData: [{ 'Match ID': 'Ma1', 'Score': 0.95 }, { 'Match ID': 'Ma2', 'Score': 0.88 }],
        attributes: [
          { id: 'match_id', name: 'Match ID', category: 'general', selected: true },
          { id: 'match_score', name: 'Score', category: 'general', selected: true },
          { id: 'match_date', name: 'Match Date', category: 'general', selected: true },
          { id: 'match_type', name: 'Type', category: 'general', selected: false },
        ]
      },
  ],
  configurations: [
    { label: 'Export destination', value: 'Direct download', type: 'text' },
    { label: 'Job schedule', value: 'Repeat every Monday at 12:30 PM, starting from 12 Jun 2024, ending on 24 Jan 2026', type: 'text' },
    { label: 'File format', value: 'CSV exploded', type: 'text' },
    { label: 'SlicedByCrosswalks', value: true, type: 'boolean' }, // Checkbox in screenshot
    { label: 'SliceFilter Parameters', value: ':notEqual(sourceSystems, \'ReltioCleanser\')', type: 'text' },
    { label: 'Group by parameters', value: 'N/A', type: 'text' },
    { label: 'Anchor attribute parameters', value: 'Email ID', type: 'text' },
    { label: 'Headers style', value: 'Name', type: 'text' }, // Radio in screenshot
    { label: 'Header format', value: 'Default', type: 'text' }, // Radio in screenshot
    { label: 'Date Format', value: 'Time Stamp', type: 'text' }, // Radio in screenshot
    { label: 'Export Operational Values (OV) only', value: true, type: 'boolean' }, // Checkbox
    { label: 'Search by OV', value: true, type: 'boolean' }, // Checkbox - appears in screenshot configurations
    { label: 'Send hidden attributes', value: true, type: 'boolean' }, // Checkbox
    { label: 'Produce a single output flat', value: true, type: 'boolean' }, // Checkbox
  ],
}; 