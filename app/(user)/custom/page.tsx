"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Eye, 
  Calendar, 
  User, 
  Search,
  Filter,
  Grid,
  List,
  AlertCircle,
  RefreshCw,
  Globe,
  Navigation,
  Edit,
  Plus
} from 'lucide-react';
import { apiFetch } from '@/lib/api-config';
import { useAuth } from '@/context/AuthContext';

// Updated Types based on your API response
interface CustomerPage {
  id: number;
  tenant_id: string;
  title: string;
  slug: string;
  parent_id: number | null;
  position: number;
  is_active: number;
  show_in_nav: number;
  show_in_footer: number;
  status: 'draft' | 'published' | 'archived';
  form_config: any;
  page_type: string | null;
  metadata: any;
  created_by_id: number;
  created_by_type: string;
  updated_by_id: number | null;
  updated_by_type: string | null;
  deleted_by_id: number | null;
  deleted_by_type: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  page_layout: any;
  parent: CustomerPage | null;
  children: CustomerPage[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: CustomerPage[] | CustomerPage;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const CustomerPages = () => {
  const {  token } = useAuth();
  
  // State Management
  const [pages, setPages] = useState<CustomerPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch Pages Function
  // const fetchPages = async (page = 1, search = '', status = 'all', active = 'all') => {
  //   if (!token) return;
    
  //   try {
  //     setLoading(page === 1);
  //     setError(null);

  //     // Build query parameters
  //     const params = new URLSearchParams({
  //       page: page.toString(),
  //       limit: '12',
  //       ...(search && { search }),
  //       ...(status !== 'all' && { status }),
  //       ...(active !== 'all' && { is_active: active === 'active' ? '1' : '0' }),
  //     });

  //     const response: ApiResponse = await apiFetch(`/customer/pages?${params.toString()}`, {
  //       userRole: 'customer',
  //       tenantId: user?.tenantId,
  //     });

  //     if (response.success) {
  //       const pagesData = Array.isArray(response.data) ? response.data : [response.data];
        
  //       if (page === 1) {
  //         setPages(pagesData);
  //       } else {
  //         setPages(prev => [...prev, ...pagesData]);
  //       }

  //       // Update pagination info from meta or estimate
  //       if (response.meta) {
  //         setCurrentPage(response.meta.page);
  //         setTotalPages(response.meta.totalPages);
  //         setTotal(response.meta.total);
  //       } else {
  //         // Estimate if no meta provided
  //         setTotal(pagesData.length);
  //         setTotalPages(1);
  //       }
  //     } else {
  //       throw new Error(response.message || 'Failed to fetch pages');
  //     }

  //   } catch (err: any) {
  //     console.error('Failed to fetch pages:', err);
  //     setError(err?.message || 'Failed to load pages');
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  // Fetch Single Page (for demonstration)
  // const fetchSinglePage = async (pageId: number) => {
  //   try {
  //     const response: ApiResponse = await apiFetch(`/customer/pages/${pageId}`, {
  //       userRole: 'customer',
  //       tenantId: user?.tenantId,
  //     });

  //     if (response.success && !Array.isArray(response.data)) {
  //       return response.data;
  //     }
  //   } catch (err) {
  //     console.error('Failed to fetch page:', err);
  //   }
  //   return null;
  // };

  // Effects
  // useEffect(() => {
  //   fetchPages();
  // }, [token, user?.tenantId]);

  // Search and filter effect
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     fetchPages(1, searchTerm, filterStatus, filterActive);
  //   }, 300);

  //   return () => clearTimeout(timeoutId);
  // }, [searchTerm, filterStatus, filterActive]);

  // Handlers
  // const handleRefresh = () => {
  //   setRefreshing(true);
  //   fetchPages(1, searchTerm, filterStatus, filterActive);
  // };

  // const handleLoadMore = () => {
  //   if (currentPage < totalPages) {
  //     fetchPages(currentPage + 1, searchTerm, filterStatus, filterActive);
  //   }
  // };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: 'all' | 'draft' | 'published' | 'archived') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleActiveFilterChange = (active: 'all' | 'active' | 'inactive') => {
    setFilterActive(active);
    setCurrentPage(1);
  };

  const getPreviewUrl = (page: CustomerPage) => {
    return `/preview/customer/${page.id}`;
  };

  const getEditUrl = (page: CustomerPage) => {
    return `/page-builder/edit/${page.id}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Filter functions
  const filteredPages = pages.filter(page => {
    const matchesSearch = searchTerm === '' || 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || page.status === filterStatus;
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' ? page.is_active === 1 : page.is_active === 0);

    return matchesSearch && matchesStatus && matchesActive;
  });

  // Loading State
  if (loading && pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-muted-foreground">Loading your custom pages...</p>
      </div>
    );
  }

  // Error State
  if (error && pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Failed to load pages</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button  variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Custom Pages</h1>
          <p className="text-muted-foreground">
            {total > 0 ? `${total} page${total !== 1 ? 's' : ''} found` : 'No pages yet'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
  
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
          
          <div className="border-l pl-2 ml-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages by title or slug..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusFilterChange('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusFilterChange('published')}
            >
              Published
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusFilterChange('draft')}
            >
              Drafts
            </Button>
            <Button
              variant={filterStatus === 'archived' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusFilterChange('archived')}
            >
              Archived
            </Button>
          </div>

          {/* Active Filter */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={filterActive === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleActiveFilterChange('all')}
            >
              All
            </Button>
            <Button
              variant={filterActive === 'active' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleActiveFilterChange('active')}
            >
              Active
            </Button>
            <Button
              variant={filterActive === 'inactive' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleActiveFilterChange('inactive')}
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>

      {/* Pages Grid/List */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Grid className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No pages found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== 'all' || filterActive !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by creating your first custom page'
            }
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Page
          </Button>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredPages.map((page) => (
              <Card 
                key={page.id} 
                className={`group hover:shadow-md transition-all duration-200 ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {page.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            /{page.slug}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          <Badge variant={getStatusColor(page.status)}>
                            {page.status}
                          </Badge>
                          {page.is_active === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Page Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Position: {page.position}</span>
                          <span>ID: {page.id}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {page.show_in_nav === 1 && (
                            <div className="flex items-center">
                              <Navigation className="mr-1 h-3 w-3" />
                              Nav
                            </div>
                          )}
                          {page.show_in_footer === 1 && (
                            <div className="flex items-center">
                              <Globe className="mr-1 h-3 w-3" />
                              Footer
                            </div>
                          )}
                          {page.parent && (
                            <div className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              Child
                            </div>
                          )}
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          Updated {formatDate(page.updated_at)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(getPreviewUrl(page), '_blank')}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.location.href = getEditUrl(page)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  // List View
                  <div className="flex-1 flex items-center">
                    <CardContent className="flex-1 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors truncate">
                              {page.title}
                            </CardTitle>
                            <div className="flex gap-1 shrink-0">
                              <Badge variant={getStatusColor(page.status)} className="text-xs">
                                {page.status}
                              </Badge>
                              {page.is_active === 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            /{page.slug}
                          </p>
                          
                          <div className="flex items-center gap-6 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              Updated {formatDate(page.updated_at)}
                            </div>
                            <span>Position: {page.position}</span>
                            <span>ID: {page.id}</span>
                            {page.show_in_nav === 1 && (
                              <div className="flex items-center">
                                <Navigation className="mr-1 h-3 w-3" />
                                In Nav
                              </div>
                            )}
                            {page.show_in_footer === 1 && (
                              <div className="flex items-center">
                                <Globe className="mr-1 h-3 w-3" />
                                In Footer
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 shrink-0 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(getPreviewUrl(page), '_blank')}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => window.location.href = getEditUrl(page)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="text-center pt-6">
              <Button 
                variant="outline" 
                // onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More Pages ({filteredPages.length} of {total})
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Error Toast */}
      {error && pages.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="text-white hover:bg-red-600"
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerPages;
