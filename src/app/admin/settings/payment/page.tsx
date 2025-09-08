'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";

interface GatewayConfig {
  enabled: boolean;
  mode: 'sandbox' | 'live';
  [key: string]: any;
}
interface AllGatewayConfigs {
  [gatewayName: string]: GatewayConfig;
}

const availableGateways = {
  stripe: {
    title: 'Stripe',
    fields: [
      { name: 'stripe_publishable_key', label: 'Publishable Key' },
      { name: 'stripe_secret_key', label: 'Secret Key', type: 'password' },
    ],
  },
  paypal: {
    title: 'PayPal',
    fields: [
      { name: 'paypal_client_id', label: 'Client ID' },
      { name: 'paypal_client_secret', label: 'Client Secret', type: 'password' },
    ],
  },
  cod: {
    title: 'Cash on Delivery',
    fields: [{ name: 'title', label: 'Title' }],
  },
};

export default function PaymentGatewayPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<AllGatewayConfigs>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGateway, setActiveGateway] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/payment');
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const saveAllConfigs = async (dataToSave: AllGatewayConfigs) => {
      try {
          const response = await fetch('/api/settings/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataToSave)
          });
          if (!response.ok) throw new Error("Failed to save settings");
          toast({ title: "Success", description: "Settings saved." });
          // Refetch configs to get the fresh state (without secrets)
          fetchConfigs();
      } catch (error) {
          toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
      }
  }

  const handleToggle = async (gatewayName: string, enabled: boolean) => {
    const newConfigs = {
      ...configs,
      [gatewayName]: { ...(configs[gatewayName] || { mode: 'sandbox' }), enabled },
    };
    await saveAllConfigs(newConfigs);
  };

  const handleOpenModal = (gatewayName: string) => {
      setActiveGateway(gatewayName);
      setIsModalOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Configure and manage payment methods for your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(availableGateways).map(([key, gw]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-lg">{gw.title}</CardTitle>
                    <CardDescription>
                        {configs[key]?.enabled ? 'Enabled' : 'Disabled'}
                    </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => handleOpenModal(key)}>Configure</Button>
                    <Switch
                        checked={configs[key]?.enabled || false}
                        onCheckedChange={(checked) => handleToggle(key, checked)}
                    />
                </div>
              </CardHeader>
            </Card>
          ))}
        </CardContent>
      </Card>

      {activeGateway && (
        <GatewayConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          gatewayKey={activeGateway}
          gatewayInfo={availableGateways[activeGateway]}
          initialData={configs[activeGateway] || { enabled: false, mode: 'sandbox' }}
          onSave={async (data) => {
              const newConfigs = {...configs, [activeGateway]: data };
              await saveAllConfigs(newConfigs);
              setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface GatewayConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    gatewayKey: string;
    gatewayInfo: { title: string; fields: any[] };
    initialData: GatewayConfig;
    onSave: (data: GatewayConfig) => Promise<void>;
}

function GatewayConfigModal({ isOpen, onClose, gatewayInfo, initialData, onSave }: GatewayConfigModalProps) {
    const form = useForm({ defaultValues: initialData });

    const handleFormSubmit = (data: any) => {
        const fullData = { ...initialData, ...data };
        onSave(fullData);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure {gatewayInfo.title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox</SelectItem>
                                        <SelectItem value="live">Live</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {gatewayInfo.fields.map(f => (
                             <FormField
                                key={f.name}
                                control={form.control}
                                name={f.name}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{f.label}</FormLabel>
                                        <FormControl>
                                            <Input type={f.type || 'text'} {...field} placeholder={f.type === 'password' ? '•••••••• (leave blank to keep unchanged)' : ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Save Configuration</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
