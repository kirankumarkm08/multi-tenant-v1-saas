// lib/api/server-client.ts
// This client is for server-side API calls that bypass SSL verification
import axios from 'axios';
import https from 'https';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://165.227.182.17/api';

// Create an HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Allow self-signed certificates
});

export const serverApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  httpsAgent: process.env.NODE_ENV === 'development' ? httpsAgent : undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors if needed
serverApiClient.interceptors.request.use(
  (config) => {
    // Add any server-side specific headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);