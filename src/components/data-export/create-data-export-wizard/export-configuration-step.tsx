import React, { useState, useMemo } from 'react';
import { ExportConfiguration, CloudDestinationSetting, mockCloudSettings } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Cloud, Download, ChevronUp, ChevronDown, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// Import Checkbox for weekly day selection
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExportConfigurationStepProps {
  config: ExportConfiguration;
  onConfigChange: (updates: Partial<ExportConfiguration>) => void;
}

const ExportConfigurationStep: React.FC<ExportConfigurationStepProps> = ({ config, onConfigChange }) => {
  // Use state to manage visibility of custom date range pickers
  const [showCustomDateRange, setShowCustomDateRange] = useState(config.dataWithChanges === 'custom');
  // Use state to manage visibility of cloud config fields
  const [showCloudConfig, setShowCloudConfig] = useState(config.destination !== 'Direct download' && !!config.destination);
  // Use state to manage visibility of 'create new cloud config' fields
  const [isCreatingNewCloudConfig, setIsCreatingNewCloudConfig] = useState(config.cloudConfigId === 'new');

  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);

  const handleChange = (field: keyof ExportConfiguration, value: any) => {
    onConfigChange({ [field]: value });
  };

  const handleDateChange = (field: 'startDate' | 'endDate' | 'scheduleDate', selectedDate: Date | undefined) => {
    if (selectedDate) {
      handleChange(field, selectedDate.toISOString());
    } else {
      handleChange(field, undefined);
    }
  };

  const handleDestinationChange = (value: string) => {
    handleChange('destination', value);
    setShowCloudConfig(value !== 'Direct download');
    // Reset cloud config related fields when destination changes
    handleChange('cloudConfigId', undefined);
    setIsCreatingNewCloudConfig(false);
    handleChange('bucketName', undefined);
    handleChange('path', undefined);
    handleChange('region', undefined);
  };

  const handleCloudConfigSelect = (value: string) => {
      handleChange('cloudConfigId', value);
      setIsCreatingNewCloudConfig(value === 'new');
      // If a preconfigured setting is selected, populate relevant fields (though credentials would be backend-managed)
      const selectedSetting = mockCloudSettings.find(setting => setting.id === value);
      if (selectedSetting) {
          // Only update if creating a new config, otherwise rely on stored config
          // For preconfigured, these fields are read-only or inferred
           if (value !== 'new') {
             // In a real app, you might fetch/use the actual config details here
             // For this demo, we'll just show the name in the select and assume backend uses ID
           }
      } else if (value === 'new') {
          // Clear fields when creating new
          handleChange('bucketName', undefined);
          handleChange('path', undefined);
          handleChange('region', undefined);
      }
  };


  const handleDataWithChangesChange = (value: string) => {
    handleChange('dataWithChanges', value);
    setShowCustomDateRange(value === 'custom');
    // Clear custom dates if not using custom range
    if (value !== 'custom') {
        handleChange('startDate', undefined);
        handleChange('endDate', undefined);
    }
  };

   const handleWhenToExportChange = (value: string) => {
    handleChange('whenToExport', value);
    // Reset schedule details if switching from schedule to now
    if (value === 'now') {
        handleChange('scheduleDate', undefined);
        handleChange('scheduleTime', undefined);
        handleChange('repeatSchedule', undefined);
        handleChange('dailyTime', undefined);
        handleChange('weeklyDays', undefined);
        handleChange('weeklyTime', undefined);
        handleChange('monthlyDay', undefined);
        handleChange('monthlyTime', undefined);
    }
  };

  const handleRepeatScheduleChange = (value: string) => {
      handleChange('repeatSchedule', value);
      // Reset specific repeat details when changing repeat type
      if (value !== 'daily') handleChange('dailyTime', undefined);
      if (value !== 'weekly') {
          handleChange('weeklyDays', undefined);
          handleChange('weeklyTime', undefined);
      }
      if (value !== 'monthly') {
           handleChange('monthlyDay', undefined);
           handleChange('monthlyTime', undefined);
      }
  };

  const handleWeeklyDayToggle = (day: string, isSelected: boolean) => {
      const currentWeeklyDays = config.weeklyDays || [];
      if (isSelected) {
          // Add day if not already included
          if (!currentWeeklyDays.includes(day)) {
            handleChange('weeklyDays', [...currentWeeklyDays, day]);
          }
      } else {
          // Remove day
          handleChange('weeklyDays', currentWeeklyDays.filter(d => d !== day));
      }
  };

  const daysOfWeek = [
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
      { value: 'sunday', label: 'Sunday' },
  ];

  // Determine if the 'Create new configuration' fields should be shown
  // This is true if showCloudConfig is true AND cloudConfigId is 'new'
  const shouldShowNewCloudConfigFields = showCloudConfig && isCreatingNewCloudConfig;

  // Filter cloud settings based on the selected destination
  const filteredCloudSettings = useMemo(() => {
    if (!config.destination || config.destination === 'Direct download') {
      return [];
    }
    return mockCloudSettings.filter(setting => setting.destinationType === config.destination);
  }, [config.destination]);

  const renderContent = () => {
  return (
    <div className="space-y-6">
        {/* Basic Configuration - Two columns layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobName">Job name</Label>
          <Input
            id="jobName"
            value={config.jobName}
            onChange={(e) => handleChange('jobName', e.target.value)}
            placeholder="Enter a name for this export job"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataWithChanges">Data with changes</Label>
          <Select
            value={config.dataWithChanges}
                onValueChange={handleDataWithChangesChange}
          >
            <SelectTrigger id="dataWithChanges">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
                  <SelectItem value="last1day">Last 1 day</SelectItem>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last14days">Last 14 days</SelectItem>
                  <SelectItem value="last1month">Last 1 month</SelectItem>
                  <SelectItem value="last2months">Last 2 months</SelectItem>
                  <SelectItem value="last3months">Last 3 months</SelectItem>
                  <SelectItem value="all">All data</SelectItem>
                  <SelectItem value="custom">Custom date range</SelectItem>
            </SelectContent>
          </Select>

              {showCustomDateRange && (
                <div className="mt-2 space-y-2">
                   <Label>Custom date range</Label>
                   <div className="flex space-x-2">
                      {/* Start Date Picker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !config.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {config.startDate ? format(new Date(config.startDate), "PPP") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={config.startDate ? new Date(config.startDate) : undefined}
                            onSelect={(selectedDate) => handleDateChange('startDate', selectedDate)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                       {/* End Date Picker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !config.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {config.endDate ? format(new Date(config.endDate), "PPP") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={config.endDate ? new Date(config.endDate) : undefined}
                            onSelect={(selectedDate) => handleDateChange('endDate', selectedDate)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                   </div>
                </div>
              )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fileFormat">File format</Label>
          <Select
            value={config.fileFormat}
            onValueChange={(value) => handleChange('fileFormat', value)}
          >
            <SelectTrigger id="fileFormat">
              <SelectValue placeholder="Select file format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV exploded">CSV exploded</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="Parquet">Parquet</SelectItem>
            </SelectContent>
          </Select>
            </div>
        </div>

          {/* Right Column */}
          <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Export destination</Label>
          <Select
            value={config.destination}
                onValueChange={handleDestinationChange}
          >
            <SelectTrigger id="destination">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
                  <SelectItem value="Direct download">
                     <div className="flex items-center">
                       <Download className="mr-2 h-4 w-4" />
                       Direct download
                     </div>
                  </SelectItem>
                  <SelectItem value="AWS S3">
                      <div className="flex items-center">
                       <Cloud className="mr-2 h-4 w-4" />
                       AWS S3
                     </div>
                  </SelectItem>
                  <SelectItem value="Azure Blob Storage">
                     <div className="flex items-center">
                       <Cloud className="mr-2 h-4 w-4" />
                       Azure Blob Storage
                     </div>
                  </SelectItem>
                  <SelectItem value="Google Cloud Storage">
                     <div className="flex items-center">
                       <Cloud className="mr-2 h-4 w-4" />
                       Google Cloud Storage
                     </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {showCloudConfig && (
                <div className="mt-4 space-y-4 p-4 border rounded-lg">
                   <div className="space-y-2">
                      <Label htmlFor="cloudConfigId">Configuration</Label>
                      <Select
                         value={config.cloudConfigId || ''}
                         onValueChange={handleCloudConfigSelect}
                      >
                         <SelectTrigger id="cloudConfigId">
                            <SelectValue placeholder="Select configuration" />
                         </SelectTrigger>
                         <SelectContent>
                            {filteredCloudSettings.map(setting => (
                                <SelectItem key={setting.id} value={setting.id}>
                                    {setting.name} ({setting.destinationType})
                                </SelectItem>
                            ))}
                            <SelectItem value="new">Create new configuration</SelectItem>
            </SelectContent>
          </Select>
                   </div>

                   {shouldShowNewCloudConfigFields && (
                      <div className="space-y-4">
                        {/* Input fields for new configuration */}
                        {/* Authentication details would typically be handled via a secure method, not direct inputs in a demo */}
                        <div className="space-y-2">
                          <Label htmlFor="bucketName">{config.destination === 'Azure Blob Storage' ? 'Container name' : 'Bucket name'}</Label>
                          <Input
                            id="bucketName"
                            value={config.bucketName || ''}
                            onChange={(e) => handleChange('bucketName', e.target.value)}
                            placeholder={config.destination === 'Azure Blob Storage' ? 'Enter container name' : 'Enter bucket name'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="path">Path</Label>
                          <Input
                            id="path"
                            value={config.path || ''}
                            onChange={(e) => handleChange('path', e.target.value)}
                            placeholder="Enter path (optional, e.g., folder/subfolder/)"
                          />
                        </div>
                        {config.destination === 'AWS S3' && (
                          <div className="space-y-2">
                            <Label htmlFor="region">Region</Label>
                            <Select
                              value={config.region || ''}
                              onValueChange={(value) => handleChange('region', value)}
                            >
                              <SelectTrigger id="region">
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                                <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                                 {/* Add more regions as needed */}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                         {/* Authentication fields (e.g., Access Key ID, Secret Access Key) would go here in a real app */}
                         {/* For this demo, we'll omit them and assume auth is handled by environment/IAM */}
                      </div>
                   )}
                </div>
              )}
        </div>

        <div className="space-y-2">
              <Label>When to export</Label>
               {/* Mimic screenshot layout and Google Calendar repeat options */}
               <div className="flex items-center space-x-2">
                  {/* Schedule Type Select */}
          <Select
            value={config.whenToExport}
                    onValueChange={handleWhenToExportChange}
          >
                    <SelectTrigger id="whenToExport" className="w-[180px]">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
                      <SelectItem value="now">Export now</SelectItem>
                      <SelectItem value="schedule">Schedule export</SelectItem>
                    </SelectContent>
                  </Select>

                  {config.whenToExport === 'schedule' && (
                     <>
                        {/* Start Date Picker */}
                        <Label>Start on</Label>
                        <Popover>
                           <PopoverTrigger asChild>
                             <Button
                               variant="outline"
                               className={cn(
                                 "w-[150px] justify-start text-left font-normal",
                                 !config.scheduleDate && "text-muted-foreground"
                               )}
                             >
                               <CalendarIcon className="mr-2 h-4 w-4" />
                               {config.scheduleDate ? format(new Date(config.scheduleDate), "MM/dd/yy") : "Pick a date"}
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0">
                             <Calendar
                               mode="single"
                               selected={config.scheduleDate ? new Date(config.scheduleDate) : undefined}
                               onSelect={(selectedDate) => handleDateChange('scheduleDate', selectedDate)}
                               initialFocus
                             />
                           </PopoverContent>
                        </Popover>

                         {/* Time Input */}
                         <Label>at</Label>
                         <Input
                           type="time"
                           value={config.scheduleTime || '12:00'}
                           onChange={(e) => handleChange('scheduleTime', e.target.value)}
                           className="w-[100px]"
                         />

                         {/* Repeat Select */}
                         <Select
                           value={config.repeatSchedule || 'never'}
                           onValueChange={handleRepeatScheduleChange}
                         >
                           <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Repeat" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="never">Does not repeat</SelectItem>
                              <SelectItem value="daily">Repeats daily</SelectItem>
                              <SelectItem value="weekly">Repeats weekly</SelectItem>
                              <SelectItem value="monthly">Repeats monthly</SelectItem>
                           </SelectContent>
                         </Select>
                     </>
                  )}

               </div>
               {/* Conditional rendering for repeat details */}
               {config.whenToExport === 'schedule' && config.repeatSchedule === 'daily' && (
                  <div className="ml-2 mt-2 space-y-2">
                     <Label htmlFor="dailyTime">Time of day</Label>
                     <Input
                       type="time"
                       value={config.dailyTime || '00:00'}
                       onChange={(e) => handleChange('dailyTime', e.target.value)}
                       className="w-32"
                     />
                  </div>
               )}
               {config.whenToExport === 'schedule' && config.repeatSchedule === 'weekly' && (
                   <div className="ml-2 mt-2 space-y-2">
                     <Label>Days of the week</Label>
                     {/* Checkbox group for days of the week */}
                     <div className="flex flex-wrap gap-2">
                       {daysOfWeek.map(day => (
                          <div key={day.value} className="flex items-center space-x-1">
                             <Checkbox
                                id={`weekly-${day.value}`}
                                checked={config.weeklyDays?.includes(day.value) || false}
                                onCheckedChange={(isChecked: boolean) => handleWeeklyDayToggle(day.value, isChecked)}
                             />
                             <Label htmlFor={`weekly-${day.value}`} className="text-sm font-normal">{day.label}</Label>
                          </div>
                       ))}
                     </div>
                     <Label htmlFor="weeklyTime">Time of day</Label>
                     <Input
                       type="time"
                       value={config.weeklyTime || '00:00'}
                       onChange={(e) => handleChange('weeklyTime', e.target.value)}
                       className="w-32"
                     />
                   </div>
               )}
               {config.whenToExport === 'schedule' && config.repeatSchedule === 'monthly' && (
                   <div className="ml-2 mt-2 space-y-2">
                     <Label htmlFor="monthlyDay">Day of the month</Label>
                     <Select
                       value={config.monthlyDay || '1'}
                       onValueChange={(value) => handleChange('monthlyDay', value)}
                     >
                       <SelectTrigger className="w-32">
                         <SelectValue placeholder="Select day" />
                       </SelectTrigger>
                       <SelectContent>
                         {Array.from({ length: 31 }, (_, i) => (
                           <SelectItem key={i + 1} value={(i + 1).toString()}>
                             {i + 1}
                           </SelectItem>
                         ))}
            </SelectContent>
          </Select>
                     <Label htmlFor="monthlyTime">Time of day</Label>
                     <Input
                       type="time"
                       value={config.monthlyTime || '00:00'}
                       onChange={(e) => handleChange('monthlyTime', e.target.value)}
                       className="w-32"
                     />
                   </div>
               )}

            </div>
        </div>
      </div>

      {/* Advanced Settings Card */}
        <Card className="space-y-4 p-4">
           <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
           >
              <h4 className="text-sm font-medium">Advanced Settings</h4>
              {isAdvancedSettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
           </div>
           {isAdvancedSettingsOpen && (
          <div className="space-y-4">
                   {/* Content of Advanced Settings */}
                   {/* SlicedByCrosswalks Checkbox */}
                   <div className="flex items-center space-x-2">
                       <Checkbox
                           id="slicedByCrosswalks"
                           checked={config.slicedByCrosswalks || false}
                           onCheckedChange={(isChecked: boolean) => handleChange('slicedByCrosswalks', isChecked)}
                       />
                       <Label htmlFor="slicedByCrosswalks" className="text-sm font-normal flex items-center">
                           SlicedByCrosswalks
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Enabling this slices the data by crosswalks.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                   </div>

                   {/* SliceFilter Parameters Input */}
                   <div className="space-y-2">
                       <Label htmlFor="sliceFilterParameters" className="text-sm font-normal flex items-center">
                           SliceFilter Parameters
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Define parameters for slicing the data.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                       <Input
                           id="sliceFilterParameters"
                           value={config.sliceFilterParameters || ''}
                           onChange={(e) => handleChange('sliceFilterParameters', e.target.value)}
                           placeholder="Enter the parameters"
                       />
                   </div>

                   {/* Group by parameters Input */}
                   <div className="space-y-2">
                       <Label htmlFor="groupByParameters" className="text-sm font-normal flex items-center">
                           Group by parameters
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Define parameters for grouping the data.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                       <Input
                           id="groupByParameters"
                           value={config.groupByParameters || ''}
                           onChange={(e) => handleChange('groupByParameters', e.target.value)}
                           placeholder="Enter the parameters"
                       />
                   </div>

                   {/* Anchor attribute parameters Input */}
                   <div className="space-y-2">
                       <Label htmlFor="anchorAttributeParameters" className="text-sm font-normal flex items-center">
                           Anchor attribute parameters
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Define parameters for anchoring attributes.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                       <Input
                           id="anchorAttributeParameters"
                           value={config.anchorAttributeParameters || ''}
                           onChange={(e) => handleChange('anchorAttributeParameters', e.target.value)}
                           placeholder="Enter the parameters"
                       />
                   </div>

                   {/* Headers style Radio */}
                   <div className="space-y-2">
                       <Label className="text-sm font-normal flex items-center">
                           Headers style
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Choose the style for the headers.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                       <div className="flex items-center space-x-4">
                           <div className="flex items-center space-x-2">
                               <input
                                   type="radio"
                                   id="headersStyleName"
                                   name="headersStyle"
                                   value="Name"
                                   checked={config.headersStyle === 'Name'}
                                   onChange={(e) => handleChange('headersStyle', e.target.value)}
                               />
                               <Label htmlFor="headersStyleName" className="text-sm font-normal">Name</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                               <input
                                   type="radio"
                                   id="headersStyleLabel"
                                   name="headersStyle"
                                   value="Label"
                                   checked={config.headersStyle === 'Label'}
                                   onChange={(e) => handleChange('headersStyle', e.target.value)}
                               />
                               <Label htmlFor="headersStyleLabel" className="text-sm font-normal">Label</Label>
                           </div>
                       </div>
                   </div>

                   {/* Header format Radio */}
                   <div className="space-y-2">
                       <Label className="text-sm font-normal flex items-center">
                           Header format
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Choose the format for the headers.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                       <div className="flex items-center space-x-4">
                           <div className="flex items-center space-x-2">
                               <input
                                   type="radio"
                                   id="headerFormatDefault"
                                   name="headerFormat"
                                   value="Default"
                                   checked={config.headerFormat === 'Default'}
                                   onChange={(e) => handleChange('headerFormat', e.target.value)}
                               />
                               <Label htmlFor="headerFormatDefault" className="text-sm font-normal">Default</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                               <input
                                   type="radio"
                                   id="headerFormatConsistent"
                                   name="headerFormat"
                                   value="Consistent"
                                   checked={config.headerFormat === 'Consistent'}
                                   onChange={(e) => handleChange('headerFormat', e.target.value)}
                               />
                               <Label htmlFor="headerFormatConsistent" className="text-sm font-normal">Consistent</Label>
                           </div>
                       </div>
                   </div>

                   {/* Date Format Radio */}
                   <div className="space-y-2">
                       <Label className="text-sm font-normal flex items-center">
                           Date Format
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Choose the format for dates.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                       <div className="flex items-center space-x-4">
                           <div className="flex items-center space-x-2">
                               <input
                                   type="radio"
                                   id="dateFormatTimestamp"
                                   name="dateFormat"
                                   value="Time Stamp"
                                   checked={config.dateFormat === 'Time Stamp'}
                                   onChange={(e) => handleChange('dateFormat', e.target.value)}
                               />
                               <Label htmlFor="dateFormatTimestamp" className="text-sm font-normal">Time Stamp</Label>
                           </div>
                           <div className="flex items-center space-x-2">
                               <input
                                   type="radio"
                                   id="dateFormatReadable"
                                   name="dateFormat"
                                   value="Readable"
                                   checked={config.dateFormat === 'Readable'}
                                   onChange={(e) => handleChange('dateFormat', e.target.value)}
                               />
                               <Label htmlFor="dateFormatReadable" className="text-sm font-normal">Readable</Label>
                           </div>
                       </div>
                   </div>

                   {/* Export Operational Values (OV) only Checkbox */}
                   <div className="flex items-center space-x-2">
                       <Checkbox
                           id="exportOperationalValuesOnly"
                           checked={config.exportOperationalValuesOnly || false}
                           onCheckedChange={(isChecked: boolean) => handleChange('exportOperationalValuesOnly', isChecked)}
                       />
                       <Label htmlFor="exportOperationalValuesOnly" className="text-sm font-normal flex items-center">
                           Export Operational Values (OV) only
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Only export operational values.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                   </div>

                   {/* Send hidden attributes Checkbox */}
                   <div className="flex items-center space-x-2">
                       <Checkbox
                           id="sendHiddenAttributes"
                           checked={config.sendHiddenAttributes || false}
                           onCheckedChange={(isChecked: boolean) => handleChange('sendHiddenAttributes', isChecked)}
                       />
                       <Label htmlFor="sendHiddenAttributes" className="text-sm font-normal flex items-center">
                           Send hidden attributes
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Include attributes that are otherwise hidden.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                   </div>

                   {/* Produce a single output file Checkbox */}
                   <div className="flex items-center space-x-2">
                       <Checkbox
                           id="produceSingleOutputFile"
                           checked={config.produceSingleOutputFile || false}
                           onCheckedChange={(isChecked: boolean) => handleChange('produceSingleOutputFile', isChecked)}
                       />
                       <Label htmlFor="produceSingleOutputFile" className="text-sm font-normal flex items-center">
                           Produce a single output file
                           <TooltipProvider>
                               <Tooltip>
                                   <TooltipTrigger asChild>
                                       <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-pointer" />
                                   </TooltipTrigger>
                                   <TooltipContent side="right" className="max-w-xs">
                                       <p>Export all data into a single file instead of multiple files.</p>
                                   </TooltipContent>
                               </Tooltip>
                           </TooltipProvider>
                       </Label>
                   </div>

          </div>
           )}
      </Card>
    </div>
  );
  };

  return renderContent();
};

export default ExportConfigurationStep;