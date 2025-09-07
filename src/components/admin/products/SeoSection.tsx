"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const SeoSection = () => {
  const { register } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input id="metaTitle" {...register('metaTitle')} />
        </div>
        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea id="metaDescription" {...register('metaDescription')} />
        </div>
        <div>
          <Label htmlFor="metaKeywords">Meta Keywords</Label>
          <Input id="metaKeywords" {...register('metaKeywords')} placeholder="e.g., t-shirt, summer, cotton" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SeoSection;
