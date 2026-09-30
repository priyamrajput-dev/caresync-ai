const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('caresync_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = res.headers.get('content-type') || '';
    
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }

    if (!res.ok) {
      const errorMessage = data?.error?.message || data?.message || data?.detail || `HTTP Error ${res.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (err) {
    console.error(`API request error [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}
