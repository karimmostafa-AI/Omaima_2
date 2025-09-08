'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";

export default function FirebaseSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/settings/firebase');
        const config = await response.json();
        if (config) {
          form.reset({ ...config, server_key: '' });
        }
      } catch (error) {
        console.error("Failed to fetch Firebase config", error);
      }
    }
    fetchConfig();
  }, [form]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      toast({ title: "Success", description: "Firebase settings saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save Firebase settings.", variant: "destructive" });
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
              <CardTitle>Firebase Notification Configuration</CardTitle>
              <CardDescription>Setup Firebase Cloud Messaging (FCM) for push notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField name="server_key" render={({ field }) => (<FormItem><FormLabel>FCM Server Key</FormLabel><FormControl><Input type="password" {...field} placeholder="•••••••• (leave blank to keep unchanged)" /></FormControl><FormMessage /></FormItem>)} />
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
