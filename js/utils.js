// utils.js
// Responsibility: shared, framework-agnostic helper utilities

/* ----------------------------
   Token helpers
----------------------------- */

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

/* ----------------------------
   JWT helpers
----------------------------- */

export function decodeJWT(token) {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(decodedToken) {
  if (!decodedToken?.exp) return true;
  return Date.now() >= decodedToken.exp * 1000;
}

/* ----------------------------
   Auth guards
----------------------------- */

export function requireAuth() {
  const token = getToken();
  const decoded = decodeJWT(token);

  if (!token || !decoded || isTokenExpired(decoded)) {
    clearToken();
    redirectToLogin();
    return null;
  }

  return decoded;
}

export function redirectToLogin() {
  window.location.replace('/index.html');
}

export function redirectToDashboard() {
  window.location.replace('/dashboard.html');
}

/* ----------------------------
   Form & UI helpers
----------------------------- */

export function setButtonLoading(button, isLoading) {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = button.dataset.loadingText || 'Loading…';
  } else {
    button.disabled = false;
    button.textContent =
      button.dataset.originalText || button.textContent;
  }
}

export function showFormError(container, message) {
  if (!container) return;
  container.textContent = message;
}

export function clearFormError(container) {
  if (!container) return;
  container.textContent = '';
}

/* ----------------------------
   Validation helpers
----------------------------- */

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isEmpty(value) {
  return value === null || value === undefined || value === '';
}
/* ----------------------------
   Redirect helpers
----------------------------- */  

export function requireDashboardAAuth() {
  const decoded = requireAuth();
  if (!decoded) return false;
  return true;
}