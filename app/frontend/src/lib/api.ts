const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.lostinvirtual.com';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  
  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, data: unknown) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path: string, data: unknown) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path: string, data: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};
