import { fetchGameStatistics, updateCurrency } from "../service/gameService.js";

export const scoreCost = {
    buildingOnGreen: 1,
    Nature: {
        Beuk: 4,
        Eik: 3,
        Buxus: 2,
        Hulst: 1,
    },
    ActiveGreenSource: {
        Windmolen: 1,
        Zonnepaneel: 1,
        Waterrad: 1,
    },
    buildingOnGrey: -1,
    ActiveGreySource: -2,
    energyBuildingLevel: {
        1: -4,
        2: -3,
        3: -2,
        4: -1,
        5: 0,
    }
}

export async function ScoreCalculations(groupId, token) {
    const gs = await fetchGameStatistics(groupId, token);
    const assets = gs.assets || [];
    const gameBuildings = gs.gameBuildings || [];
    const buildings = gameBuildings.map(gb => ({
      id: gb.id,
      name: gb.building ? gb.building.name : 'Unknown Building',
      building: gb.building,  // Keep original reference if needed
      level: gb.buildingLevel // Directly use buildingLevel as level
    }));
    const cur = gs.currency || {};
    let updatedScore = 0;

    

    // Score voor groene energiebronnen, grijze energiebronnen, en natuur
    assets.forEach(asset => {
        if (asset.type in scoreCost.ActiveGreenSource) {
            updatedScore += scoreCost.ActiveGreenSource[asset.type];
        }
        if (asset.type === 'Kerncentrale') {
            updatedScore += scoreCost.ActiveGreySource;
        }
        if (asset.type in scoreCost.Nature) {
            updatedScore += scoreCost.Nature[asset.type];
        }
    });

    // Score voor het algemeen energieverbruik per gebouw
    buildings.forEach(building => {
        if (building.level.level in scoreCost.energyBuildingLevel) {
            updatedScore += scoreCost.energyBuildingLevel[building.level.level];
        }
    })

    const updated = {
        greenEnergy: cur.greenEnergy,
        greyEnergy: cur.greyEnergy,
        coins: cur.coins,
        score: 100 + updatedScore,
    };

    await updateCurrency(cur.id, updated, token);
}