'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search } from 'lucide-react';
import { Media } from '@prisma/client';

async function getMedia(page = 1, limit = 50): Promise<{ data: Media[] }> {
  const response = await fetch(`/api/media?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch media');
  return response.json();
}

async function uploadMedia(file: File): Promise<Media> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/media', { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Failed to upload media');
  return response.json();
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
}

export function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('library');
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
    if (isOpen && activeTab === 'library') {
      fetchMedia();
    }
  }, [isOpen, activeTab, fetchMedia]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const newMedia = await uploadMedia(file);
        setMediaItems(prev => [newMedia, ...prev]);
        setSelectedMedia(newMedia);
        setActiveTab('library');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  const filteredMedia = mediaItems.filter(item =>
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="flex-1 flex flex-col">
            <div className="relative my-4">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4 p-1">
                  {filteredMedia.map((item) => (
                    <button
                      key={item.id}
                      className={`relative aspect-square rounded-md overflow-hidden border-4 ${
                        selectedMedia?.id === item.id ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedMedia(item)}
                    >
                      <img src={item.url} alt={item.altText || item.fileName} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="upload" className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose a file to upload
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    className="hidden"
                    accept="image/*"
                />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSelect} disabled={!selectedMedia}>Select Image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
