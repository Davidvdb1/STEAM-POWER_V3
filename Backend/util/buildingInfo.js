const buildings = [
    "office",
    "apartmentBlockTopLeft",
    "townhall",
    "gasStation",
    "hotdogStand",
    "hospital",
    "shoppingCenter",
    "school",
    "bakery",
    "fireStation",
    "policeStation",
    "apartmentBlockBottomLeft",
    "hotel",
    "apartmentBlockBottomCenter",
    "postOffice",
    "apartmentBlockBottomRight",
    "constructionSite",
    "trainStation"
  ];
  
  const createdBuildings = [];
  
  for (const name of buildings) {
    const building = await prisma.building.create({ data: { name } });
    createdBuildings.push(building);
  }
  

  // BUILDING LEVELS
  const levels = [
    { buildingId: createdBuildings[0].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[0].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[0].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[0].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[0].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[1].id, level: 1, upgradeCost: 8, energyCost: 60, scoreDeduction: 4 },
    { buildingId: createdBuildings[1].id, level: 2, upgradeCost: 7, energyCost: 50, scoreDeduction: 3 },
    { buildingId: createdBuildings[1].id, level: 3, upgradeCost: 5, energyCost: 40, scoreDeduction: 2 },
    { buildingId: createdBuildings[1].id, level: 4, upgradeCost: 3, energyCost: 35, scoreDeduction: 1 },
    { buildingId: createdBuildings[1].id, level: 5, upgradeCost: 0, energyCost: 30, scoreDeduction: 0 },

    { buildingId: createdBuildings[2].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[2].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[2].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[2].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[2].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[3].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[3].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[3].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[3].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[3].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[4].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[4].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[4].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[4].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[4].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[5].id, level: 1, upgradeCost: 12, energyCost: 120, scoreDeduction: 4 },
    { buildingId: createdBuildings[5].id, level: 2, upgradeCost: 10, energyCost: 100, scoreDeduction: 3 },
    { buildingId: createdBuildings[5].id, level: 3, upgradeCost: 7, energyCost: 80, scoreDeduction: 2 },
    { buildingId: createdBuildings[5].id, level: 4, upgradeCost: 3, energyCost: 65, scoreDeduction: 1 },
    { buildingId: createdBuildings[5].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[6].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[6].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[6].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[6].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[6].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[7].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[7].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[7].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[7].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[7].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[8].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[8].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[8].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[8].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[8].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[9].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[9].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[9].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[9].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[9].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[10].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[10].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[10].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[10].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[10].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[11].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[11].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[11].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[11].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[11].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[12].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[12].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[12].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[12].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[12].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[13].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[13].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[13].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[13].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[13].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[14].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[14].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[14].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[14].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[14].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[15].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[15].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[15].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[15].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[15].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[16].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[16].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[16].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[16].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[16].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 },

    { buildingId: createdBuildings[17].id, level: 1, upgradeCost: 10, energyCost: 80, scoreDeduction: 4 },
    { buildingId: createdBuildings[17].id, level: 2, upgradeCost: 5, energyCost: 70, scoreDeduction: 3 },
    { buildingId: createdBuildings[17].id, level: 3, upgradeCost: 5, energyCost: 60, scoreDeduction: 2 },
    { buildingId: createdBuildings[17].id, level: 4, upgradeCost: 5, energyCost: 55, scoreDeduction: 1 },
    { buildingId: createdBuildings[17].id, level: 5, upgradeCost: 0, energyCost: 50, scoreDeduction: 0 }
  ];
  
  const buildingLevels = [];
  
  for (const lvl of levels) {
    const buildingLevel = await prisma.buildingLevel.create({ data: lvl });
    buildingLevels.push(buildingLevel);
  }
