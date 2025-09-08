'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { User, Gender } from '@prisma/client';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const customerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  gender: z.nativeEnum(Gender),
  dateOfBirth: z.date(),
  avatarUrl: z.string().optional(),
});

const refinedSchema = (isEditMode: boolean) => customerFormSchema.superRefine((data, ctx) => {
  if (!isEditMode) {
    // Create mode: password is required
    if (!data.password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required", path: ['password'] });
    } else if (data.password.length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must be at least 8 characters", path: ['password'] });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords don't match", path: ['confirmPassword'] });
    }
  } else {
    // Edit mode: password is optional, but if present, must be valid
    if (data.password || data.confirmPassword) {
      if (!data.password || data.password.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must be at least 8 characters", path: ['password'] });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords don't match", path: ['confirmPassword'] });
      }
    }
  }
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: Omit<User, 'passwordHash'>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, isLoading }: CustomerFormProps) {
  const isEditMode = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(refinedSchema(isEditMode)),
    defaultValues: {
      ...initialData,
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : new Date(),
      password: '',
      confirmPassword: '',
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setAvatarPreview(URL.createObjectURL(file));
          const formData = new FormData();
          formData.append('file', file);
          try {
              const response = await fetch('/api/upload', { method: 'POST', body: formData });
              const result = await response.json();
              if (response.ok) {
                  form.setValue('avatarUrl', result.url);
              }
          } catch (error) {
              console.error("Failed to upload avatar", error);
          }
      }
  }

  const onFormSubmit = (data: CustomerFormData) => {
    // Don't submit password fields if they are empty in edit mode
    if (isEditMode && !data.password) {
      delete (data as any).password;
      delete (data as any).confirmPassword;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <Card>
            <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FormField name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="space-y-4">
                    <FormItem>
                        <FormLabel>Profile Photo</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={avatarPreview || ''} />
                                    <AvatarFallback>PIC</AvatarFallback>
                                </Avatar>
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Change</Button>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                            </div>
                        </FormControl>
                    </FormItem>
                    <FormField name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value={Gender.MALE}>Male</SelectItem><SelectItem value={Gender.FEMALE}>Female</SelectItem><SelectItem value={Gender.OTHER}>Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} onChange={e => field.onChange(e.target.valueAsDate)} value={field.value?.toISOString().split('T')[0]} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                {(isEditMode ? form.watch('password') : true) && (
                    <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField name="password" render={({ field }) => (<FormItem><FormLabel>{isEditMode ? 'New Password' : 'Password'}</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>)} />
                        <FormField name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm {isEditMode ? 'New' : ''} Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>)} />
                    </div>
                 )}
            </CardContent>
        </Card>
        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Customer'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
