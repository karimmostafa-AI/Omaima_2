"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import ProductFilters from '@/components/products/product-filters';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const FilterModal = () => {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  
  // Count active filters
  const activeFiltersCount = [
    searchParams.get('category'),
    searchParams.get('priceMin'),
    searchParams.get('priceMax'),
    searchParams.get('materials'),
    searchParams.get('sizes'),
    searchParams.get('colors'),
    searchParams.get('brands'),
    searchParams.get('inStock'),
    searchParams.get('isCustomizable'),
    searchParams.get('isReadyMade')
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {activeFiltersCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
            </p>
          )}
        </SheetHeader>
        <div className="py-4">
          <ProductFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterModal;
