'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";

export default function ReCaptchaSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/settings/recaptcha');
        const config = await response.json();
        if (config) {
          form.reset({ ...config, secret_key: '' });
        }
      } catch (error) {
        console.error("Failed to fetch ReCaptcha config", error);
      }
    }
    fetchConfig();
  }, [form]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      toast({ title: "Success", description: "ReCaptcha settings saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save ReCaptcha settings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google ReCaptcha Configuration</CardTitle>
              <CardDescription>Setup Google ReCaptcha v2 to protect your site from spam.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable ReCaptcha</FormLabel>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value === 'active'}
                                onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                            />
                        </FormControl>
                    </FormItem>
                )}
              />
              <FormField name="site_key" render={({ field }) => (<FormItem><FormLabel>Site Key</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="secret_key" render={({ field }) => (<FormItem><FormLabel>Secret Key</FormLabel><FormControl><Input type="password" {...field} placeholder="•••••••• (leave blank to keep unchanged)" /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
