import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
}

// Folders API
export const foldersAPI = {
  getAll: (params?: { parentFolder?: string; search?: string; favorite?: boolean }) =>
    api.get('/folders', { params }),
  
  getById: (id: string) =>
    api.get(`/folders/${id}`),
  
  create: (data: { name: string; description?: string; parentFolder?: string; color?: string }) =>
    api.post('/folders', data),
  
  update: (id: string, data: Partial<{ name: string; description: string; color: string; isFavorite: boolean }>) =>
    api.put(`/folders/${id}`, data),
  
  delete: (id: string, force?: boolean) =>
    api.delete(`/folders/${id}`, { params: { force } }),
  
  duplicate: (id: string) =>
    api.post(`/folders/${id}/duplicate`),
}

// Files API
export const filesAPI = {
  getAll: (params?: { 
    folder?: string; 
    type?: string; 
    search?: string; 
    favorite?: boolean; 
    limit?: number; 
    page?: number 
  }) =>
    api.get('/files', { params }),
  
  getById: (id: string) =>
    api.get(`/files/${id}`),
  
  upload: (formData: FormData) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: string, data: Partial<{ 
    name: string; 
    description: string; 
    tags: string; 
    isFavorite: boolean; 
    folder: string 
  }>) =>
    api.put(`/files/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/files/${id}`),
  
  download: (id: string) =>
    api.get(`/files/${id}/download`, { responseType: 'blob' }),
  
  duplicate: (id: string) =>
    api.post(`/files/${id}/duplicate`),
}

// Notes API
export const notesAPI = {
  getAll: (params?: { 
    folder?: string; 
    search?: string; 
    favorite?: boolean; 
    pinned?: boolean; 
    limit?: number; 
    page?: number 
  }) =>
    api.get('/notes', { params }),
  
  getById: (id: string) =>
    api.get(`/notes/${id}`),
  
  create: (data: { 
    title: string; 
    content: string; 
    folder?: string; 
    tags?: string; 
    color?: string; 
    isPinned?: boolean 
  }) =>
    api.post('/notes', data),
  
  update: (id: string, data: Partial<{ 
    title: string; 
    content: string; 
    tags: string; 
    color: string; 
    isFavorite: boolean; 
    isPinned: boolean; 
    folder: string 
  }>) =>
    api.put(`/notes/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/notes/${id}`),
  
  duplicate: (id: string) =>
    api.post(`/notes/${id}/duplicate`),
  
  search: (query: string, limit?: number) =>
    api.get(`/notes/search/${query}`, { params: { limit } }),
}

// Summary API
export const summaryAPI = {
  getSummary: () =>
    api.get('/summary'),
  
  getAnalytics: (period?: number) =>
    api.get('/summary/analytics', { params: { period } }),
}

export default api