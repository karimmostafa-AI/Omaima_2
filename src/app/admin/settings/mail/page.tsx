'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";

const mailConfigSchema = z.object({
  mailer: z.enum(['smtp', 'mailgun', 'postmark']),
  host: z.string().optional(),
  port: z.coerce.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  encryption: z.enum(['tls', 'ssl', 'none']).optional(),
  mailgun_domain: z.string().optional(),
  mailgun_secret: z.string().optional(),
  postmark_token: z.string().optional(),
  from_address: z.string().email('Invalid from address'),
  from_name: z.string().min(1, 'From name is required'),
});

type MailConfigFormData = z.infer<typeof mailConfigSchema>;

export default function MailConfigurationPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const form = useForm<MailConfigFormData>({
    resolver: zodResolver(mailConfigSchema),
    defaultValues: {
      mailer: 'smtp',
      host: '',
      port: 587,
      username: '',
      password: '',
      encryption: 'tls',
      from_address: '',
      from_name: '',
    },
  });

  useEffect(() => {
    async function fetchMailConfig() {
      try {
        const response = await fetch('/api/settings/mail');
        const config = await response.json();
        if (config && Object.keys(config).length > 0) {
          form.reset({
            ...config,
            password: '',
          });
        }
      } catch (error) {
        console.error("Failed to fetch mail config", error);
      }
    }
    fetchMailConfig();
  }, [form]);

  const handleSubmit = async (data: MailConfigFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      toast({ title: "Success", description: "Mail settings saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save mail settings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
        toast({ title: "Error", description: "Please enter a recipient email.", variant: "destructive" });
        return;
    }
    setIsTesting(true);
    try {
        const response = await fetch('/api/settings/mail/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient: testEmail }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to send test email');
        toast({ title: "Success", description: result.message });
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsTesting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mail Configuration</CardTitle>
              <CardDescription>Configure the system to send emails using SMTP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="mailer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mailer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="smtp">SMTP</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="postmark">Postmark</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div></div> {/* Spacer */}

                {form.watch('mailer') === 'smtp' && (
                  <>
                    <FormField name="host" render={({ field }) => (<FormItem><FormLabel>SMTP Host</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="port" render={({ field }) => (<FormItem><FormLabel>SMTP Port</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="username" render={({ field }) => (<FormItem><FormLabel>SMTP Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="password" render={({ field }) => (<FormItem><FormLabel>SMTP Password</FormLabel><FormControl><Input type="password" {...field} placeholder="•••••••• (leave blank to keep unchanged)" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="encryption" render={({ field }) => (<FormItem><FormLabel>Encryption</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="tls">TLS</SelectItem><SelectItem value="ssl">SSL</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  </>
                )}

                {form.watch('mailer') === 'mailgun' && (
                  <>
                    <FormField name="mailgun_domain" render={({ field }) => (<FormItem><FormLabel>Mailgun Domain</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="mailgun_secret" render={({ field }) => (<FormItem><FormLabel>Mailgun Secret</FormLabel><FormControl><Input type="password" {...field} placeholder="•••••••• (leave blank to keep unchanged)" /></FormControl><FormMessage /></FormItem>)} />
                  </>
                )}

                {form.watch('mailer') === 'postmark' && (
                  <>
                    <FormField name="postmark_token" render={({ field }) => (<FormItem><FormLabel>Postmark Token</FormLabel><FormControl><Input type="password" {...field} placeholder="•••••••• (leave blank to keep unchanged)" /></FormControl><FormMessage /></FormItem>)} />
                  </>
                )}

                <FormField name="from_address" render={({ field }) => (<FormItem><FormLabel>From Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="from_name" render={({ field }) => (<FormItem><FormLabel>From Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </Form>

      <Card>
          <CardHeader>
              <CardTitle>Send a Test Email</CardTitle>
              <CardDescription>Verify your settings by sending a test email.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
              <Input
                type="email"
                placeholder="Recipient email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button onClick={handleSendTestEmail} disabled={isTesting}>
                {isTesting ? 'Sending...' : 'Send Test'}
              </Button>
          </CardContent>
      </Card>
    </div>
  );
}
