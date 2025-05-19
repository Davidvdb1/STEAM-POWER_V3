//gameService.js

export async function gameService(groupId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/group/${groupId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed to load stats: HTTP ${res.status}`);
  }
  return res.json();
}