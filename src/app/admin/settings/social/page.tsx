'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";

interface ProviderConfig {
  enabled: boolean;
  [key: string]: any;
}
interface AllProviderConfigs {
  [providerName: string]: ProviderConfig;
}

const availableProviders = {
  google: {
    title: 'Google',
    fields: [
      { name: 'client_id', label: 'Client ID' },
      { name: 'client_secret', label: 'Client Secret', type: 'password' },
    ],
  },
  facebook: {
    title: 'Facebook',
    fields: [
      { name: 'client_id', label: 'App ID' },
      { name: 'client_secret', label: 'App Secret', type: 'password' },
    ],
  },
  github: {
    title: 'GitHub',
    fields: [
      { name: 'client_id', label: 'Client ID' },
      { name: 'client_secret', label: 'Client Secret', type: 'password' },
    ],
  },
};

export default function SocialAuthPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<AllProviderConfigs>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/social');
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

  const saveAllConfigs = async (dataToSave: AllProviderConfigs) => {
      try {
          const response = await fetch('/api/settings/social', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataToSave)
          });
          if (!response.ok) throw new Error("Failed to save settings");
          toast({ title: "Success", description: "Settings saved." });
          fetchConfigs();
      } catch (error) {
          toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
      }
  }

  const handleToggle = async (providerName: string, enabled: boolean) => {
    const newConfigs = {
      ...configs,
      [providerName]: { ...(configs[providerName] || {}), enabled },
    };
    await saveAllConfigs(newConfigs);
  };

  const handleOpenModal = (providerName: string) => {
      setActiveProvider(providerName);
      setIsModalOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Authentication</CardTitle>
          <CardDescription>Enable and configure third-party login providers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(availableProviders).map(([key, provider]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-lg">{provider.title}</CardTitle>
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

      {activeProvider && (
        <ProviderConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          providerKey={activeProvider}
          providerInfo={availableProviders[activeProvider]}
          initialData={configs[activeProvider] || { enabled: false }}
          onSave={async (data) => {
              const newConfigs = {...configs, [activeProvider]: data };
              await saveAllConfigs(newConfigs);
              setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface ProviderConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    providerKey: string;
    providerInfo: { title: string; fields: any[] };
    initialData: ProviderConfig;
    onSave: (data: ProviderConfig) => Promise<void>;
}

function ProviderConfigModal({ isOpen, onClose, providerInfo, initialData, onSave }: ProviderConfigModalProps) {
    const form = useForm({ defaultValues: initialData });

    const handleFormSubmit = (data: any) => {
        const fullData = { ...initialData, ...data };
        onSave(fullData);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure {providerInfo.title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                        {providerInfo.fields.map(f => (
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
