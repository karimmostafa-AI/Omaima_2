'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";

export default function PusherSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/settings/pusher');
        const config = await response.json();
        if (config) {
          form.reset({ ...config, app_secret: '' });
        }
      } catch (error) {
        console.error("Failed to fetch Pusher config", error);
      }
    }
    fetchConfig();
  }, [form]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      toast({ title: "Success", description: "Pusher settings saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save Pusher settings.", variant: "destructive" });
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
              <CardTitle>Pusher Configuration</CardTitle>
              <CardDescription>Setup Pusher for real-time notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField name="app_id" render={({ field }) => (<FormItem><FormLabel>App ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="app_key" render={({ field }) => (<FormItem><FormLabel>App Key</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="app_secret" render={({ field }) => (<FormItem><FormLabel>App Secret</FormLabel><FormControl><Input type="password" {...field} placeholder="•••••••• (leave blank to keep unchanged)" /></FormControl><FormMessage /></FormItem>)} />
              <FormField name="cluster" render={({ field }) => (<FormItem><FormLabel>Cluster</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
