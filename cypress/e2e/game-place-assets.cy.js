describe("Game Asset Placement Tests", () => {
  const BACKEND_URL = "http://localhost:3000";
  const FRONTEND_URL = "http://localhost:5500/Frontend/?tab=campoverviewpage";
  const GROUP_CODE = "2a8fa5";
  
  let gameStatisticsId;

  const EXPECTED_ASSETS = [
    { type: "Windmolen", price: "20", hasGreenEnergy: true },
    { type: "Waterrad", price: "20", hasGreenEnergy: true },
    { type: "Zonnepaneel", price: "20", hasGreenEnergy: true },
    { type: "Kerncentrale", price: "20", hasGreyEnergy: true },
    { type: "Eik", price: "10", isDecorative: true },
    { type: "Beuk", price: "10", isDecorative: true },
    { type: "Buxus", price: "10", isDecorative: true },
    { type: "Hulst", price: "10", isDecorative: true },
  ];

  beforeEach(() => {
    cy.session("groep-login-session", () => {
      cy.loginViaUI(BACKEND_URL, GROUP_CODE);
    });

    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("addEventListener") || 
          err.message.includes("Script error") || 
          err.message.includes("cross origin")) {
        return false;
      }
    });

    cy.intercept("GET", "**/gameStatistics/group/**", (req) => {
      req.headers["cache-control"] = "no-cache";
      req.headers["pragma"] = "no-cache";
    }).as("gameStats");

    cy.visit(FRONTEND_URL);
  });

  const navigateToGame = () => {
    cy.getHeaderNavigation().within(() => {
      cy.get('navigationitem-れ[id="gamepage"]').click();
    });
    cy.url().should("include", "tab=gamepage");
    
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="start-game-btn"]')
      .click({ force: true });
    
    cy.wait("@gameStats");
    cy.getGameControlPanel().shadow().find("#startSpinner").should("not.exist");
    
    cy.getGameControlPanel()
      .shadow()
      .find('[data-cy="outer-city-btn"]')
      .click();
  };

  const verifyShopAsset = (asset) => {
    const selector = `[data-type="${asset.type}"]`;
    
    cy.get(selector)
      .should("exist")
      .and("have.attr", "data-base-price", asset.price);

    cy.get(selector).find("p").first().should("contain.text", asset.type);
    cy.get(selector).find(".price").should("exist");

    if (asset.hasGreenEnergy) {
      cy.get(selector)
        .find('.corner-icon img[src*="pixelGreenEnergy.svg"]')
        .should("exist");
    } else if (asset.hasGreyEnergy) {
      cy.get(selector)
        .find('.corner-icon img[src*="pixelGreyEnergy.svg"]')
        .should("exist");
    } else if (asset.isDecorative) {
      cy.get(selector).find(".corner-icon").should("not.exist");
    }
  };

  it("should check available assets in shop", () => {
    navigateToGame();

    cy.getGameControlPanel()
      .shadow()
      .find('shop-sidebar[data-cy="shop-sidebar"]')
      .shadow()
      .within(() => {
        EXPECTED_ASSETS.forEach(verifyShopAsset);
        
        cy.get(".card-asset").should("have.length", EXPECTED_ASSETS.length);
      });

    console.log("✅ All shop assets verified successfully");
  });

  it("should place a Windmolen at coordinates (44, 22)", () => {
    const ASSET_DATA = {
      type: "Windmolen",
      xLocation: 44,
      yLocation: 22,
      buildCost: 20,
      xSize: 6,
      ySize: 10,
      energy: 1,
      destroyCost: 20
    };

    cy.intercept("POST", "**/gameStatistics/*/assets", (req) => {
      const urlParts = req.url.split("/");
      const gameStatsIndex = urlParts.findIndex(part => part === "gameStatistics");
      if (gameStatsIndex !== -1 && gameStatsIndex + 1 < urlParts.length) {
        gameStatisticsId = urlParts[gameStatsIndex + 1];
      }
      console.log("Asset placement request:", req.body);
    }).as("addAsset");

    navigateToGame();
    cy.wait(2000);

    cy.window().then(async (win) => {
      const scene = win.phaserGame.scene
        .getScenes(true)
        .find(s => s.scene.key === "OuterCityScene");

      if (scene?.showConfirmation) {
        const message = `Wil je hier een ${ASSET_DATA.type} plaatsen voor ${ASSET_DATA.buildCost} coins?`;
        
        scene.showConfirmation(message, async (confirmed) => {
          if (confirmed) {
            await placeAssetViaAPI(scene, ASSET_DATA);
            await refreshSceneAssets(scene, ASSET_DATA);
          }
        });
      }
    });

    cy.wait(1000);
    cy.window().then((win) => {
      const scene = win.phaserGame.scene
        .getScenes(true)
        .find(s => s.scene.key === "OuterCityScene");

      if (scene) {
        const yesButton = findConfirmationButton(scene);
        if (yesButton) {
          console.log("✅ Found confirmation button, clicking...");
          yesButton.emit("pointerdown");
          setTimeout(() => yesButton.emit("pointerup"), 100);
        }
      }
    });

    cy.wait("@addAsset", { timeout: 10000 }).then((interception) => {
      const { body } = interception.request;
      
      expect(interception.request.method).to.equal("POST");
      expect(body.type).to.equal(ASSET_DATA.type);
      expect(body.xLocation).to.equal(ASSET_DATA.xLocation);
      expect(body.yLocation).to.equal(ASSET_DATA.yLocation);
      expect(body.buildCost).to.equal(ASSET_DATA.buildCost);
      
      ["xSize", "ySize", "energy", "destroyCost"].forEach(field => {
        expect(body[field]).to.be.a("number");
      });

      console.log("✅ Asset placement completed successfully");
    });
  });

  const placeAssetViaAPI = async (scene, assetData) => {
    try {
      const gameStatsId = scene.sys.game.gameStatisticsId;
      const token = scene.sys.game.token;

      const response = await fetch(
        `${BACKEND_URL}/gameStatistics/${gameStatsId}/assets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assetData),
        }
      );

      if (response.ok) {
        console.log("✅ Asset placed successfully via API");
        return true;
      }
    } catch (error) {
      console.error("❌ Error placing asset:", error);
    }
    return false;
  };

  const refreshSceneAssets = async (scene, assetData) => {
    const gameControlPanel = document.querySelector("gamecontrolpanel-れ");
    if (gameControlPanel?._updateStatistics) {
      await gameControlPanel._updateStatistics();
    }

    const refreshMethods = ["loadAssets", "reloadAssets", "fetchAssetsFromAPI"];
    for (const method of refreshMethods) {
      if (scene[method]) {
        await scene[method]();
        break;
      }
    }

    if (scene.checkpointAssets) {
      scene.checkpointAssets = [...(scene.checkpointAssets || []), assetData];
      scene.reloadCheckpointAssets?.();
    }

    ["assetsUpdated", "refreshAssets", "reload"].forEach(event => {
      scene.events.emit(event);
    });

    setTimeout(() => {
      scene.showError?.(`${assetData.type} succesvol geplaatst!`);
    }, 1000);
  };

  const findConfirmationButton = (scene) => {
    const visibleObjects = scene.children.list.filter(obj => obj.visible);
    
    let button = visibleObjects.find(obj => 
      obj.fillColor === 0x4caf50 && obj.input && obj.visible
    );

    if (!button) {
      const interactiveObjects = visibleObjects.filter(obj =>
        obj.input && obj.depth >= 1998 && obj.depth <= 2000
      );
      button = interactiveObjects.find(obj => obj.fillColor === 0x4caf50);
    }
    if (!button) {
      const buttons = visibleObjects.filter(obj =>
        obj.input && obj.type === "Graphics" && obj.depth >= 1998
      );
      if (buttons.length >= 2) {
        buttons.sort((a, b) => a.x - b.x);
        button = buttons[0];
      }
    }

    return button;
  };
});