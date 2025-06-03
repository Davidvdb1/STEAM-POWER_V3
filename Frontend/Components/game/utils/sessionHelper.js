// components/utils/sessionHelpers.js
export function getAuthFromSession() {
  const raw = sessionStorage.getItem("loggedInUser");
  if (!raw) throw new Error("Not logged in");
  return JSON.parse(raw);
}
