import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface MobileSearchProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  className?: string;
}

const MobileSearch: React.FC<MobileSearchProps> = ({ 
  initialQuery = '', 
  onSearch, 
  className = '' 
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索主题..."
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Button type="submit" size="sm">
        搜索
      </Button>
    </form>
  );
};

export default MobileSearch;