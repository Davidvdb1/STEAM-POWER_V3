/**
 * @module gameService
 * @description
 *   Service layer for all game-related API calls: statistics, buildings, currency,
 *   assets, checkpoints, and achievements.
 */

export async function fetchGameStatistics(groupId, token) {
  /**
   * Fetch game statistics for a given group.
   *
   * @async
   * @function fetchGameStatistics
   * @memberof module:gameService
   * @param {string} groupId - The ID of the group to fetch stats for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object|null>} The game statistics object or `null` if not found.
   * @throws {Error} When the HTTP request fails or returns a non-OK (except 404) status.
   */
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
  /**
   * Fetch all game buildings for a given group ID.
   * @async
   * @function getAllGameBuildingsByGroupId
   * @memberof module:gameService
   * @param {string} groupId - The ID of the group to fetch buildings for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object[]>} An array of GameBuilding objects.
   * @throws {Error} If the HTTP request fails or returns a non-OK status.
   * */
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
  /**
   * Fetch currency data by its ID.
   * @async
   * @function getCurrencyById
   * @memberof module:gameService
   * @param {string} currencyId - The ID of the currency to fetch.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The currency data object.
   * @throws {Error} If the HTTP request fails or returns a non-OK status.
   */
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
  /**
   * Add a new asset to the game statistics.
   * @async
   * @function addAsset
   * @memberof module:gameService
   * @param {string} gameStatsId - The ID of the game statistics to add the asset to.
   * @param {Object} assetData - The asset data to add.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The created asset object.
   * @throws {Error} If the HTTP request fails or returns a non-201 status.
   * */
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
  /**
   * Remove an asset by its ID.
   * @async
   * @function removeAsset
   * @memberof module:gameService
   * @param {string} assetId - The ID of the asset to remove.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The response object from the server.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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

export async function updateCurrency(currencyId, currencyData, token) {
  /**
   * Update currency data by its ID.
   * @async
   * @function updateCurrency
   * @memberof module:gameService
   * @param {string} currencyId - The ID of the currency to update.
   * @param {Object} currencyData - The new currency data to set.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The updated currency object.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
  const url = `${window.env.BACKEND_URL}/gameStatistics/${currencyId}/currency`;
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
  /**
   * Upgrade a game building by its ID.
   * @async
   * @function upgradeBuilding
   * @memberof module:gameService
   * @param {string} GameBuildingId - The ID of the game building to upgrade.
   * @param {Object} upgradeData - The data for the upgrade.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The updated game building object.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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
  /**
   * Record a checkpoint for game statistics.
   * @async
   * @function recordCheckpoint
   * @memberof module:gameService
   * @param {string} gameStatsId - The ID of the game statistics to record the checkpoint for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The created checkpoint object.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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
  /**
   * Refactor game statistics to a specific checkpoint.
   * @async
   * @function refactorGameStatistics
   * @memberof module:gameService
   * @param {string} checkpointId - The ID of the checkpoint to refactor to.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The updated game statistics object.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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
  /**
   * Fetch checkpoints for a specific game statistics ID.
   * @async
   * @function getCheckpointsByGameStatisticsId
   * @memberof module:gameService
   * @param {string} gameStatsId - The ID of the game statistics to fetch checkpoints for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object[]>} An array of checkpoint objects.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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
  /**
   * Toggle the `runsOnGreen` property of a game building.
   * @async
   * @function toggleGameBuildingRunsOnGreen
   * @memberof module:gameService
   * @param {string} GameBuildingId - The ID of the game building to toggle.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The updated game building object.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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
  /**
   * Create a new GameStatistics entry for a specific group.
   * @async
   * @function createGameStatistics
   * @memberof module:gameService
   * @param {string} groupId - The ID of the group to create statistics for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The created GameStatistics object.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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
      multiplier: {
        solar: 1.0,
        wind: 1.0,
        water: 1.0,
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

export async function deleteGameStatistics(gameStatsId, token) {
  /**
   * Delete a GameStatistics entry by its ID.
   * @async
   * @function deleteGameStatistics
   * @memberof module:gameService
   * @param {string} gameStatsId - The ID of the GameStatistics to delete.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The response object from the server.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
  const url = `${window.env.BACKEND_URL}/gameStatistics/${gameStatsId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to delete GameStatistics: HTTP ${res.status}` +
        (errorBody.error ? ` - ${errorBody.error}` : "")
    );
  }
  return res.json();
}

export async function createGameBuildings(gameStatsId, token) {
  /**
   * Create initial game buildings for a specific GameStatistics ID.
   * @async
   * @function createGameBuildings
   * @memberof module:gameService
   * @param {string} gameStatsId - The ID of the GameStatistics to create buildings for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object[]>} An array of created GameBuilding objects.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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

export async function toggleAllBuildingsRunsOnGreenFalse(
  gameStatisticsId,
  token
) {
  /**
   * Reset the `runsOnGreen` property for all buildings in a GameStatistics entry.
   * @async
   * @function toggleAllBuildingsRunsOnGreenFalse
   * @memberof module:gameService
   * @param {string} gameStatisticsId - The ID of the GameStatistics to reset buildings for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The response object from the server.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   * */
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
  return res.json();
}

export async function getAchievementsOverviewByGroupId(groupId, token) {
  /**
   * Fetch achievements overview for a specific group ID.
   * @async
   * @function getAchievementsOverviewByGroupId
   * @memberof module:gameService
   * @param {string} groupId - The ID of the group to fetch achievements for.
   * @param {string} token - Bearer token for authorization.
   * @returns {Promise<Object>} The achievements overview object.
   * @throws {Error} If the HTTP request fails or returns a non-200 status.
   */
  const url = `${window.env.BACKEND_URL}/gameStatistics/achievements/overview/${groupId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch achievements overview: HTTP ${res.status}`
    );
  }

  return res.json();
}
