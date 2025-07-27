import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeal } from '@/contexts/useDeal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';
import { HelpTooltip } from "@/components/ui/help-tooltip";

const PropertyInfoSchema = z.object({
  dealName: z.string().min(1, "Deal name is required"),
  propertyAddress: z.string().min(1, "Property address is required"),
  askingPrice: z.number().min(0, "Asking price must be positive"),
  facilitySizeSqft: z.number().min(0, "Facility size must be positive"),
  isRealEstateIncluded: z.boolean(),
});

type PropertyInfoData = z.infer<typeof PropertyInfoSchema>;

export const PropertyInfoStep: React.FC = () => {
  const { deal, updateDeal, marketData } = useDeal();
  const [isRealEstateIncluded, setIsRealEstateIncluded] = useState(deal?.isRealEstateIncluded || false);

  const form = useForm<PropertyInfoData>({
    resolver: zodResolver(PropertyInfoSchema),
    defaultValues: {
      dealName: deal?.dealName || '',
      propertyAddress: deal?.propertyAddress || '',
      askingPrice: deal?.askingPrice || 0,
      facilitySizeSqft: deal?.facilitySizeSqft || 0,
      isRealEstateIncluded: deal?.isRealEstateIncluded || false,
    },
  });

  // Update form when deal data changes (from AI analysis)
  useEffect(() => {
    if (deal) {
      form.setValue('dealName', deal.dealName || '');
      form.setValue('propertyAddress', deal.propertyAddress || '');
      form.setValue('askingPrice', deal.askingPrice || 0);
      form.setValue('facilitySizeSqft', deal.facilitySizeSqft || 0);
      form.setValue('isRealEstateIncluded', deal.isRealEstateIncluded || false);
      setIsRealEstateIncluded(deal.isRealEstateIncluded || false);
    }
  }, [deal, form]);

  // Save changes on blur
  const handleFieldChange = (field: keyof PropertyInfoData, value: any) => {
    updateDeal({ [field]: value });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Enter the basic property information for your laundromat deal. If you don't have specific information, leave fields blank.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deal Name */}
          <FormField
            control={form.control}
            name="dealName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Deal Name *
                  <HelpTooltip content="A unique name to identify this deal in your analysis. Use something memorable like the business name or location." />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., The Spin Cycle Laundromat"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldChange('dealName', e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Property Address */}
          <FormField
            control={form.control}
            name="propertyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Property Address *
                  <HelpTooltip content="The complete address of the laundromat property. This is used for location-based analysis and market data." />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 123 Main St, City, State 12345"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldChange('propertyAddress', e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asking Price */}
          <FormField
            control={form.control}
            name="askingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Asking Price
                  <HelpTooltip content="The seller's asking price for the business. This includes equipment, customer base, and goodwill. Does not include real estate unless specified." />
                </FormLabel>
                <FormControl>
                  <CurrencyInput
                    placeholder="$150,000.00"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      handleFieldChange('askingPrice', value);
                    }}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Current: {formatCurrency(field.value || 0)}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Facility Size */}
          <FormField
            control={form.control}
            name="facilitySizeSqft"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Facility Size (Square Feet)
                  <HelpTooltip content="Total square footage of the laundromat space. Includes customer area, equipment area, and any office/storage space. Used to calculate rent per sq ft and equipment density." />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="2,000"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                      field.onChange(value);
                      handleFieldChange('facilitySizeSqft', value);
                    }}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Industry standard: 1,500-3,500 sq ft for community laundromats
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Real Estate Included */}
          <FormField
            control={form.control}
            name="isRealEstateIncluded"
            render={({ field }) => (
              <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Real Estate Included in Sale?</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Toggle this if the property real estate is included in the purchase price
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={isRealEstateIncluded}
                    onCheckedChange={(checked) => {
                      setIsRealEstateIncluded(checked);
                      field.onChange(checked);
                      handleFieldChange('isRealEstateIncluded', checked);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
};