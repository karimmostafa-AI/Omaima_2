"use client";

import React, { useState } from 'react';
import { Category } from '@/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  description: z.string().optional(),
  image: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category;
  isSubmitting: boolean;
  onSubmit: (data: FormData) => void;
}

const CategoryForm = ({ category, isSubmitting, onSubmit }: CategoryFormProps) => {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(category?.image || null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div>
            <Label htmlFor="image">Thumbnail</Label>
            <Input id="image" type="file" {...register('image')} onChange={handleImageChange} />
            {preview && (
              <div className="mt-4">
                <img src={preview} alt="Thumbnail preview" className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Link href="/admin/categories" passHref>
          <Button type="button" variant="outline">Back</Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (category ? 'Updating...' : 'Submitting...') : (category ? 'Update' : 'Submit')}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
