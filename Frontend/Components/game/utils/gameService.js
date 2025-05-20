// gameService.js

export async function fetchGameStatistics(groupId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/group/${groupId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load stats: HTTP ${res.status}`);
  }

  return res.json();
}

export async function addAsset(gameStatsId, assetData, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/${gameStatsId}/assets`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(assetData)
  });

  if (res.status !== 201) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(`Failed to add asset: HTTP ${res.status}` + (errorBody.error ? ` - ${errorBody.error}` : ''));
  }

  return res.json();
}

export async function removeAsset(assetId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/assets/${assetId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(`Failed to remove asset: HTTP ${res.status}` + (errorBody.error ? ` - ${errorBody.error}` : ''));
  }

  return res.json();
}
