"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GeneralInfoSection = () => {
  const { register, control } = useFormContext();

  // Mock data - in a real app, this would come from an API
  const categories = [{ id: '1', name: 'T-Shirts' }, { id: '2', name: 'Jeans' }];
  const brands = [{ id: '1', name: 'Brand A' }, { id: '2', name: 'Brand B' }];
  const units = [{ id: '1', name: 'pc' }, { id: '2', name: 'kg' }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Brand</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Unit</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map(unit => <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sku">SKU / Barcode</Label>
          <Input id="sku" {...register('sku')} />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInfoSection;
