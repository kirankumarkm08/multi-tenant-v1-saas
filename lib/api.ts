import { apiFetch } from "./api-config";

const TENANT_BASE = "/tenant";
const CUSTOMER_BASE = "/customer";

export const tenantApi = {
  login: (data: { email: string; password: string }) =>
    apiFetch(`${TENANT_BASE}/login`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch(`${TENANT_BASE}/logout`, {
      method: "POST",
    }),

  getPages: (token?: string) => apiFetch(`${TENANT_BASE}/pages`, { token }),
  getPageById: (id: number, token?: string) => apiFetch(`${TENANT_BASE}/pages/${id}`, { token }),
  getPageByType: (formType: string, token?: string) => apiFetch(`${TENANT_BASE}/pages/type/${formType}`, { token }),

  createPage: (data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updatePage: (id: number, data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deletePage: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages/${id}`, {
      method: "DELETE",
      token,
    }),

  getEvents: (token?: string) => apiFetch(`${TENANT_BASE}/event-edition`, { token }),
  getEventById: (id: number, token?: string) => apiFetch(`${TENANT_BASE}/event-edition/${id}`, { token }),

  createEvent: (data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateEvent: (id: number, data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteEvent: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition/${id}`, {
      method: "DELETE",
      token,
    }),

  getDashboard: (token?: string) => apiFetch(`${TENANT_BASE}/dashboard`, { token }),

  // Ticket Management
  getTickets: () => apiFetch(`${TENANT_BASE}/ticket`),
  getTicketById: (id: number, token?: string) => apiFetch(`${TENANT_BASE}/ticket/${id}`, { token }),
  
  createTicket: (data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/ticket`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateTicket: (id: number, data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/ticket/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deleteTicket: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/ticket/${id}`, {
      method: "DELETE",
      token,
    }),
};

export const customerApi = {
  getPages: (token?: string) => apiFetch(`${CUSTOMER_BASE}/pages`, { token }),
  getPageBySlug: (slug: string, token?: string) => apiFetch(`${CUSTOMER_BASE}/pages/${slug}`, { token }),
  getNavigationPages: (token?: string) => apiFetch(`${CUSTOMER_BASE}/pages/navigation`, { token }),
  getRegisterPage: (token?: string) => apiFetch(`${CUSTOMER_BASE}/pages/type/register`, { token }),
};
