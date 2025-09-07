"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PricingSection = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buyingPrice">Buying Price</Label>
          <Input id="buyingPrice" type="number" {...register('buyingPrice', { valueAsNumber: true })} />
          {errors.buyingPrice && <p className="text-red-500 text-sm mt-1">{errors.buyingPrice.message as string}</p>}
        </div>
        <div>
          <Label htmlFor="sellingPrice">Selling Price</Label>
          <Input id="sellingPrice" type="number" {...register('sellingPrice', { valueAsNumber: true })} />
          {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice.message as string}</p>}
        </div>
        <div>
          <Label htmlFor="discountPrice">Discount Price</Label>
          <Input id="discountPrice" type="number" {...register('discountPrice', { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="stock">Current Stock</Label>
          <Input id="stock" type="number" {...register('stock', { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="minOrderQty">Minimum Order Quantity</Label>
          <Input id="minOrderQty" type="number" {...register('minOrderQty', { valueAsNumber: true })} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSection;
