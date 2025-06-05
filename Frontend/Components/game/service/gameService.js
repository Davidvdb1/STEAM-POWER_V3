// gameService.js

export async function fetchGameStatistics(groupId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/group/${groupId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load stats: HTTP ${res.status}`);
  }

  return res.json();
}

export async function getAllGameBuildingsByGroupId(groupId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/gameBuildings/getAllGameBuildingsByGroupId/${groupId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to load GameBuildings: HTTP ${res.status}`);
  }
  return res.json();
}

export async function getCurrencyById(currencyId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/${currencyId}/currency`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to get currency: HTTP ${res.status}`);
  }

  return res.json();
}

export async function addAsset(gameStatsId, assetData, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/${gameStatsId}/assets`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(assetData),
  });

  if (res.status !== 201) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to add asset: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }

  return res.json();
}

export async function removeAsset(assetId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/assets/${assetId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to remove asset: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }

  return res.json();
}

export async function updateCurrency(groupId, currencyData, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/${groupId}/currency`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(currencyData),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to remove asset: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }

  return res.json();
}

export async function upgradeBuilding(GameBuildingId, upgradeData, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/buildings/${GameBuildingId}/upgrade`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(upgradeData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to upgrade GameBuilding: HTTP ${res.status}` +
        (err.error ? ` - ${err.error}` : "")
    );
  }
  return res.json();
}

export async function recordCheckpoint(gameStatsId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/${gameStatsId}/checkpoints`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to record checkpoint: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }
  return res.json();
}

export async function refactorGameStatistics(checkpointId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/refactor/${checkpointId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to refactor game statistics: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }
  return res.json();
}

export async function getCheckpointsByGameStatisticsId(gameStatsId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/${gameStatsId}/checkpoints`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch checkpoints: HTTP ${res.status}`);
  }

  return res.json();
}

export async function toggleGameBuildingRunsOnGreen(GameBuildingId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/buildings/${GameBuildingId}/green`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to switch energy type: HTTP ${res.status}` +
        (err.error ? ` - ${err.error}` : "")
    );
  }
  return res.json();
}

export async function createGameStatistics(groupId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      groupId,
      currency: {
        greenEnergy: 150,
        greyEnergy: 75,
        coins: 500,
        score: 25,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create GameStatistics: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }

  return res.json();
}

export async function createGameBuildings(gameStatsId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/gameBuildings/${gameStatsId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create game buildings: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }
  return res.json();
}

/**
 * PUT /gameStatistics/:gameStatisticsId/buildings/green/reset
 * Resets runsOnGreen = false on all buildings under this GameStatistics.
 *
 * @param {string} gameStatisticsId – the ID of the GameStatistics whose buildings you want to reset
 * @param {string} token            – bearer token for authorization
 * @returns {Promise<GameBuildings[]>} the updated array of GameBuilding objects
 */
export async function toggleAllBuildingsRunsOnGreenFalse(
  gameStatisticsId,
  token
) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/${gameStatisticsId}/buildings/green/reset`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to reset runsOnGreen on all buildings: HTTP ${res.status}` +
        (errBody.error ? ` - ${errBody.error}` : "")
    );
  }

/**
 * Retrieves a list of all achievements and their completion status for a specific group.
 *
 * @async
 * @function getAchievementsOverviewByGroupId
 * @memberof gameService
 * @param {string} groupId - The id of the group.
 * @param {string} token - The authentication token for the request.
 * @returns {Promise<Object[]>} The achievements overview data as a JSON object.
 * @throws {Error} If the HTTP request fails or returns a non-OK status.
 */
export async function getAchievementsOverviewByGroupId(groupId, token) {
  const url = `${window.env.BACKEND_URL}/gameStatistics/achievements/overview/${groupId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch achievements overview: HTTP ${res.status}`);
  }

  return res.json();
}
