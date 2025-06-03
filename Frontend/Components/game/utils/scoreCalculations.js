import { fetchGameStatistics } from "../service/gameService.js";

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
    ActiveGreySource: -0,
    energyBuilding: {
        level1: -4,
        level2: -3,
        level3: -2,
        level4: -1,
        level5: 0,
    }
}

export async function ScoreCalculations(groupId, token) {
    const gs = await fetchGameStatistics(groupId, token);
    const assets = gs.assets || [];
    const buildings = gs.buildings || [];
    let score = 0;

    // Score voor groene energiebronnen, grijze energiebronnen, en natuur
    assets.forEach(asset => {
        if (asset.type in scoreCost.ActiveGreenSource) {
            score += scoreCost.ActiveGreenSource[asset.type];
        }
        if (asset.type === 'Kerncentrale') {
            score += scoreCost.ActiveGreySource;
        }
        if (asset.type in scoreCost.Nature) {
            score += scoreCost.Nature[asset.type];
        }
    });

    console.log("Total score:", score);
}