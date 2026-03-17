import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: data => api.post('/auth/register', data),
  login:    data => api.post('/auth/login',    data),
  me:       ()   => api.get('/auth/me'),
}

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentAPI = {
  upload: file => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list:    ()   => api.get('/documents/'),
  getById: id   => api.get(`/documents/${id}`),
  delete:  id   => api.delete(`/documents/${id}`),
}

// ── Graphs ────────────────────────────────────────────────────────────────────
export const graphAPI = {
  generate: (document_id, graph_type = 'word') =>
    api.post('/graphs/generate', { document_id, graph_type }),
  get: document_id => api.get(`/graphs/${document_id}`),
}

// ── Plagiarism ────────────────────────────────────────────────────────────────
export const plagiarismAPI = {
  compare: (document_a_id, document_b_id, algorithm = 'node_overlap') =>
    api.post('/plagiarism/compare', { document_a_id, document_b_id, algorithm }),
  report:     comparison_id => api.get(`/plagiarism/report/${comparison_id}`),
  history:    ()            => api.get('/plagiarism/history'),
  algorithms: ()            => api.get('/plagiarism/algorithms'),
}

export default api
