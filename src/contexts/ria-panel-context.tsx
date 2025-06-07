'use client';
import type { ChatMessage, DataSelectionSummaryDetails, DataShareConfiguration, SelectedDataType, ConfigurableDataCategory, EntityTypeConfig } from '@/lib/types';
import { initialDataTypes, initialEntityTypes, initialRelationshipTypes, initialInteractionTypes, initialOtherDataTypesConfig } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';

// Helper function to normalize text for matching
const normalizeInput = (text: string | undefined | null): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/^[*-\s]+/, '') // removes bullets or dashes at start
    .replace(/[.,!?;:'"()]+/g, '') // removes common punctuation, including parentheses
    .replace(/\s+/g, ' '); // normalize multiple spaces to single
};


interface ScriptTurn {
  userText: string | null; // User's message for this turn. Null if RIA speaks first.
  riaResponses: Array<Omit<ChatMessage, 'id' | 'timestamp' | 'sender'>>;
}

// Predefined conversation script
const scriptedConversation: ScriptTurn[] = [
  // Step 0: RIA initiates
  {
    userText: null, 
    riaResponses: [
      { text: "Hi there! I'm RIA.\n\n**I'm here to help you manage your data shares and exports.**\n\nWhether you want to create new ones, view details, or update existing datasets, just let me know how you'd like to proceed!", contentType: 'text' },
    ]
  },
  // Step 1: User initiates data share creation
  {
    userText: "Create a new data share",
    riaResponses: [
      { text: "**Absolutely!**\n\nI can guide you through creating a new data share.\n\nIf you prefer, you can switch to the manual data share experience at any time—just let me know.\n\n**First, could you tell me what primary types of data you're looking to share?**", contentType: 'text' }
    ],
  },
  // Step 2: User specifies entity types
  {
    userText: "I want to share data of organizations, products, and customers.",
    riaResponses: [
      { text: "Perfect. So we're looking at sharing:\n\n• **Organizations**\n• **Products**\n• **Customers**\n\nGot it.\n\nNow, for these entity types, would you like to apply any filters?\n\nFor example, with customers, you might want to focus on a specific region, or for products, perhaps a particular category.", contentType: 'text' },
    ],
  },
  // Step 3: User specifies filters
  {
    userText: "Yes, I want organizations in the \"Tech\" industry and located in \"California\". For products, I need those from the \"Electronics\" category, specifically launched after January 1st, 2023.",
    riaResponses: [
      { text: "Okay, I've noted those filters.\n\nSo, just to confirm:\n\n• For **Organizations**, we'll include those in the \"Tech\" industry AND located in \"California\".\n• For **Products**, we'll include those in the \"Electronics\" category AND launched after January 1st, 2023.\n• And for **Customers**, no specific filters at the moment.\n\nDoes that sound right, or would you like to adjust any of these filters?", contentType: 'text' },
    ],
  },
  // Step 4: User confirms filters
  {
    userText: "That looks correct.",
    riaResponses: [
      { text: "Excellent!\n\n**Next, would you like to enrich this dataset by including any related information?**\n\nWe could add things like:\n• Relationships between these entities\n• any Interactions data\n• Match Data, or\n• Merge Data\n\nYou can choose as many as you need.", contentType: 'text' },
    ],
  },
  // Step 5: User specifies related data (with AI suggestion)
  {
    userText: "Please include relationships and match data. I don't need interactions.",
    riaResponses: [
      { text: "Understood. We'll add **Relationships** and **Match Data** to your dataset, and we'll leave out Interactions for this share.", contentType: 'text' },
      { text: "Based on your data, I recommend including these key relationships to start with:", contentType: 'text' },
      {
        contentType: 'attributeTable',
        attributeTableDetails: {
          title: "Suggested Key Relationships",
          columns: ["Relationship Name", "Description", "Record Count"],
          rows: [
            ["Partners With", "Connections between organizations", "1,234"],
            ["Procures From", "Supplier relationships", "856"],
            ["Manufactures", "Product manufacturing relationships", "2,345"]
          ]
        }
      },
      { text: "Would you like to go with these, select all available relationships, or specify custom ones?", contentType: 'text' }
    ]
  },
  // Step 6: User chooses all relationships
  {
    userText: "Choose all relationships.",
    riaResponses: [
      { text: "Great! I'll include all available relationships in your data share.", contentType: 'text' },
      { text: "Now, let's talk about the specific details—the **attributes**—for each data type we've selected.\n\nFor each one, we can either include all available attributes or you can pick specific ones.\n\nHow would you like to proceed with that?", contentType: 'text' }
    ]
  },
  // Step 7: User wants to select specific attributes (combine attribute suggestion)
  {
    userText: "I want to select some attributes only.",
    riaResponses: [
      { text: "Sounds good!\n\nLet's start with **Organizations**. Here are some common attributes:", contentType: 'text' },
      {
        contentType: 'attributeTable',
        attributeTableDetails: {
          title: "Recommended Organization Attributes",
          columns: ["Attribute Name", "Description", ""],
          rows: [
            ["Name", "Legal business name", ""],
            ["Address", "Physical address", ""],
            ["Industry", "Primary business sector", ""],
            ["Contact Email", "Primary contact email", ""],
            ["Number of Employees", "Total employee count", ""]
          ]
        }
      },
      { text: "Would you like me to list more, or can you tell me which of these (or others) you'd like to include?", contentType: 'text' }
    ],
  },
  // Step 8: User requests full list of attributes (skip 'List attributes for Organizations')
  {
    userText: "Show full list of attributes",
    riaResponses: [
      { text: "Here's the complete list of available attributes for Organizations:", contentType: 'text' },
      {
        contentType: 'attributeTable',
        attributeTableDetails: {
          title: "Recommended Organization Attributes",
          columns: ["Attribute Name", "Description"],
          rows: Array.from({ length: 200 }, (_, i) => {
            const attrNum = i + 1;
            let name, desc;
            // Generate meaningful attribute names and descriptions for first 20
            if (attrNum <= 20) {
              const commonAttrs = [
                { name: "Name", desc: "Legal business name" },
                { name: "Industry", desc: "Primary business sector" },
                { name: "Location", desc: "Physical address" },
                { name: "Contact Email", desc: "Primary contact email" },
                { name: "Number of Employees", desc: "Total employee count" },
                { name: "Creation Date", desc: "Business registration date" },
                { name: "Website", desc: "Company website URL" },
                { name: "Revenue", desc: "Annual revenue" },
                { name: "Phone Number", desc: "Primary contact phone" },
                { name: "Tax ID", desc: "Business tax identifier" },
                { name: "Business Type", desc: "Legal entity type" },
                { name: "Founded Year", desc: "Year of establishment" },
                { name: "HQ Country", desc: "Headquarters country" },
                { name: "HQ State", desc: "Headquarters state/province" },
                { name: "HQ City", desc: "Headquarters city" },
                { name: "Postal Code", desc: "Business postal code" },
                { name: "Social Media", desc: "Social media handles" },
                { name: "Market Cap", desc: "Market capitalization" },
                { name: "Stock Symbol", desc: "Trading symbol" },
                { name: "Parent Company", desc: "Owning organization" }
              ];
              ({ name, desc } = commonAttrs[attrNum - 1]);
            } else {
              // Generate synthetic attributes for the rest
              const prefixes = ["Org", "Business", "Company", "Enterprise", "Corporate"];
              const suffixes = ["ID", "Code", "Key", "Value", "Status", "Type", "Category", "Group", "Level", "Class"];
              name = `${prefixes[attrNum % prefixes.length]} ${suffixes[attrNum % suffixes.length]} ${Math.floor(attrNum / 10)}`;
              desc = `Attribute ${attrNum} for organization data`;
            }
            return [name, desc, ""];
          })
        }
      },
      { text: "I've displayed all 200 available attributes for Organizations. Please review them and let me know which ones you'd like to include in your data share.", contentType: 'text', useTimeout: true, delay: 1000 }
    ]
  },
  // Previous Step 9 becomes Step 10: User specifies attributes for Organizations
  {
    userText: "For Organizations, please include Name, Industry, and Location. Include all attributes for other data types.",
    riaResponses: [
      { text: "**Got it.**\n\n• For **Organizations**: **Name**, **Industry**, and **Location**.\n• Selecting **all attributes** for **Products**, **Customers**, **Relationships**, and **Match data**.\n\nAll attribute selections are now set.\n\nLet me give you a summary of the entire data share configuration so far.", contentType: 'text' },
      {
        contentType: 'dataSelectionSummary',
        dataSelectionSummaryDetails: {
          entityTypes: {
            title: "Selected Entity Types & Attributes:",
            items: [
              { name: "Organizations", attributeSummary: `(3/12 attributes)`, selectedAttributes: ["Name", "Industry", "Location"] },
              { name: "Products", attributeSummary: `(15/15 attributes)`, selectedAttributes: Array.from({ length: 15 }, (_, i) => `Product Attribute ${i+1}`) },
              { name: "Customers", attributeSummary: `(10/10 attributes)`, selectedAttributes: Array.from({ length: 10 }, (_, i) => `Customer Attribute ${i+1}`) }
            ]
          },
          filtersApplied: {
            title: "Filters Applied:",
            items: [
              { entityName: "Organizations", filterDescription: 'Industry is "Tech" AND Location is "California".' },
              { entityName: "Products", filterDescription: 'Category is "Electronics" AND Launch Date is after "January 1st, 2023".' },
              { entityName: "Customers", filterDescription: 'No filters applied.' }
            ]
          },
          relatedData: {
            title: "Included Related Data & Attributes:",
            items: [
              { name: "Relationships", attributeSummary: `(5/5 attributes)`, selectedAttributes: Array.from({ length: 5 }, (_, i) => `Relationship Attribute ${i+1}`) },
              { name: "Match Data", attributeSummary: `(8/8 attributes)`, selectedAttributes: Array.from({ length: 8 }, (_, i) => `Match Data Attribute ${i+1}`) }
            ]
          }
        }
      },
      { text: "I've prepared a preview for you to review.\n\nYou should be able to see a sample of the selected data displayed on the left side of your screen now. Please take a moment to review it.\n\n**Does everything look correct before we move on?**", contentType: 'text', useTimeout: true, delay: 700 },
    ],
  },
  // Step 11: User confirms data share summary and preview
  {
    userText: "Yes, the summary and preview look correct",
    riaResponses: [
      { text: "**Great!**\n\nNow, could you tell me about the **destination** for this data share?\n\nFor example:\n• Data for sales forecasting (using Microsoft Fabric)\n• Data for churn prediction (with Databricks)\n• LTV Calculation (using Microsoft Fabric)\n\nOr another target you have in mind?", contentType: 'text' },
    ],
  },
  
  // Step 14: User specifies destination, RIA auto-generates Name/Description & presents summary
  {
    userText: "Data for churn prediction.",
    riaResponses: [
      { text: "Understood, \"Data for churn prediction (with Databricks)\" it is.", contentType: 'text' },
      {
        contentType: 'summaryCard',
        summaryDetails: {
          title: "Data Share Setup:",
          items: [
            { label: "Name", value: "Customer Churn Prediction Dataset" },
            { label: "Description", value: "Comprehensive dataset including organizations, products, and customers, with relevant filters and related data, for churn prediction modeling." },
            { label: "Data Share Target", value: "Data for churn prediction (Databricks)" }
          ]
        },
        useTimeout: true, 
        delay: 700
      },
      { text: "I've generated a name and description.\n\n**Does this final setup look okay to you?**", contentType: 'text', useTimeout: true, delay: 700 },
    ],
  },
  // Step 15: User confirms auto-generated final setup
  {
    userText: "Looks okay.",
    riaResponses: [
      { text: "**Thank you!** I have all the details needed.\n\nI'm now initiating the data share named **Customer Churn Prediction Dataset** to your Databricks environment.", contentType: 'text' },
      { text: "Just a moment while I set that up for you... ⏳", useTimeout: true, delay: 1500 },
      { text: "**Great news!** The data share **Customer Churn Prediction Dataset** is now active and will continuously share data to Databricks.\n\nYou can always ask me to manage it or check its status.", useTimeout: true, delay: 2500 },
      { text: "Here you can see the **data share list**.\n\nLet me know what you would like to do: make any changes, view details, or create a new one.", contentType: 'text' },
    ],
  },
];


interface RiaPanelContextType {
  isRiaPanelOpen: boolean;
  setIsRiaPanelOpen: (isOpen: boolean) => void;
  toggleRiaPanel: () => void;
  messages: ChatMessage[];
  advanceConversation: () => void;
  conversationStep: number;
  isConversationOver: boolean;
  dataShareConfig: DataShareConfiguration;
  setDataShareConfig: (config: DataShareConfiguration | ((prev: DataShareConfiguration) => DataShareConfiguration)) => void;
  onRiaNavigate: (targetPath: string) => void;
}

const RiaPanelContext = createContext<RiaPanelContextType | undefined>(undefined);

export const useRiaPanel = () => {
  const context = useContext(RiaPanelContext);
  if (!context) {
    throw new Error('useRiaPanel must be used within a RiaPanelProvider');
  }
  return context;
};

export const RiaPanelProvider = ({ children, onRiaNavigate }: { children: ReactNode, onRiaNavigate: (targetPath: string) => void }) => {
  const [isRiaPanelOpen, setIsRiaPanelOpenState] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationStep, setConversationStep] = useState(0);
  const [dataShareConfig, setDataShareConfig] = useState<DataShareConfiguration>(
    {
      selectedDataTypes: JSON.parse(JSON.stringify(initialDataTypes)),
      entityTypes: JSON.parse(JSON.stringify(initialEntityTypes)),
      relationshipTypes: JSON.parse(JSON.stringify(initialRelationshipTypes)),
      interactionTypes: JSON.parse(JSON.stringify(initialInteractionTypes)),
      otherDataTypes: JSON.parse(JSON.stringify(initialOtherDataTypesConfig)),
      datasetName: '',
      description: '',
      target: '',
    }
  );
  
  const isConversationOver = conversationStep >= scriptedConversation.length;

  const addMessage = useCallback((messageContent: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...messageContent,
      id: Math.random().toString(36).substring(7) + Date.now(),
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);
  
  // Effect to send RIA's first message(s) when the panel opens and conversation is at step 0
  useEffect(() => {
    if (isRiaPanelOpen && conversationStep === 0 && messages.length === 0) {
        const firstTurn = scriptedConversation[0];
        if (firstTurn && firstTurn.userText === null) { // RIA speaks first
            let cumulativeDelay = 0;
            firstTurn.riaResponses.forEach((responseContent, index) => {
                const isCard = responseContent.contentType === 'dataSelectionSummary' || responseContent.contentType === 'summaryCard';
                const baseDelay = isCard ? 700 : (responseContent.text && responseContent.text.length > 100 ? 1200 : 700);
                const responseDelay = (responseContent as any).useTimeout ? ((responseContent as any).delay || baseDelay) : baseDelay;
                
                if (index > 0) {
                    cumulativeDelay += responseDelay;
                } else {
                    // For the very first message, if it has a specific delay, use it. Otherwise, default to a smaller or no initial delay.
                    cumulativeDelay += (responseContent as any).useTimeout && (responseContent as any).delay > 0 ? (responseContent as any).delay : 200;
                }
                
                setTimeout(() => {
                    addMessage({ sender: 'ria', ...responseContent });
                }, cumulativeDelay);
            });
            setConversationStep(prev => prev + 1); // Advance step as RIA's first turn is done
        }
    }
  // Only run when isRiaPanelOpen changes, or if step is 0 and messages are empty (initial open)
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [isRiaPanelOpen, addMessage]); // Removed conversationStep and messages.length to avoid re-triggering on every message

  // Add navigation handler
  const handlePreviewNavigation = useCallback(() => {
    // Signal navigation to the embedding page
    onRiaNavigate('/ai-agent-flow?openWizard=true&step=reviewDataset'); // Use logical path/params
  }, [onRiaNavigate]); // Depend on onRiaNavigate

  // Modify the advanceConversation function to handle preview navigation and update config
  const advanceConversation = useCallback(() => {
    if (isConversationOver) return;

    const currentTurn = scriptedConversation[conversationStep];
    if (!currentTurn) return;

    // Add user message if there's user text
    if (currentTurn.userText) {
      addMessage({ sender: 'user', text: currentTurn.userText, contentType: 'text' });

      // Trigger navigation to preview page immediately after user's preview request (Step 10)
      // This check is now handled immediately after adding the user's message above.
      // if (conversationStep === 9 && /preview/i.test(currentTurn.userText)) { 
      //   handlePreviewNavigation();
      // }
    }

    // Add RIA's responses with delays
    let cumulativeDelay = 0;
    currentTurn.riaResponses.forEach((responseContent, index) => {
      const isCard = responseContent.contentType === 'dataSelectionSummary' || responseContent.contentType === 'summaryCard';
      const baseDelay = isCard ? 700 : (responseContent.text && responseContent.text.length > 100 ? 1200 : 700);
      const responseDelay = (responseContent as any).useTimeout ? ((responseContent as any).delay || baseDelay) : baseDelay;

      setTimeout(() => {
        addMessage({ sender: 'ria', ...responseContent });

        // Trigger navigation when the specific preview message is displayed by RIA
        if (responseContent.text && responseContent.text.includes("I've prepared a preview")) {
          handlePreviewNavigation();
        }

        // Trigger navigation when the specific listing page message is displayed by RIA
        if (
          responseContent.text &&
          responseContent.text.toLowerCase().includes("data share list")
        ) {
          onRiaNavigate('/ai-agent-flow'); // Signal logical path for listing page
          // Do NOT reset conversation step here
        }
      }, cumulativeDelay);
      
      cumulativeDelay += responseDelay;
    });

    // Update the dataShareConfig based on the conversation step/turn
    switch (conversationStep) {
      case 2: // After user specifies entity types (Organizations, Products, Customers)
        setDataShareConfig((prev: DataShareConfiguration) => ({
          ...prev,
          selectedDataTypes: prev.selectedDataTypes.map((dt: SelectedDataType) => ({
              ...dt,
              // Mark high-level 'Entities', 'Relationships', 'Interactions', 'Match data' as selected
              // based on the entities/related data mentioned in the conversation flow.
              // Simplified mapping based on names from the script.
              selected: dt.name === 'Entities' || dt.name === 'Relationships' || dt.name === 'Interactions' || dt.name === 'Match data',
           })).filter((dt: SelectedDataType | null | undefined): dt is SelectedDataType => dt != null && dt.id !== undefined && dt.id !== ''),
          entityTypes: initialEntityTypes.map((et: EntityTypeConfig) => ({
             ...et,
             // Mark Organizations, Products, Customers as selected from the initial list
             selected: et.name === 'Organizations' || et.name === 'Products' || et.name === 'Customers',
             // Keep existing attributes/counts or re-initialize if needed
             attributes: et.attributes || [],
             selectedAttributesCount: et.selectedAttributesCount || 0,
          })).filter((et: EntityTypeConfig | null | undefined): et is EntityTypeConfig => et != null && et.id !== undefined && et.id !== ''),
           relationshipTypes: initialRelationshipTypes.map((rt: ConfigurableDataCategory) => ({
              ...rt,
              selected: false, // Assuming relationships are not selected until step 5
              attributes: rt.attributes || [],
              selectedAttributesCount: rt.selectedAttributesCount || 0,
           })).filter((rt: ConfigurableDataCategory | null | undefined): rt is ConfigurableDataCategory => rt != null && rt.id !== undefined && rt.id !== ''),
           interactionTypes: initialInteractionTypes.map((it: ConfigurableDataCategory) => ({
              ...it,
              selected: false, // Assuming interactions are not selected until step 5
              attributes: it.attributes || [],
              selectedAttributesCount: it.selectedAttributesCount || 0,
           })).filter((it: ConfigurableDataCategory | null | undefined): it is ConfigurableDataCategory => it != null && it.id !== undefined && it.id !== ''),
           otherDataTypes: initialOtherDataTypesConfig.map((odt: ConfigurableDataCategory) => ({
              ...odt,
              selected: false, // Assuming other data types are not selected until step 5 (for Match Data)
              attributes: odt.attributes || [],
              selectedAttributesCount: odt.selectedAttributesCount || 0,
           })).filter((odt: ConfigurableDataCategory | null | undefined): odt is ConfigurableDataCategory => odt != null && odt.id !== undefined && odt.id !== ''),
             selectedFilters: [], // Reset or initialize filters here if needed at this step
        }));
        break;
      case 3: // After user specifies filters
        setDataShareConfig((prev: DataShareConfiguration) => ({
          ...prev,
          // Update filter descriptions for the relevant entity types in the entityTypes array
          // Note: filterDescription is part of DataSelectionSummaryDetails, not DataShareConfiguration state
          // The summary card generation uses the separate selectedFilters array.
          // entityTypes: prev.entityTypes.map(et => { /* Filter updates should modify backend state */ }),\
          // Update the separate selectedFilters array for summary display
          selectedFilters: [
            { entityName: "Organizations", filterDescription: 'Industry is "Tech" AND Location is "California".' },
            { entityName: "Products", filterDescription: 'Category is "Electronics" AND Launch Date is after "January 1st, 2023".' },
            { entityName: "Customers", filterDescription: 'No filters applied.' },
          ],
          // selectedDataTypes, relationshipTypes, interactionTypes, otherDataTypes are not changed in this step
        }));
        break;
      case 5: // After user specifies related data (Relationships and Match Data)
         setDataShareConfig((prev: DataShareConfiguration) => ({
           ...prev,
           selectedDataTypes: prev.selectedDataTypes.map((dt: SelectedDataType) => ({
               ...dt,
               // Mark Relationships and Match data as selected in the high-level list
               selected: dt.name === 'Entities' || dt.name === 'Relationships' || dt.name === 'Interactions' || dt.name === 'Match data',
            })).filter((dt: SelectedDataType | null | undefined): dt is SelectedDataType => dt != null && dt.id !== undefined && dt.id !== ''),
           // Update the detailed types: mark Relationships and Match Data as selected
           relationshipTypes: prev.relationshipTypes.map((rt: ConfigurableDataCategory) => ({
             ...rt,
             selected: rt.name === 'Relationships', // Assuming 'Relationships' is the correct name/id
           })).filter((rt: ConfigurableDataCategory | null | undefined): rt is ConfigurableDataCategory => rt != null && rt.id !== undefined && rt.id !== ''),
            otherDataTypes: prev.otherDataTypes.map((odt: ConfigurableDataCategory) => ({
              ...odt,
              selected: odt.name === 'Match data', // Assuming 'Match data' is the correct name/id
           })).filter((odt: ConfigurableDataCategory | null | undefined): odt is ConfigurableDataCategory => odt != null && odt.id !== undefined && odt.id !== ''),
            // entityTypes, interactionTypes, selectedFilters are not changed in this step
         }));
        break;
      case 8: // After user specifies attributes
         setDataShareConfig((prev: DataShareConfiguration) => ({
           ...prev,
           entityTypes: prev.entityTypes.map((et: EntityTypeConfig) => {
             if (et.name === 'Organizations') {
               // Update attributes for Organizations based on user text (Name, Industry, Location)
               const updatedAttributes = et.attributes.map(attr => ({
                 ...attr,
                 selected: attr.name === 'Name' || attr.name === 'Industry' || attr.name === 'Location'
               }));
               const selectedCount = updatedAttributes.filter(attr => attr.selected).length;
               return { ...et, 
                  attributes: updatedAttributes,
                  selectedAttributesCount: selectedCount
                };
             } else if (et.selected) { // For other selected entity types (Products, Customers)
                // Select all attributes for other selected entity types
                const updatedAttributes = et.attributes.map(attr => ({ ...attr, selected: true }));
                return { ...et, 
                  attributes: updatedAttributes,
                  selectedAttributesCount: updatedAttributes.length
                };
             }
             return et;
           }).filter((et: EntityTypeConfig | null | undefined): et is EntityTypeConfig => et != null && et.id !== undefined && et.id !== ''),
           relationshipTypes: prev.relationshipTypes.map((rt: ConfigurableDataCategory) => {
              if (rt.selected) { // For selected relationship types (Relationships)
                 // Select all attributes for selected relationship types
                 const updatedAttributes = rt.attributes.map(attr => ({ ...attr, selected: true }));
                 return { ...rt, 
                   attributes: updatedAttributes,
                   selectedAttributesCount: updatedAttributes.length
                  };
              }
              return rt;
           }).filter((rt: ConfigurableDataCategory | null | undefined): rt is ConfigurableDataCategory => rt != null && rt.id !== undefined && rt.id !== ''),
            otherDataTypes: prev.otherDataTypes.map((odt: ConfigurableDataCategory) => {
              if (odt.selected) { // For selected other data types (Match Data)
                 // Select all attributes for selected other data types
                 const updatedAttributes = odt.attributes.map(attr => ({ ...attr, selected: true }));
                 return { ...odt, 
                    attributes: updatedAttributes,
                    selectedAttributesCount: updatedAttributes.length
                   };
              }
              return odt;
            }).filter((odt: ConfigurableDataCategory | null | undefined): odt is ConfigurableDataCategory => odt != null && odt.id !== undefined && odt.id !== ''),
            // selectedDataTypes and selectedFilters are not changed in this step
         }));
        break;
      default:
        // No config update for other steps
        break;
    }

    setConversationStep(prev => prev + 1);

    // Trigger navigation to preview page after the user's preview request (Step 10)
    // This check is now handled immediately after adding the user's message above.
    // if (conversationStep === 9) { // Step 10 in script is index 9
    //   handlePreviewNavigation();
    // }

  }, [conversationStep, isConversationOver, addMessage, handlePreviewNavigation, setDataShareConfig, onRiaNavigate]); // Add onRiaNavigate to deps, remove router

  // This effect is likely not needed anymore with the refined switch logic
  /*
  useEffect(() => {
     setDataShareConfig(prev => ({
       ...prev,
       entityTypes: prev.entityTypes.map(et => ({
          ...et,
          attributes: et.attributes || [],
          selectedAttributesCount: et.selectedAttributesCount || 0,
          filterDescription: et.filterDescription || '', // Ensure filterDescription exists
       })),
        relationshipTypes: prev.relationshipTypes.map(rt => ({
          ...rt,
          attributes: rt.attributes || [],
          selectedAttributesCount: rt.selectedAttributesCount || 0,
          filterDescription: rt.filterDescription || '', // Ensure filterDescription exists
       })),
        interactionTypes: prev.interactionTypes.map(it => ({
          ...it,
          attributes: it.attributes || [],
          selectedAttributesCount: it.selectedAttributesCount || 0,
          filterDescription: it.filterDescription || '', // Ensure filterDescription exists
       })),
        otherDataTypes: prev.otherDataTypes.map(odt => ({
          ...odt,
          attributes: odt.attributes || [],
          selectedAttributesCount: odt.selectedAttributesCount || 0,
          filterDescription: odt.filterDescription || '', // Ensure filterDescription exists
       })),
        // selectedDataTypes and selectedFilters are not modified here
     }));
  }, [setDataShareConfig]);
  */

  const setIsRiaPanelOpen = (isOpen: boolean) => {
    setIsRiaPanelOpenState(isOpen);
    // Logic for RIA's first message is now handled by the useEffect above
  };

  const toggleRiaPanel = () => {
    setIsRiaPanelOpen(!isRiaPanelOpen);
  };

  return (
    <RiaPanelContext.Provider value={{ 
      isRiaPanelOpen, 
      setIsRiaPanelOpen, 
      toggleRiaPanel, 
      messages, 
      advanceConversation,
      conversationStep,
      isConversationOver,
      dataShareConfig,
      setDataShareConfig,
      onRiaNavigate
    }}>
      {children}
    </RiaPanelContext.Provider>
  );
};

