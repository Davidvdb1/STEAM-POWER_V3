/**
 * @module controller/gameStatisticsController
 * @description
 *   All GameStatistics-related endpoints: game statistics management, currency,
 *   assets, checkpoints, game buildings, achievements, etc., grouped below under separate sub-namespaces.
 * @requires module:service/gameStatisticsService
 */

const express = require("express");
const gameStatisticsService = require("../service/gameStatisticsService");
const GameStatistics = require("../model/gameStatistics");

const router = express.Router();

//########################################################################
//                            GAME STATISTICS
//########################################################################

/**
 * @namespace module:controller/gameStatisticsController.Controller_GameStatistics
 * @memberof module:controller/gameStatisticsController
 * @description
 *   Endpoints for creating, retrieving, and querying GameStatistics entries.
 */

/**
 * POST /gameStatistics<br>
 * Creates a new game statistics entry.
 *
 * @function createGameStatistics
 * @memberof module:controller/gameStatisticsController.Controller_GameStatistics
 * @param {express.Request} req - Express request object.
 * @param {string}           req.body.groupId - The ID of the group.
 * @param {number}           req.body.greenEnergy - Amount of green energy.
 * @param {number}           req.body.greyEnergy - Amount of grey energy.
 * @param {number}           req.body.coins - Number of coins.
 * @param {express.Response} res - Express response object.
 * @returns {GameStatistics} The saved GameStatistics object.
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
 * GET /gameStatistics<br>
 * Retrieves all game statistics entries.
 *
 * @function getAllGameStatistics
 * @memberof module:controller/gameStatisticsController.Controller_GameStatistics
 * @param {express.Request}  req - Express request object.
 * @param {express.Response} res - Express response object.
 * @returns {Array<GameStatistics>} All saved GameStatistics objects.
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
 * GET /gameStatistics/:id<br>
 * Retrieves a game statistics entry by its ID.
 *
 * @function getGameStatisticsById
 * @memberof module:controller/gameStatisticsController.Controller_GameStatistics
 * @param {express.Request} req - Express request object.
 * @param {string}           req.params.id - The unique identifier of the game statistics entry.
 * @param {express.Response} res - Express response object.
 * @returns {GameStatistics} The game statistics object.
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
 * GET /gameStatistics/group/:groupId<br>
 * Retrieves game statistics by group ID.
 *
 * @function getGameStatisticsByGroupId
 * @memberof module:controller/gameStatisticsController.Controller_GameStatistics
 * @param {express.Request} req - Express request object.
 * @param {string}           req.params.groupId - The unique identifier of the group.
 * @param {express.Response} res - Express response object.
 * @returns {GameStatistics} The game statistics object for the specified group.
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
 * @namespace module:controller/gameStatisticsController.Controller_Currency
 * @memberof module:controller/gameStatisticsController
 * @description
 *   All endpoints that deal with the Currency object (get, update, increment).
 */

/**
 * GET /gameStatistics/:id/currency<br>
 * Retrieves the Currency object associated with a GameStatistics entry.
 *
 * @function getCurrencyById
 * @memberof module:controller/gameStatisticsController.Controller_Currency
 * @param {express.Request}  req                – Express request object.
 * @param {string}           req.params.id      – The unique identifier of the GameStatistics entry.
 * @param {express.Response} res                – Express response object.
 * @returns {Currency}                          – The Currency object associated with the GameStatistics entry.
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
 * PUT /gameStatistics/:id/currency<br>
 * Updates the Currency object associated with a GameStatistics entry.
 *
 * @function updateCurrency
 * @memberof module:controller/gameStatisticsController.Controller_Currency
 * @param {express.Request}  req                      – Express request object.
 * @param {string}           req.params.id            – The unique identifier of the GameStatistics entry.
 * @param {number}           req.body.greenEnergy     – The new green energy value.
 * @param {number}           req.body.greyEnergy      – The new grey energy value.
 * @param {number}           req.body.coins           – The new coins value.
 * @param {number}           req.body.score           – The new score value.
 * @param {express.Response} res                      – Express response object.
 * @returns {Currency}                               – The updated Currency object.
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
 * POST /gameStatistics/:id/currency/increment<br>
 * Increments the Currency object associated with a GameStatistics entry.
 *
 * @function incrementCurrency
 * @memberof module:controller/gameStatisticsController.Controller_Currency
 * @param {express.Request}  req                      – Express request object.
 * @param {string}           req.params.id            – The unique identifier of the GameStatistics entry.
 * @param {number}           req.body.greenEnergy     – The amount of green energy to increment.
 * @param {number}           req.body.greyEnergy      – The amount of grey energy to increment.
 * @param {number}           req.body.coins           – The amount of coins to increment.
 * @param {number}           req.body.score           – The amount of score to increment.
 * @param {express.Response} res                      – Express response object.
 * @returns {Currency}                               – The updated Currency object after incrementing.
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
 * @namespace module:controller/gameStatisticsController.Controller_Assets
 * @memberof module:controller/gameStatisticsController
 * @description
 *   Endpoints for adding and removing assets to/from a GameStatistics record.
 */

/**
 * POST /gameStatistics/:id/assets<br>
 * Adds an asset to a GameStatistics object.
 *
 * @function addAssetToGameStatistics
 * @memberof module:controller/gameStatisticsController.Controller_Assets
 * @param {express.Request}  req                          – Express request object.
 * @param {string}           req.params.id               – The unique identifier of the GameStatistics object.
 * @param {number}           req.body.buildCost          – The cost to build the asset.
 * @param {number}           req.body.destroyCost        – The cost to destroy the asset.
 * @param {number}           req.body.energy             – The energy produced by the asset.
 * @param {number}           req.body.xLocation          – The x-coordinate location of the asset.
 * @param {number}           req.body.yLocation          – The y-coordinate location of the asset.
 * @param {number}           req.body.xSize              – The width of the asset.
 * @param {number}           req.body.ySize              – The height of the asset.
 * @param {string}           req.body.type               – The type of the asset.
 * @param {string}           req.body.gameStatisticsId   – The ID of the GameStatistics to which the asset belongs.
 * @param {express.Response} res                          – Express response object.
 * @returns {Asset}                                     – The created asset object.
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
 * DELETE /gameStatistics/assets/:assetId<br>
 * Removes an asset from a GameStatistics object.
 *
 * @function removeAssetFromGameStatistics
 * @memberof module:controller/gameStatisticsController.Controller_Assets
 * @param {express.Request} req - Express request object.
 * @param {string}           req.params.assetId - The unique identifier of the asset to remove.
 * @param {express.Response} res - Express response object.
 * @returns {{ message: string }} A message indicating the asset has been removed.
 */
router.delete("/assets/:assetId", async (req, res) => {
  try {
    const response = await gameStatisticsService.removeAsset(
      req.params.assetId
    );
    res.status(200).json(response);
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
 * @namespace module:controller/gameStatisticsController.Controller_Checkpoints
 * @memberof module:controller/gameStatisticsController
 * @description
 *   Endpoints for recording, fetching, and deleting checkpoints on a GameStatistics record.
 */

/**
 * POST /gameStatistics/:id/checkpoints<br>
 * Creates a checkpoint for a GameStatistics object.
 *
 * @function recordCheckpoint
 * @memberof module:controller/gameStatisticsController.Controller_Checkpoints
 * @param {express.Request}  req                  – Express request object.
 * @param {string}           req.params.id        – The unique identifier of the GameStatistics object.
 * @param {express.Response} res                  – Express response object.
 * @returns {Checkpoint}                          – The created checkpoint object.
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
 * GET /gameStatistics/:id/checkpoints<br>
 * Fetches all checkpoints for a GameStatistics object.
 *
 * @function getAllCheckpointsByGameStatisticsId
 * @memberof module:controller/gameStatisticsController.Controller_Checkpoints
 * @param {express.Request}  req             – Express request object.
 * @param {string}           req.params.id   – The unique identifier of the GameStatistics object.
 * @param {express.Response} res             – Express response object.
 * @returns {Checkpoint[]}                 – An array of checkpoint objects.
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
 * DELETE /gameStatistics/checkpoints/:checkpointId<br>
 * Removes a checkpoint from a GameStatistics object.
 *
 * @function removeCheckpointFromGameStatistics
 * @memberof module:controller/gameStatisticsController..Controller_Checkpoints
 * @param {express.Request}  req                       – Express request object.
 * @param {string}           req.params.checkpointId   – The unique identifier of the checkpoint to remove.
 * @param {express.Response} res                       – Express response object.
 * @returns {{ message: string }}                      – A message indicating the checkpoint has been removed.
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
 * PUT /gameStatistics/refactor/:checkpointId<br>
 * Restores the GameStatistics object to the state of a specific checkpoint and returns the updated data.
 *
 * @function refactorGameStatistics
 * @memberof module:controller/gameStatisticsController..Controller_Checkpoints
 * @param {express.Request}   req                           – Express request object.
 * @param {string}            req.params.checkpointId       – The unique identifier of the checkpoint to restore.
 * @param {express.Response}  res                           – Express response object.
 * @returns {{ gameStatistics: GameStatistics, assets: Asset[], gameBuildings: GameBuildings[] }}
 *   An object containing the updated GameStatistics, its assets, and gameBuildings.
 */
router.put("/refactor/:checkpointId", async (req, res) => {
  const { checkpointId } = req.params;
  console.log("→ [gameStatistics] refactoring game statistics for checkpointId:", checkpointId);

  try {
    const gs = await gameStatisticsService.refactorGameStatistics(checkpointId);
    res.status(200).json(gs);
  } catch (error) {
    console.error("✖ [gameStatistics] ERROR in PUT /refactor/:checkpointId →", error );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

//########################################################################
//                             GAME BUILDINGS
//########################################################################

/**
 * @namespace module:controller/gameStatisticsController.Controller_GameBuildings
 * @memberof module:controller/gameStatisticsController
 * @description
 *   Endpoints for retrieving and upgrading GameBuilding objects related to GameStatistics.
 */

/**
 * PUT /gameStatistics/buildings/:gameBuildingId/upgrade<br>
 * Upgrades a GameBuilding object to a new level.
 *
 * @function upgradeGameBuilding
 * @memberof module:controller/gameStatisticsController.Controller_GameBuildings
 * @param {express.Request} req - Express request object.
 * @param {string}           req.params.gameBuildingId - The unique identifier of the GameBuilding to upgrade.
 * @param {number}           req.body.level - The new level to upgrade the building to.
 * @param {express.Response} res - Express response object.
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
 * GET /gameStatistics/gameBuildings/getAllGameBuildingsByGroupId/:groupId<br>
 * Retrieves all GameBuildings associated with a specific groupId.
 *
 * @function getAllGameBuildingsByGroupId
 * @memberof module:controller/gameStatisticsController.Controller_GameBuildings
 * @param {express.Request}  req                    – Express request object.
 * @param {string}           req.params.groupId     – The unique identifier of the group (URL parameter).
 * @param {express.Response} res                    – Express response object.
 * @returns {GameBuildings[]}                       – An array of GameBuildings objects.
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


/**
 * PUT /gameStatistics/buildings/:gameBuildingId/green<br>
 * Toggles the runsOnGreen property of a GameBuilding object.
 *
 * @function toggleGameBuildingRunsOnGreen
 * @memberof module:controller/gameStatisticsController.Controller_GameBuildings
 * @param {express.Request} req - Express request object.
 * @param {string}           req.params.gameBuildingId - The unique identifier of the GameBuilding to toggle.
 * @param {express.Response} res - Express response object.
 * @returns {GameBuildings} The updated GameBuilding object in the response body.
 */
router.put(
  "/buildings/:gameBuildingId/green",
  async (req, res) => {
    try {
      const building =
        await gameStatisticsService.toggleGameBuildingRunsOnGreen(
          req.params.gameBuildingId
        );
      res.status(200).json(building);
    } catch (error) {
      console.error(
        `Error setting gameBuilding ${req.params.gameBuildingId} to green:`,
        error
      );
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({ error: error.message });
    }
  }
);


/**
 *  
 *  
 * POST /gameBuildings/:gameStatisticsId<br>
 * Creates GameBuildings for a GameStatistics object.
 *  
 * @function createGameBuildings
 * @memberof module:controller/gameStatisticsController.Controller_GameBuildings
 * @param {express.Request} req - Express request object.
 * @param {string}           req.params.gameStatisticsId - The unique identifier of the GameStatistics object.
 * @param {express.Response} res - Express response object.
 *  
 * @returns {GameBuildings[]} An array of created GameBuildings objects.
 * */

router.post("/gameBuildings/:gameStatisticsId", async (req, res) => {
  try {
    const gameStatisticsId = req.params.gameStatisticsId;
    const gameBuildings = await gameStatisticsService.createGameBuildings(gameStatisticsId);
    res.status(201).json(gameBuildings);
  } catch (error) {
    console.error(
      `Error creating game buildings for GameStatistics ${req.params.gameStatisticsId}:`,
      error
    );
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message });
  }
});


//########################################################################
//                              ACHIEVEMENTS
//########################################################################

/**
 * @namespace module:controller/gameStatisticsController.Controller_Achievements
 * @memberof module:controller/gameStatisticsController
 * @description
 *   Endpoints for adding, retrieving, and checking Achievements on a GameStatistics record.
 */

/**
 * POST /gameStatistics/achievements/add/:gameStatisticsId/:title<br>
 * Adds an achievement to a GameStatistics object.
 *
 * @function addAchievementToGameStatistics
 * @memberof module:controller/gameStatisticsController.Controller_Achievements
 * @param {express.Request} req - Express request object.
 * @param {string}           req.params.gameStatisticsId - The unique identifier of the GameStatistics object.
 * @param {string}           req.params.title - The title of the achievement to add.
 * @param {express.Response} res - Express response object.
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
 * GET /gameStatistics/:gameStatisticsId/achievements<br>
 * Retrieves all Achievements for a GameStatistics object.
 *
 * @function getGameStatisticsAchievements
 * @memberof module:controller/gameStatisticsController.Controller_Achievements
 * @param {express.Request}  req                            – Express request object.
 * @param {string}           req.params.gameStatisticsId    – The unique identifier of the GameStatistics object.
 * @param {express.Response} res                            – Express response object.
 * @returns {Achievement[]}                                 – An array of Achievement objects.
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
 * GET /gameStatistics/:gameStatisticsId/achievements/check/:title<br>
 * Checks if an achievement has been achieved for a GameStatistics object.
 *
 * @function checkGameStatisticsAchievement
 * @memberof module:controller/gameStatisticsController.Controller_Achievements
 * @param {express.Request}  req                            – Express request object.
 * @param {string}           req.params.gameStatisticsId    – The unique identifier of the GameStatistics object.
 * @param {string}           req.params.title               – The title of the achievement to check.
 * @param {express.Response} res                            – Express response object.
 * @returns {{ achieved: boolean }}                          – An object indicating whether the achievement has been achieved.
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
