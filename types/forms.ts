export interface FormField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'tel' | 'number' | 'url' | 'date';
    required: boolean;
    placeholder?: string;
    options?: string[];
    order: number;
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  }
  
  export interface FormConfig {
    id: string;
    title: string;
    description?: string;
    form_config: FormField[];
    settings: FormSettings;
    created_at: string;
    updated_at: string;
  }
  
  export interface FormSettings {
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    description?: string;
    forgotPasswordLink?: boolean;
    registerLink?: boolean;
    rememberMeOption?: boolean;
  }
  