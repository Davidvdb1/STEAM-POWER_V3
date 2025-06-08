/**
 * Utility functions to manage user session in the browser's sessionStorage.
 * These functions allow you to set, get, and clear the logged-in user session.
 * @module sessionHelper
 * @description Provides functions to manage user authentication state in the session storage.
 */

/**
 * Gets the currently logged-in user from session storage.
 */
export function getAuthFromSession() {
  const raw = sessionStorage.getItem("loggedInUser");
  if (!raw) throw new Error("Not logged in");
  return JSON.parse(raw);
}
