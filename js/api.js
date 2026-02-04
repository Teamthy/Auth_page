// api.js
// Responsibility: all HTTP communication with the backend

import { logout } from './auth.js';

const API_BASE_URL = '/api'; // change only if backend URL changes
const REQUEST_TIMEOUT = 15000; // 15s hard timeout

/* ----------------------------
   Core request helper
----------------------------- */

export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(API_BASE_URL + path, {
      ...options,
      headers,
      signal: controller.signal
    });

    // Handle auth expiration globally
    if (response.status === 401) {
      logout();
      redirectToLogin();
      throw new Error('Session expired. Please sign in again.');
    }

    let data = null;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(
        data?.message || 'An unexpected error occurred.'
      );
    }

    return data;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection.');
    }

    throw error;

  } finally {
    clearTimeout(timeoutId);
  }
}

/* ----------------------------
   Redirect helpers
----------------------------- */

function redirectToLogin() {
  window.location.replace('/index.html');
}
function redirectToDashboard() {
  window.location.replace('/dashboard.html');
}