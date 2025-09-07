"use client";

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import ProductFilters from '@/components/products/product-filters';

const FilterModal = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <ProductFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterModal;
