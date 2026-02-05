const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3001').replace(/\/$/, '');

const buildUrl = (path) => `${API_BASE}${path}`;

const request = async (path, options = {}) => {
  const hasBody = options.body !== undefined;
  const response = await fetch(buildUrl(path), {
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    },
    ...options,
    body: hasBody ? JSON.stringify(options.body) : undefined
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.details = payload?.details;
    throw error;
  }

  return payload;
};

export const getEmployees = () => request('/api/employees');
export const createEmployee = (data) => request('/api/employees', { method: 'POST', body: data });
export const deleteEmployee = (employeeId) =>
  request(`/api/employees/${encodeURIComponent(employeeId)}`, { method: 'DELETE' });

export const getAttendance = (employeeId, date) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return request(`/api/employees/${encodeURIComponent(employeeId)}/attendance${query}`);
};

export const createAttendance = (employeeId, data) =>
  request(`/api/employees/${encodeURIComponent(employeeId)}/attendance`, {
    method: 'POST',
    body: data
  });

export const getSummary = () => request('/api/summary');
