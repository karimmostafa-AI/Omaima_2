"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'tag';
}

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;
    
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Fetch search suggestions
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/suggestions?query=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
        saveRecentSearch(value);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      router.push(`/products?${params.toString()}`);
    }, 500),
    [searchParams, router, recentSearches]
  );

  useEffect(() => {
    if (searchTerm !== (searchParams.get('search') || '')) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    fetchSuggestions(searchTerm);
  }, [searchTerm, fetchSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    const params = new URLSearchParams(searchParams);
    params.set('search', suggestion);
    params.set('page', '1');
    saveRecentSearch(suggestion);
    router.push(`/products?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    router.push(`/products?${params.toString()}`);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const displaySuggestions = suggestions.length > 0 || recentSearches.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products, brands, materials..."
          className={cn(
            "pl-10",
            searchTerm && "pr-10"
          )}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(displaySuggestions)}
          onKeyDown={handleKeyDown}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && displaySuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchTerm && (
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2 px-2">Recent Searches</div>
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm flex items-center gap-2"
                  onClick={() => handleSuggestionClick(recent)}
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  {recent}
                </button>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              {!searchTerm && recentSearches.length > 0 && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs text-muted-foreground mb-2 px-2">Suggestions</div>
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm flex items-center gap-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {searchTerm && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
