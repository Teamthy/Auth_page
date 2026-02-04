// auth.js
// Responsibility: authentication lifecycle only (login, register, logout)

import { apiRequest } from './api.js';

/* ----------------------------
   Token utilities
----------------------------- */

const TOKEN_KEY = 'token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

/* ----------------------------
   Redirect helpers
----------------------------- */

function redirectToDashboard() {
  window.location.replace('/dashboard.html');
}

function redirectToLogin() {
  window.location.replace('/index.html');
}

/* ----------------------------
   UI helpers
----------------------------- */

function setButtonLoading(button, isLoading) {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = button.dataset.loadingText || 'Loading…';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function showError(container, message) {
  if (!container) return;
  container.textContent = message;
}

function clearError(container) {
  if (!container) return;
  container.textContent = '';
}

/* ----------------------------
   Validation
----------------------------- */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ----------------------------
   Login
----------------------------- */

async function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;

  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById('formError');

  clearError(errorEl);

  if (!email || !password) {
    showError(errorEl, 'Email and password are required.');
    return;
  }

  if (!isValidEmail(email)) {
    showError(errorEl, 'Enter a valid email address.');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!response?.token) {
      throw new Error('Invalid authentication response.');
    }

    setToken(response.token);
    redirectToDashboard();

  } catch (err) {
    showError(errorEl, err.message || 'Login failed.');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/* ----------------------------
   Register
----------------------------- */

async function handleRegister(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = document.getElementById('formError');

  clearError(errorEl);

  if (!name || !email || !password || !confirmPassword) {
    showError(errorEl, 'All fields are required.');
    return;
  }

  if (!isValidEmail(email)) {
    showError(errorEl, 'Enter a valid email address.');
    return;
  }

  if (password.length < 8) {
    showError(errorEl, 'Password must be at least 8 characters.');
    return;
  }

  if (password !== confirmPassword) {
    showError(errorEl, 'Passwords do not match.');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    if (!response?.token) {
      throw new Error('Registration failed.');
    }

    setToken(response.token);
    redirectToDashboard();

  } catch (err) {
    showError(errorEl, err.message || 'Registration failed.');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

/* ----------------------------
   Logout
----------------------------- */

export function logout() {
  clearToken();
}

/* ----------------------------
   Bootstrap (page-aware)
----------------------------- */

(function initAuth() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Prevent logged-in users from seeing auth pages
  if (isAuthenticated() && (loginForm || registerForm)) {
    redirectToDashboard();
    return;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
})();
