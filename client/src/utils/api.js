import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// Jobs API
export const getAllJobs = (params) => api.get('/jobs', { params });
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const getRecruiterJobs = () => api.get('/jobs/recruiter');
export const createJob = (jobData) => api.post('/jobs', jobData);
export const updateJob = (id, jobData) => api.put(`/jobs/${id}`, jobData);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

// Applications API
export const applyForJob = async (jobId, coverLetter) => {
  try {
    console.log('Applying for job:', { jobId, coverLetter });
    const response = await api.post('/applications', { jobId, coverLetter });
    console.log('Application response:', response.data);
    return response;
  } catch (error) {
    console.error('Application error:', error.response?.data);
    throw error;
  }
};
export const getJobApplications = (jobId) => api.get(`/applications/job/${jobId}`);
export const getSeekerApplications = async () => {
  try {
    const response = await api.get('/applications/seeker');
    console.log('Seeker applications response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching seeker applications:', error);
    throw error;
  }
};
export const updateApplicationStatus = async (applicationId, data) => {
  console.log('Sending API request:', { applicationId, data }); // Debug log
  try {
    const response = await api.put(`/applications/${applicationId}`, data);
    return response;
  } catch (error) {
    console.error('API Error:', error.response?.data);
    throw error;
  }
};
export const getApplicationById = (applicationId) => api.get(`/applications/${applicationId}`);

export default api; 