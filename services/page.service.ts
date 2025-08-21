// services/page.service.ts
import { apiFetch } from '@/lib/api-config';
import { CreatePageRequest, PageResponse } from '@/types/page';

export class PageService {
  static async getAllPages(): Promise<PageResponse[]> {
    const response = await apiFetch('/tenant/pages');
    return response.data || response;
  }

  static async getPage(id: string): Promise<PageResponse> {
    return await apiFetch(`/tenant/pages/${id}`);
  }

  static async createPage(data: CreatePageRequest): Promise<PageResponse> {
    return await apiFetch('/tenant/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  static async updatePage(id: string, data: Partial<CreatePageRequest>): Promise<PageResponse> {
    return await apiFetch(`/tenant/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  static async deletePage(id: string): Promise<void> {
    await apiFetch(`/tenant/pages/${id}`, { method: 'DELETE' });
  }
}
