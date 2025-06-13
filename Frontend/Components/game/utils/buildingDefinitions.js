/**
 * this file contains the definitions of buildings used in the game.
 * Each building has a name and a set of layers that define its appearance.
 * @module buildingDefinitions
 * @description configuration for various buildings in the game.
 */

/**
 * Array of building definitions.
 * Each building is an object with a `name` and `layers`.
 * Each layer is an array containing the layer name and its coordinates.
 * @typedef {Object} BuildingDefinition
 * @property {string} name - The name of the building.
 * @property {Array<Array<string, Array<number>>>>} layers - The layers of the building, each defined by a name and coordinates.
 */
export const BUILDING_DEFINITIONS = [
  {
    name: "office",
    layers: [
      ["Layer-2", [0, 0], [20, 24]],
      ["Layer-3", [0, 0], [20, 24]],
    ],
  },
  {
    name: "apartmentBlockTopLeft",
    layers: [
      ["Layer-2", [21, 0], [52, 24]],
      ["Layer-3", [21, 0], [52, 24]],
      ["Layer-4", [21, 0], [52, 24]],
      ["Layer-5", [30, 5], [40, 9]],
    ],
  },
  {
    name: "townhall",
    layers: [
      ["Layer-2", [58, 0], [82, 24]],
      ["Layer-3", [58, 0], [82, 24]],
    ],
  },
  {
    name: "gasStation",
    layers: [
      ["Layer-2", [88, 0], [103, 13]],
      ["Layer-2", [88, 14], [90, 14]],
      ["Layer-3", [88, 0], [103, 13]],
    ],
  },
  {
    name: "hotdogStand",
    layers: [
      ["Layer-2", [90, 15], [102, 22]],
      ["Layer-3", [90, 15], [102, 22]],
      ["Layer-3", [100, 14], [101, 14]],
      ["Layer-4", [90, 15], [102, 22]],
    ],
  },
  {
    name: "hospital",
    layers: [
      ["Layer-2", [104, 0], [139, 24]],
      ["Layer-3", [104, 0], [139, 24]],
    ],
  },
  {
    name: "shoppingCenter",
    layers: [
      ["Layer-2", [0, 31], [25, 47]],
      ["Layer-3", [0, 30], [27, 47]],
    ],
  },
  {
    name: "school",
    layers: [
      ["Layer-2", [32, 25], [49, 46]],
      ["Layer-3", [32, 25], [49, 46]],
    ],
  },
  {
    name: "bakery",
    layers: [
      ["Layer-2", [52, 29], [59, 35]],
      ["Layer-3", [52, 29], [59, 33]],
    ],
  },
  {
    name: "fireStation",
    layers: [
      ["Layer-2", [96, 30], [115, 45]],
      ["Layer-3", [96, 30], [115, 45]],
    ],
  },
  {
    name: "policeStation",
    layers: [
      ["Layer-2", [117, 27], [139, 47]],
      ["Layer-3", [117, 27], [139, 47]],
      ["Layer-4", [117, 27], [139, 47]],
      ["Layer-5", [117, 30], [139, 47]],
    ],
  },
  {
    name: "apartmentBlockBottomLeft",
    layers: [
      ["Layer-2", [0, 51], [6, 69]],
      ["Layer-3", [0, 51], [6, 69]],
      ["Layer-4", [0, 51], [6, 69]],
      ["Layer-5", [0, 51], [6, 69]],
    ],
  },
  {
    name: "hotel",
    layers: [
      ["Layer-2", [7, 51], [25, 69]],
      ["Layer-3", [7, 51], [23, 69]],
    ],
  },
  {
    name: "apartmentBlockBottomCenter",
    layers: [
      ["Layer-2", [31, 50], [53, 56]],
      ["Layer-3", [31, 50], [66, 68]],
      ["Layer-4", [31, 50], [67, 69]],
      ["Layer-5", [31, 57], [49, 68]],
    ],
  },
  {
    name: "apartmentBlockBottomRight",
    layers: [
      ["Layer-2", [76, 52], [88, 57]],
      ["Layer-3", [76, 52], [88, 55]],
      ["Layer-3", [84, 57], [90, 68]],
      ["Layer-4", [76, 52], [88, 55]],
      ["Layer-4", [84, 57], [90, 68]],
    ],
  },
  {
    name: "postOffice",
    layers: [
      ["Layer-2", [72, 59], [75, 68]],
      ["Layer-3", [76, 56], [83, 68]],
      ["Layer-4", [76, 56], [83, 68]],
    ],
  },
  {
    name: "constructionSite",
    layers: [
      ["Layer-1", [93, 57], [109, 68]],
      ["Layer-2", [93, 54], [109, 68]],
      ["Layer-3", [93, 54], [109, 68]],
      ["Layer-4", [93, 54], [109, 68]],
      ["Layer-5", [93, 54], [109, 68]],
    ],
  },
  {
    name: "trainStation",
    layers: [
      ["Layer-1", [113, 67], [139, 68]],
      ["Layer-2", [112, 58], [139, 69]],
      ["Layer-3", [112, 58], [139, 69]],
      ["Layer-4", [112, 58], [139, 69]],
      ["Layer-5", [112, 58], [139, 69]],
    ],
  },
];

/**
 * Object mapping building names to their translations.
 * @type {Object<string, string>}
 */
export const BUILDING_NAME_TRANSLATIONS = {
  office: "Kantoorgebouw",
  apartmentBlockTopLeft: "Appartementenblok A",
  townhall: "Stadhuis",
  gasStation: "Tankstation",
  hotdogStand: "Hotdogkraam",
  hospital: "Ziekenhuis",
  shoppingCenter: "Winkelcentrum",
  school: "School",
  bakery: "Bakkerij",
  fireStation: "Brandweerkazerne",
  policeStation: "Politiebureau",
  apartmentBlockBottomLeft: "Appartementenblok B",
  hotel: "Hotel",
  apartmentBlockBottomCenter: "Appartementenblok C",
  apartmentBlockBottomRight: "Appartementenblok D",
  postOffice: "Postkantoor",
  constructionSite: "Bouwterrein",
  trainStation: "Treinstation",
};
