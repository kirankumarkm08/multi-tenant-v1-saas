// import { apiClient } from '../api/client';
// // import { CustomerPage, Navigation } from '@/types/customer';

// export class CustomerService {
//   static async getPages(): Promise<CustomerPage[]> {
//     try {
//       const response = await apiClient.get<CustomerPage[] | { data: CustomerPage[] }>('/customer/pages');
//       return Array.isArray(response) ? response : response.data || [];
//     } catch (error) {
//       console.error('Error fetching customer pages:', error);
//       return [];
//     }
//   }

//   static async getPageByType(type: string): Promise<CustomerPage | null> {
//     try {
//       const response = await apiClient.get<CustomerPage | { data: CustomerPage }>(`/customer/pages/type/${type}`);
//       return this.normalizeSinglePageResponse(response);
//     } catch (error) {
//       console.error(`Error fetching page by type ${type}:`, error);
//       return null;
//     }
//   }

//   static async getUpdatedHomePage(): Promise<any> {
//     try {
//       const response = await apiClient.get<any>('/customer/pages/home-updated');
//       return this.normalizeSinglePageResponse(response);
//     } catch (error) {
//       console.error('Error fetching updated home page:', error);
//       return null;
//     }
//   }

//   static async getNavigation(): Promise<Navigation | null> {
//     try {
//       const response = await apiClient.get<Navigation | { data: Navigation }>('/customer/pages/navigation');
//       const navigation = this.normalizeSinglePageResponse(response) as Navigation;
      
//       if (navigation && navigation.items) {
//         navigation.items = this.buildNavigationTree(navigation.items);
//       }
      
//       return navigation;
//     } catch (error) {
//       console.error('Error fetching navigation:', error);
//       return null;
//     }
//   }

//   static async getFormBySlug(slug: string): Promise<any> {
//     try {
//       const response = await apiClient.get<any>(`/customer/form/${slug}`);
//       return this.parseFormConfig(response);
//     } catch (error) {
//       console.error(`Error fetching form with slug ${slug}:`, error);
//       return null;
//     }
//   }

//   static async submitFormBySlug(slug: string, data: Record<string, any>): Promise<void> {
//     return apiClient.post(`/customer/form/${slug}`, data);
//   }

//   private static normalizeSinglePageResponse(response: any): any {
//     if (!response) return null;
//     if (response.data) {
//       return Array.isArray(response.data) ? response.data[0] : response.data;
//     }
//     return Array.isArray(response) ? response : response;
//   }

//   private static parseFormConfig(formData: any): any {
//     if (!formData) return null;

//     try {
//       const parsedFormConfig = typeof formData.form_config === 'string' 
//         ? JSON.parse(formData.form_config)
//         : formData.form_config;

//       const parsedSettings = typeof formData.settings === 'string'
//         ? JSON.parse(formData.settings)
//         : formData.settings;

//       return {
//         ...formData,
//         form_config: Array.isArray(parsedFormConfig) ? parsedFormConfig : [],
//         settings: parsedSettings || {}
//       };
//     } catch (error) {
//       console.error('Failed to parse form config:', error);
//       return null;
//     }
//   }

//   private static buildNavigationTree(items: any[]): any[] {
//     const itemsMap = new Map();
//     const tree: any[] = [];

//     items.forEach(item => {
//       itemsMap.set(item.id, { ...item, children: [] });
//     });

//     items.forEach(item => {
//       const mappedItem = itemsMap.get(item.id);
      
//       if (item.parent_id && itemsMap.has(item.parent_id)) {
//         itemsMap.get(item.parent_id).children.push(mappedItem);
//       } else {
//         tree.push(mappedItem);
//       }
//     });

//     return tree.sort((a, b) => (a.order || 0) - (b.order || 0));
//   }
// }
