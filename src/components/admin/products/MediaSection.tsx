"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MediaSection = () => {
  const { register } = useFormContext();

  // A simple placeholder for image uploader with preview
  const ImageUploader = ({ name }: { name: string }) => {
    const [preview, setPreview] = React.useState<string | null>(null);
    const { register } = useFormContext();

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    return (
      <div>
        <Input type="file" {...register(name, { onChange: handleImageChange })} />
        {preview && <img src={preview} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-md" />}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Main Thumbnail (1:1 ratio)</Label>
          <ImageUploader name="thumbnail" />
        </div>
        <div>
          <Label>Additional Images</Label>
          <ImageUploader name="additionalImages" />
        </div>
        <div>
          <Label>Video</Label>
          <Input placeholder="YouTube, Vimeo, or Dailymotion link" {...register('videoUrl')} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaSection;
