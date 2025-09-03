// components/creator/Dashboard/Header.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, Search, X, LogOut, Settings, UserCircle } from 'lucide-react';
import { HeaderProps } from '@/types/Creatortypes/dashboard';
import { signOut } from 'next-auth/react';

interface SearchResult {
  id: string;
  title: string;
  type: 'transaction' | 'content' | 'template' | 'page';
  url: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile search when opened
  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  const toggleMobileSearch = () => {
    setShowMobileSearch(prev => !prev);
    if (showMobileSearch) {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/creator/auth/login' });
  };

  // Search functionality
  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/creator/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results.data || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchResultClick = (result: SearchResult) => {
    window.location.href = result.url;
    setSearchQuery('');
    setShowSearchResults(false);
    setShowMobileSearch(false);
  };

  const getSearchResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'transaction': return '💰';
      case 'content': return '📄';
      case 'template': return '📝';
      case 'page': return '📋';
      default: return '🔍';
    }
  };

  if (!user) {
    // Skeleton loading state
    return (
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="min-w-0">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 hidden sm:block"></div>
            </div>
          </div>
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button and page info */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">Creator Dashboard</h1>
            <p className="text-sm text-gray-500 hidden sm:block truncate">
              Welcome back, {user.name.split(' ')[0]}!
            </p>
          </div>
        </div>

        {/* Center - Desktop search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, content, templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getSearchResultIcon(result.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </div>
                            {result.description && (
                              <div className="text-xs text-gray-500 truncate mt-1">
                                {result.description}
                              </div>
                            )}
                            <div className="text-xs text-orange-600 capitalize mt-1">
                              {result.type}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Mobile search toggle */}
          <button 
            onClick={toggleMobileSearch}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={showMobileSearch ? "Close search" : "Open search"}
          >
            {showMobileSearch ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button 
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          </button>

          {/* User profile section */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900 truncate max-w-32">{user.name}</div>
              <div className="text-xs text-gray-500 truncate max-w-32">{user.handle}</div>
            </div>
            
            {/* Avatar with dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                title={`${user.name} - ${user.handle}`}
                aria-label="User menu"
              >
                <User className="h-4 w-4 text-white" />
              </button>
              
              {/* Enhanced dropdown menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{user.name}</div>
                        <div className="text-sm text-gray-500 truncate">{user.handle}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <a 
                      href="/creator/dashboard/profile" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      Edit Profile
                    </a>
                    <a 
                      href="/creator/dashboard/settings" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </a>
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    <button  
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder="Search transactions, content, templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Mobile Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-base">{getSearchResultIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </div>
                          <div className="text-xs text-orange-600 capitalize mt-1">
                            {result.type}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;