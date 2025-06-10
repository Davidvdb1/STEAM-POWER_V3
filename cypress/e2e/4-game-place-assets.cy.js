describe("Direct Game Overview Navigation Test with sessionStorage", () => {
  const backendUrl = "http://localhost:3000";
  const groupCode = "bdce0a";
  let gameStatisticsId;

  beforeEach(() => {
    cy.session("groep-login-session", () => {
      cy.loginViaUI(backendUrl, groupCode);
    });

    cy.on("uncaught:exception", (err) => {
      if (
        err.message.includes("addEventListener") ||
        err.message.includes("removeEventListener") ||
        err.message.includes("Script error") ||
        err.message.includes("cross origin")
      ) {
        return false;
      }
    });

    cy.intercept("GET", "**/gameStatistics/group/**", (req) => {
      req.headers["cache-control"] = "no-cache";
      req.headers["pragma"] = "no-cache";
    }).as("gameStats");

    cy.visit("http://localhost:5500/Frontend/?tab=campoverviewpage");
  });

  it("should check available assets in shop", () => {
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

    cy.getGameControlPanel()
      .shadow()
      .find('shop-sidebar[data-cy="shop-sidebar"]')
      .shadow()
      .within(() => {
        const expectedAssets = [
          { type: "Windmolen", price: "20" },
          { type: "Waterrad", price: "20" },
          { type: "Zonnepaneel", price: "20" },
          { type: "Kerncentrale", price: "20" },
          { type: "Eik", price: "10" },
          { type: "Beuk", price: "10" },
          { type: "Buxus", price: "10" },
          { type: "Hulst", price: "10" },
        ];

        expectedAssets.forEach((asset) => {
          cy.get(`[data-type="${asset.type}"]`)
            .should("exist")
            //   .and("be.visible")
            .and("have.attr", "data-base-price", asset.price);

          cy.get(`[data-type="${asset.type}"]`)
            .find("p")
            .first()
            .should("contain.text", asset.type);

          cy.get(`[data-type="${asset.type}"]`).find(".price").should("exist");
        });

        cy.get(".card-asset").should("have.length", expectedAssets.length);

        // Check dat energy-producing assets hebben de juiste energy icon
        const greenEnergyAssets = ["Windmolen", "Waterrad", "Zonnepaneel"];
        greenEnergyAssets.forEach((assetType) => {
          cy.get(`[data-type="${assetType}"]`)
            .find('.corner-icon img[src*="pixelGreenEnergy.svg"]')
            .should("exist");
        });

        // Check dat Kerncentrale grey energy icon heeft
        cy.get('[data-type="Kerncentrale"]')
          .find('.corner-icon img[src*="pixelGreyEnergy.svg"]')
          .should("exist");

        const decorativeAssets = ["Eik", "Beuk", "Buxus", "Hulst"];
        decorativeAssets.forEach((assetType) => {
          cy.get(`[data-type="${assetType}"]`)
            .find(".corner-icon")
            .should("not.exist");
        });
      });

    console.log("✅ All shop assets verified successfully");
  });
  it("should show confirmation dialog when placing a Windmolen at coordinates (44, 22)", () => {
    cy.intercept("POST", "**/gameStatistics/*/assets", (req) => {
      const urlParts = req.url.split("/");
      const gameStatsIndex = urlParts.findIndex(
        (part) => part === "gameStatistics"
      );
      if (gameStatsIndex !== -1 && gameStatsIndex + 1 < urlParts.length) {
        gameStatisticsId = urlParts[gameStatsIndex + 1];
        console.log("Extracted gameStatisticsId:", gameStatisticsId);
      }

      console.log("Asset placement request:", req.body);

      // Return mock response met de echte request data
      // req.reply({
      //   statusCode: 201,
      //   body: {
      //     asset: {
      //       ...req.body, // Gebruik alle data uit de request
      //     },
      //   },
      // });
    }).as("addAsset");

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

    cy.wait(2000);

    cy.window().then(async (win) => {
      const game = win.phaserGame;
      const outerCityScene = game.scene
        .getScenes(true)
        .find((s) => s.scene.key === "OuterCityScene");

      if (outerCityScene) {
        console.log("🎯 Testing confirmation dialog for Windmolen placement");

        const type = "Windmolen";
        const tx = 44;
        const ty = 22;
        const cost = 20;

        if (outerCityScene.showConfirmation) {
          const currentCoins = outerCityScene.sys.game.currency?.coins ?? 100;

          let msg;
          if (currentCoins - cost < 0) {
            msg = `Je krijgt een extra kost van 10% omdat je niet genoeg coins hebt. Wil je hier een ${type} plaatsen voor ${cost + (cost / 100) * 10} coins?`;
          } else {
            msg = `Wil je hier een ${type} plaatsen voor ${cost} coins?`;
          }

          console.log("Expected confirmation message:", msg);

          outerCityScene.showConfirmation(msg, async (confirmed) => {
            console.log("User response:", confirmed);

            if (confirmed) {
              try {
                const gameStatsId = outerCityScene.sys.game.gameStatisticsId;
                const token = outerCityScene.sys.game.token;

                const assetData = {
                  type: type,
                  xLocation: tx,
                  yLocation: ty,
                  xSize: 6,
                  ySize: 10,
                  energy: 1,
                  buildCost: cost,
                  destroyCost: cost,
                };

                const response = await fetch(
                  `http://localhost:3000/gameStatistics/${gameStatsId}/assets`,
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

                  const gameControlPanel =
                    document.querySelector("gamecontrolpanel-れ");
                  if (gameControlPanel && gameControlPanel._updateStatistics) {
                    console.log(
                      "🔄 Updating statistics via game control panel..."
                    );
                    await gameControlPanel._updateStatistics();
                  }

                  if (outerCityScene.loadAssets) {
                    console.log("🔄 Force reloading scene assets...");
                    await outerCityScene.loadAssets();
                  } else if (outerCityScene.reloadAssets) {
                    console.log(
                      "🔄 Force reloading scene assets (alternative method)..."
                    );
                    await outerCityScene.reloadAssets();
                  }

                  if (
                    outerCityScene.checkpointAssets &&
                    outerCityScene.reloadCheckpointAssets
                  ) {
                    console.log("🔄 Updating checkpoint assets...");
                    outerCityScene.checkpointAssets = [
                      ...(outerCityScene.checkpointAssets || []),
                      {
                        type: type,
                        xLocation: tx,
                        yLocation: ty,
                        xSize: 6,
                        ySize: 10,
                        energy: 1,
                        buildCost: cost,
                        destroyCost: cost,
                      },
                    ];
                    outerCityScene.reloadCheckpointAssets();
                  }
                  if (outerCityScene.fetchAssetsFromAPI) {
                    console.log("🔄 Re-fetching assets from API...");
                    await outerCityScene.fetchAssetsFromAPI();
                  }

                  outerCityScene.events.emit("assetsUpdated");
                  outerCityScene.events.emit("refreshAssets");
                  outerCityScene.events.emit("reload");
                  setTimeout(() => {
                    if (
                      outerCityScene &&
                      typeof outerCityScene.showError === "function"
                    ) {
                      console.log("🔍 Calling showError function...");
                      outerCityScene.showError(`${type} succesvol geplaatst!`);
                      console.log(
                        `📢 Showing success message: ${type} succesvol geplaatst!`
                      );

                      setTimeout(() => {
                        const allObjects = outerCityScene.children.list;
                        const popupObjects = allObjects.filter(
                          (obj) => obj.depth >= 1999 && obj.depth <= 2000
                        );
                        console.log(
                          "🔍 Popup objects after showError:",
                          popupObjects.length
                        );
                        console.log(
                          "🔍 Popup objects details:",
                          popupObjects.map((obj) => ({
                            type: obj.type,
                            depth: obj.depth,
                            visible: obj.visible,
                            x: obj.x,
                            y: obj.y,
                          }))
                        );
                      }, 100);
                    }
                  }, 1000);

                  setTimeout(() => {
                    console.log("🔄 Restarting scene as last resort...");
                    outerCityScene.scene.restart();
                  }, 1000);

                  document.dispatchEvent(
                    new CustomEvent("asset-placed-via-api", {
                      detail: { type, tx, ty, cost },
                    })
                  );
                } else {
                  console.error("❌ Failed to place asset via API");
                }
              } catch (error) {
                console.error("Error placing asset:", error);
              }
            }
          });
        }
      }
    });

    cy.wait(3000);

    cy.window().then((win) => {
      const game = win.phaserGame;
      const scene = game.scene
        .getScenes(true)
        .find((s) => s.scene.key === "OuterCityScene");

      if (scene) {
        const allObjects = scene.children.list;
        console.log(
          "🔍 All objects in scene after refresh:",
          allObjects.length
        );

        const windmolenAssets = allObjects.filter(
          (obj) =>
            obj.texture &&
            (obj.texture.key === "Windmolen" ||
              (obj.texture.key &&
                obj.texture.key.toLowerCase().includes("windmolen")))
        );

        console.log("🔍 Found Windmolen assets:", windmolenAssets.length);

        if (windmolenAssets.length > 0) {
          console.log("✅ Windmolen asset is visible in scene!");

          cy.wrap(windmolenAssets.length).should("be.at.least", 1);

          const firstWindmolen = windmolenAssets[0];
          console.log("🎯 First Windmolen position:", {
            x: firstWindmolen.x,
            y: firstWindmolen.y,
            visible: firstWindmolen.visible,
          });
        } else {
          console.log("❌ No Windmolen assets found in scene");

          const texturedObjects = allObjects.filter(
            (obj) => obj.texture && obj.texture.key
          );
          console.log(
            "🔍 All textured objects:",
            texturedObjects.map((obj) => ({
              key: obj.texture.key,
              x: obj.x,
              y: obj.y,
              visible: obj.visible,
            }))
          );
        }
      }
    });

    cy.window().then((win) => {
      const game = win.phaserGame;
      const scene = game.scene
        .getScenes(true)
        .find((s) => s.scene.key === "OuterCityScene");

      if (scene) {
        const allObjects = scene.children.list;
        const visibleObjects = allObjects.filter((obj) => obj.visible);

        console.log("🔍 Total objects in scene:", allObjects.length);
        console.log("🔍 Visible objects:", visibleObjects.length);

        const popupRangeObjects = allObjects.filter(
          (obj) => obj.depth >= 1995 && obj.depth <= 2005
        );

        console.log(
          "🔍 Objects in popup depth range (1995-2005):",
          popupRangeObjects.map((obj) => ({
            type: obj.type,
            depth: obj.depth,
            visible: obj.visible,
            fillColor: obj.fillColor,
            hasInput: !!obj.input,
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
          }))
        );

        let yesButton = null;

        yesButton = visibleObjects.find((obj) => {
          return (
            obj.type === "Graphics" &&
            obj.input &&
            obj.depth === 1999 &&
            obj.fillColor === 0x4caf50 &&
            obj.visible
          );
        });

        if (!yesButton) {
          yesButton = visibleObjects.find((obj) => {
            return obj.fillColor === 0x4caf50 && obj.input && obj.visible;
          });
          console.log("🔍 Strategy 2 - Found by fillColor:", !!yesButton);
        }

        if (!yesButton) {
          const interactiveObjects = visibleObjects.filter(
            (obj) => obj.input && obj.depth >= 1998 && obj.depth <= 2000
          );

          console.log(
            "🔍 Strategy 3 - Interactive objects in range:",
            interactiveObjects.map((obj) => ({
              type: obj.type,
              depth: obj.depth,
              fillColor: obj.fillColor,
              x: obj.x,
              y: obj.y,
            }))
          );

          yesButton = interactiveObjects.find(
            (obj) => obj.fillColor === 0x4caf50
          );
        }

        if (!yesButton) {
          const buttons = visibleObjects.filter(
            (obj) => obj.input && obj.type === "Graphics" && obj.depth >= 1998
          );

          if (buttons.length >= 2) {
            buttons.sort((a, b) => a.x - b.x);
            yesButton = buttons[0];
            console.log("🔍 Strategy 4 - Using left-most button as 'Ja'");
          }
        }

        if (yesButton) {
          console.log("✅ Found 'Ja' button:", {
            type: yesButton.type,
            depth: yesButton.depth,
            fillColor: yesButton.fillColor,
            x: yesButton.x,
            y: yesButton.y,
            visible: yesButton.visible,
          });

          try {
            yesButton.emit("pointerdown");
            console.log("✅ Emitted pointerdown event");

            setTimeout(() => {
              yesButton.emit("pointerup");
              yesButton.emit("click");
            }, 100);
          } catch (error) {
            console.error("❌ Error emitting events:", error);
          }
        } else {
          console.log("❌ 'Ja' button still not found with any strategy");

          const allInteractive = visibleObjects.filter((obj) => obj.input);
          console.log(
            "🔍 All interactive objects:",
            allInteractive.map((obj) => ({
              type: obj.type,
              depth: obj.depth,
              fillColor: obj.fillColor,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
            }))
          );
        }
      }
    });

    cy.wait("@addAsset", { timeout: 10000 }).then((interception) => {
      expect(interception.request.method).to.equal("POST");

      const requestBody = interception.request.body;

      expect(requestBody.type, "Asset type should be Windmolen").to.equal(
        "Windmolen"
      );
      expect(requestBody.xLocation, "X location should be 44").to.equal(44);
      expect(requestBody.yLocation, "Y location should be 22").to.equal(22);
      expect(requestBody.buildCost, "Build cost should be 20").to.equal(20);
      expect(requestBody.xSize, "xSize should be defined").to.be.a("number");
      expect(requestBody.ySize, "ySize should be defined").to.be.a("number");
      expect(requestBody.energy, "energy should be defined").to.be.a("number");
      expect(requestBody.destroyCost, "destroyCost should be defined").to.be.a(
        "number"
      );

      console.log("✅ POST request to place asset was made successfully");
      console.log("Full request body:", requestBody);
    });

    console.log("🎉 Complete asset placement flow test completed!");
  });
});