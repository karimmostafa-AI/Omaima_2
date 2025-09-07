"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ProductInfoSection = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
        </div>
        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea id="shortDescription" {...register('shortDescription')} />
          {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription.message as string}</p>}
        </div>
        <div>
          <Label htmlFor="description">Full Description</Label>
          {/* Rich text editor will go here */}
          <Textarea id="description" {...register('description')} rows={6} />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm">
            Generate with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInfoSection;
