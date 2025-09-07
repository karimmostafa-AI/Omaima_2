'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Trash2, Search, X } from 'lucide-react';
import { Media } from '@prisma/client';

async function getMedia(page = 1, limit = 20): Promise<{ data: Media[], pagination: any }> {
  const response = await fetch(`/api/media?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch media');
  }
  return response.json();
}

async function uploadMedia(file: File): Promise<Media> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/media', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload media');
  }
  return response.json();
}

async function deleteMedia(id: string): Promise<void> {
  const response = await fetch(`/api/media/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete media');
  }
}

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMedia();
      setMediaItems(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadMedia(file);
        fetchMedia();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedMedia) {
      if (window.confirm(`Are you sure you want to delete ${selectedMedia.fileName}?`)) {
        try {
          await deleteMedia(selectedMedia.id);
          setSelectedMedia(null);
          fetchMedia();
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const filteredMedia = mediaItems.filter(item =>
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-1/3">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*"
              />
            </div>

            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-1">
                  {filteredMedia.map((item) => (
                    <button
                      key={item.id}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                        selectedMedia?.id === item.id ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedMedia(item)}
                    >
                      <img src={item.url} alt={item.altText || item.fileName} className="object-cover w-full h-full" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {item.fileName}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedMedia && (
        <div className="w-80 border-l bg-card p-4 space-y-4 flex flex-col">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-semibold">Details</h3>
             <Button variant="ghost" size="icon" onClick={() => setSelectedMedia(null)}>
                <X className="h-4 w-4" />
             </Button>
           </div>
          <div className="relative aspect-square w-full bg-muted rounded-md overflow-hidden">
            <img src={selectedMedia.url} alt={selectedMedia.altText || selectedMedia.fileName} className="object-contain w-full h-full" />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-semibold truncate">{selectedMedia.fileName}</p>
            <p className="text-muted-foreground">{new Date(selectedMedia.createdAt).toLocaleDateString()}</p>
            <p className="text-muted-foreground">{(selectedMedia.size / 1024).toFixed(2)} KB</p>
          </div>
          <div className="mt-auto">
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
