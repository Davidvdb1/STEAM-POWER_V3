const express = require("express");
const gameStatisticsService = require("../service/gameStatisticsService");
const GameStatistics = require("../model/gameStatistics");

const router = express.Router();

//########################################################################
//                            GAME STATISTICS
//########################################################################

/**
 * Creates a new game statistics entry.
 *
 * @typedef {Object} GameStatistics
 * @property {string} groupId - The unique identifier for the group.
 * @property {number} greenEnergy - The amount of green energy accumulated.
 * @property {number} greyEnergy - The amount of grey energy accumulated.
 * @property {number} coins - The number of coins earned.
 * @returns {GameStatistics} The created GameStatistics object in the response body.
 */
router.post("/", async (req, res) => {
  try {
    const { groupId, greenEnergy, greyEnergy, coins } = req.body;
    const gs = await gameStatisticsService.create({
      groupId,
      greenEnergy,
      greyEnergy,
      coins,
    });
    res.status(201).json(gs);
  } catch (error) {
    console.error("Error creating game statistics:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /gameStatistics
 * Retrieves all game statistics entries.
 *
 * @returns {Array<GameStatistics>}
 */
router.get("/", async (req, res) => {
  try {
    const gameStatistics = await gameStatisticsService.getAllGameStatistics();
    res.status(200).json(gameStatistics);
  } catch (error) {
    console.error("✖ [gameStatistics] ERROR in GET / →", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /gameStatistics/:id
 * Retrieves a game statistics entry by its ID.
 * @param {string} id - The unique identifier of the game statistics entry.
 * @return {GameStatistics} The game statistics object.
 */
router.get("/:id", async (req, res) => {
  try {
    const gs = await gameStatisticsService.getById(req.params.id);
    if (!gs) {
      return res.status(404).json({ error: "GameStatistics not found" });
    }
    res.status(200).json(gs);
  } catch (error) {
    console.error(`Error fetching GameStatistics ${req.params.id}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /gameStatistics/group/:groupId
 * Retrieves game statistics by group ID.
 * @param {string} groupId - The unique identifier of the group.
 * @return {GameStatistics} The game statistics object for the specified group.
 */
router.get("/group/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const gs = await gameStatisticsService.getByGroupId(groupId);
    if (!gs) {
      console.error(`→ [gameStatistics] no stats found for group ${groupId}`);
      return res
        .status(404)
        .json({ error: "GameStatistics for group not found" });
    }
    res.status(200).json(gs);
  } catch (error) {
    console.error("✖ [gameStatistics] ERROR in GET /group/:groupId →", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

//########################################################################
//                                CURRENCY
//########################################################################
/**
 * GET /gameStatistics/:id/currency
 * Retrieves the Currency object associated with a GameStatistics entry.
 * @param {string} id - The unique identifier of the GameStatistics entry.
 * @return {Currency} The Currency object associated with the GameStatistics entry.
 */
router.get("/:id/currency", async (req, res) => {
  try {
    const currency = await gameStatisticsService.getCurrencyById(req.params.id);
    if (!currency) {
      return res.status(404).json({ error: "Currency not found" });
    }
    res.status(200).json(currency);
  } catch (error) {
    console.error(
      `Error fetching currency for GameStatistics ${req.params.id}:`,
      error
    );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * PUT /gameStatistics/:id/currency
 * Updates the Currency object associated with a GameStatistics entry.
 * @param {string} id - The unique identifier of the GameStatistics entry.
 * @param {Object} body - The new currency values to update.
 * @param {number} body.greenEnergy - The new green energy value.
 * @param {number} body.greyEnergy - The new grey energy value.
 * @param {number} body.coins - The new coins value.
 * @param {number} body.score - The new score value.
 * @return {Currency} The updated Currency object.
 */
router.put("/:id/currency", async (req, res) => {
  console.log("updateCurrency payload:", req.body);
  try {
    const updated = await gameStatisticsService.updateCurrency(
      req.params.id,
      req.body
    );
    res.json(updated);
  } catch (error) {
    console.error(`Error updating currency ${req.params.id}:`, error);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

/**
 * POST /gameStatistics/:id/currency/increment
 * Increments the Currency object associated with a GameStatistics entry.
 * @param {string} id - The unique identifier of the GameStatistics entry.
 * @param {Object} body - The currency values to increment.
 * @param {number} body.greenEnergy - The amount of green energy to increment.
 * @param {number} body.greyEnergy - The amount of grey energy to increment.
 * @param {number} body.coins - The amount of coins to increment.
 * @param {number} body.score - The amount of score to increment.
 * @return {Currency} The updated Currency object after incrementing.
 */
router.post("/:id/currency/increment", async (req, res) => {
  try {
    const updated = await gameStatisticsService.incrementCurrency(
      req.params.id,
      req.body
    );
    res.json(updated);
  } catch (error) {
    console.error(`Error incrementing currency ${req.params.id}:`, error);
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

//########################################################################
//                                 ASSETS
//########################################################################

/**
 * POST /gameStatistics/:id/assets
 * Adds an asset to a GameStatistics object.
 *
 * @param {string} id - The unique identifier of the GameStatistics object (URL parameter).
 * @param {Object} body - The asset data to add (request body).
 * @param {number} body.buildCost - The cost to build the asset.
 * @param {number} body.destroyCost - The cost to destroy the asset.
 * @param {number} body.energy - The energy produced by the asset.
 * @param {number} body.xLocation - The x-coordinate location of the asset.
 * @param {number} body.yLocation - The y-coordinate location of the asset.
 * @param {number} body.xSize - The width of the asset.
 * @param {number} body.ySize - The height of the asset.
 * @param {string} body.type - The type of the asset.
 * @param {string} body.gameStatisticsId - The id for the game statistics to which the asset belongs.
 * @returns {Asset} The created asset object in the response body.
 */
router.post("/:id/assets", async (req, res) => {
  console.log(req.body, req.params.id);
  try {
    const asset = await gameStatisticsService.addAsset(req.params.id, req.body);
    res.status(201).json(asset);
  } catch (error) {
    console.error(
      `Error adding asset to GameStatistics ${req.params.id}:`,
      error
    );
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /gameStatistics/assets/:assetId
 * Removes an asset from a GameStatistics object.
 * @param {string} assetId - The unique identifier of the asset to remove (URL parameter).
 * @returns {{ message: string }} A message indicating the asset has been removed.
 */
router.delete("/assets/:assetId", async (req, res) => {
  try {
    await gameStatisticsService.removeAsset(req.params.assetId);
    res.status(200).json({ message: "Asset removed" });
  } catch (error) {
    console.error(`Error removing asset ${req.params.assetId}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

//########################################################################
//                              CHECKPOINTS
//########################################################################
/**
 * POST /gameStatistics/:id/checkpoints
 * Creates a checkpoint for a GameStatistics object.
 *
 * @param {string} id - The unique identifier of the GameStatistics object (URL parameter).
 * @returns {Checkpoint} The created checkpoint object in the response body.
 */
router.post("/:id/checkpoints", async (req, res) => {
  try {
    const cp = await gameStatisticsService.recordCheckpoint(req.params.id);
    res.status(201).json(cp);
  } catch (error) {
    console.error(
      `Error recording checkpoint for GameStatistics ${req.params.id}:`,
      error
    );
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /gameStatistics/:id/checkpoints
 * Fetches all checkpoints for a GameStatistics object.
 *
 * @param {string} id - The unique identifier of the GameStatistics object (URL parameter).
 * @returns {Checkpoint[]} An array of checkpoint objects in the response body.
 */
router.get("/:id/checkpoints", async (req, res) => {
  console.log(`→ HIT GET /gameStatistics/${req.params.id}/checkpoints`);
  try {
    const checkpoints =
      await gameStatisticsService.findAllCheckpointsByGameStatisticsId(
        req.params.id
      );
    console.log(`   → Service returned ${checkpoints.length} checkpoint(s)`);
    return res.status(200).json(checkpoints);
  } catch (error) {
    console.error(`   ✖ Error in GET checkpoints for ${req.params.id}:`, error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /gameStatistics/checkpoints/:checkpointId
 * Removes a checkpoint from a GameStatistics object.
 *
 * @param {string} checkpointId - The unique identifier of the checkpoint to remove (URL parameter).
 * @returns {{ message: string }} A message indicating the checkpoint has been removed.
 */
router.delete("/checkpoints/:checkpointId", async (req, res) => {
  try {
    await gameStatisticsService.removeCheckpoint(req.params.checkpointId);
    res.status(200).json({ message: "Checkpoint removed" });
  } catch (error) {
    console.error(
      `Error removing checkpoint ${req.params.checkpointId}:`,
      error
    );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * PUT /gameStatistics/refactor/:checkpointId
 * Restores the GameStatistics object to the state of a specific checkpoint and returns the updated data.
 *
 * @param {string} checkpointId - The unique identifier of the checkpoint to restore (URL parameter).
 * @returns {{ gameStatistics: GameStatistics, assets: Asset[], gameBuildings: GameBuildings[] }}
 * An object containing the updated GameStatistics, its assets, and gameBuildings.
 */
router.put("/refactor/:checkpointId", async (req, res) => {
  const { checkpointId } = req.params;
  console.log(
    "→ [gameStatistics] refactoring game statistics for checkpointId:",
    checkpointId
  );

  try {
    // 1) restore the GameStatistics record to that checkpoint
    const gs = await gameStatisticsService.refactorGameStatistics({
      checkpointId,
    });

    // 2) fetch the assets now attached to that GameStatistics
    const assets = await gameStatisticsService.findAllAssetsByGameStatisticsId(
      gs.id
    );

    // 3) grab the gameBuildings right off the updated GameStatistics
    const gameBuildings = gs.gameBuildings;

    // 4) respond with gameStatistics, assets and gameBuildings
    res.status(200).json({
      gameStatistics: gs,
      assets,
      gameBuildings,
    });
  } catch (error) {
    console.error(
      "✖ [gameStatistics] ERROR in PUT /refactor/:checkpointId →",
      error
    );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

//########################################################################
//                             GAME BUILDINGS
//########################################################################
/**
 * PUT /gameStatistics/buildings/:gameBuildingId/upgrade
 * Upgrades a GameBuilding object to a new level.
 *
 * @param {string} gameBuildingId - The unique identifier of the GameBuilding to upgrade (URL parameter).
 * @param {Object} body - The upgrade data (request body).
 * @param {number} body.level - The new level to upgrade the building to.
 * @returns {GameBuildings} The updated GameBuilding object in the response body.
 */
router.put("/buildings/:gameBuildingId/upgrade", async (req, res) => {
  try {
    const building = await gameStatisticsService.upgradeGameBuilding(
      req.params.gameBuildingId,
      req.body
    );
    res.status(200).json(building);
  } catch (error) {
    console.error(
      `Error upgrading gameBuilding ${req.params.gameBuildingId}:`,
      error
    );
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /gameStatistics/gameBuildings/getAllGameBuildingsByGroupId/:groupId
 * Retrieves all GameBuildings associated with a specific groupId.
 *
 * @param {string} groupId - The unique identifier of the group (URL parameter).
 * @returns {GameBuildings[]} An array of GameBuildings objects in the response body.
 */
router.get(
  "/gameBuildings/getAllGameBuildingsByGroupId/:groupId",
  async (req, res) => {
    try {
      const buildings =
        await gameStatisticsService.getAllGameBuildingsByGroupId(
          req.params.groupId
        );
      res.status(200).json(buildings);
    } catch (error) {
      console.error(
        `Error fetching buildings for group ${req.params.groupId}:`,
        error
      );
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
);

//########################################################################
//                              ACHIEVEMENTS
//########################################################################
/**
 * POST /gameStatistics/achievements/add/:gameStatisticsId/:title
 * Adds an achievement to a GameStatistics object.
 *
 * @param {string} gameStatisticsId - The unique identifier of the GameStatistics object (URL parameter).
 * @param {string} title - The title of the achievement to add (URL parameter).
 * @returns {GameStatistics} The updated GameStatistics object in the response body.
 */
router.post("/achievements/add/:gameStatisticsId/:title", async (req, res) => {
  try {
    const { gameStatisticsId, title } = req.params;
    const gameStatistics =
      await gameStatisticsService.addAchievementToGameStatistics(
        gameStatisticsId,
        title
      );
    res.status(200).json(gameStatistics);
  } catch (error) {
    console.error(
      `Error adding achievement ${req.params.title} to GameStatistics ${req.params.gameStatisticsId}:`,
      error
    );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /gameStatistics/:gameStatisticsId/achievements
 * Retrieves all Achievements for a GameStatistics object.
 *
 * @param {string} gameStatisticsId - The unique identifier of the GameStatistics object (URL parameter).
 * @returns {Achievement[]} An array of Achievement objects in the response body.
 */
router.get("/:gameStatisticsId/achievements", async (req, res) => {
  try {
    const achievements =
      await gameStatisticsService.getGameStatisticsAchievements(
        req.params.gameStatisticsId
      );
    res.status(200).json(achievements);
  } catch (error) {
    console.error(
      `Error fetching achievements for GameStatistics ${req.params.gameStatisticsId}:`,
      error
    );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /gameStatistics/:gameStatisticsId/achievements/check/:title
 * Checks if an achievement has been achieved for a GameStatistics object.
 *
 * @param {string} gameStatisticsId - The unique identifier of the GameStatistics object (URL parameter).
 * @param {string} title - The title of the achievement to check (URL parameter).
 * @returns {{ achieved: boolean }} An object indicating whether the achievement has been achieved.
 */
router.get("/:gameStatisticsId/achievements/check/:title", async (req, res) => {
  try {
    const { gameStatisticsId, title } = req.params;
    const gameStatistics = await gameStatisticsService.getById(
      gameStatisticsId
    );
    if (!gameStatistics) {
      return res.status(404).json({ error: "GameStatistics not found" });
    }

    const hasAchievement =
      await gameStatisticsService.hasAchievementBeenAchieved(
        gameStatistics,
        title
      );
    res.status(200).json({ achieved: hasAchievement });
  } catch (error) {
    console.error(
      `Error checking achievement ${req.params.title} for GameStatistics ${req.params.gameStatisticsId}:`,
      error
    );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

module.exports = router;
