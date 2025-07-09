import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { searchService } from '../services/search';
import { Topic } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { formatRelativeTime } from '../utils/format';

interface SearchBoxProps {
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Topic[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchService.getSuggestions(searchQuery);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    const trimmedQuery = searchQuery.trim();
    
    // 保存到最近搜索
    const newRecentSearches = [
      trimmedQuery,
      ...recentSearches.filter(s => s !== trimmedQuery)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // 导航到搜索结果页面
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + recentSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            // 选择了建议的主题
            const selectedTopic = suggestions[selectedIndex];
            navigate(`/topic/${selectedTopic.id}`);
          } else {
            // 选择了最近搜索
            const recentIndex = selectedIndex - suggestions.length;
            handleSearch(recentSearches[recentIndex]);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const newRecentSearches = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="搜索主题..."
          className="w-64 h-9 pl-10 pr-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-0 z-50 max-h-96 overflow-hidden animate-slide-down">
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">搜索中...</span>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="border-b border-border">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                  搜索建议
                </div>
                {suggestions.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => navigate(`/topic/${topic.id}`)}
                    className={`w-full px-3 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 ${
                      selectedIndex === index ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {topic.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {topic.node?.title}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(topic.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">
                    最近搜索
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearRecentSearches}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {recentSearches.map((recentSearch, index) => (
                  <button
                    key={recentSearch}
                    onClick={() => handleSearch(recentSearch)}
                    className={`w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 group ${
                      selectedIndex === suggestions.length + index ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{recentSearch}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(recentSearch);
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && suggestions.length === 0 && recentSearches.length === 0 && query.trim().length >= 2 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                没有找到相关结果
              </div>
            )}

            {!loading && suggestions.length === 0 && recentSearches.length === 0 && query.trim().length < 2 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                输入至少2个字符开始搜索
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBox;