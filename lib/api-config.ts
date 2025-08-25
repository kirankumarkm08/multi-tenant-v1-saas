export async function apiFetch(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://165.227.182.17/api';
  
  // Use direct API URL
  const url = endpoint.startsWith("/") 
    ? `${API_URL}${endpoint}` 
    : `${API_URL}/${endpoint}`;

  // Token priority: explicit token > localStorage token > no token
  const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const token = options.token ?? tokenFromStorage;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || response.statusText);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}
