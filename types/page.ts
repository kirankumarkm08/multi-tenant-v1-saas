// types/page.ts
export interface PageModule {
    id: string;
    type: string;
    title: string;
    content: any;
    order: number;
    layout: "full" | "container" | "narrow";
  }
  
  export interface PageSettings {
    headerStyle: "default" | "minimal" | "centered";
    footerStyle: "default" | "minimal" | "none";
    backgroundColor: string;
    textColor: string;
  }
  
  export interface CustomPage {
    id: string;
    title: string;
    slug: string;
    description: string;
    modules: PageModule[];
    settings: PageSettings;
    status: 'draft' | 'published';
  }
  
  // types/module.ts
  export interface ModuleField {
    key: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'image' | 'url';
    label: string;
    placeholder?: string;
    required?: boolean;
    default_value?: any;
    options?: { value: string; label: string }[];
  }
  
  export interface DynamicModuleConfig {
    id: string;
    type: string;
    name: string;
    description: string;
    category: 'content' | 'layout' | 'media' | 'interactive';
    icon: string;
    fields: ModuleField[];
    defaultContent: Record<string, any>;
  }
  
  // types/api.ts
  export interface CreatePageRequest {
    title: string;
    slug: string;
    description?: string;
    form_type: 'custom' | 'event' | 'landing';
    modules?: string;
    settings?: string;
    status?: 'draft' | 'published';
  }
  
  export interface PageResponse {
    id: number;
    title: string;
    slug: string;
    description: string;
    modules: string | PageModule[];
    settings: string | PageSettings;
    status: string;
    created_at: string;
    updated_at: string;
  }
  