/**
 * @module detailHelper
 * @description Contains utility functions for rendering detailed views of buildings and assets.
 */

/**
 * Renders either a <building-detail> or <asset-detail> inside `detailContainer`.
 *
 * @param {HTMLElement}  detailContainer – the <div> where we insert the detail element
 * @param {Array<Object>} buildingData   – array of building objects (each must have an `id`)
 * @param {Array<Object>} assetData      – array of asset objects (each must have an `id`)
 * @param {"building"|"asset"} type      – whether to create <building-detail> or <asset-detail>
 * @param {string|number} id             – the ID of the building/asset to look up
 */
export function showDetail(detailContainer, buildingData, assetData, type, id) {
  detailContainer.innerHTML = "";

  let detailEl;
  let dataItem;

  if (type === "building") {
    detailEl = document.createElement("building-detail");
    dataItem = buildingData.find((b) => b.id === id);
  } else if (type === "asset") {
    detailEl = document.createElement("asset-detail");
    dataItem = assetData.find((a) => a.id === id);
  } else {
    return;
  }

  if (dataItem) {
    detailEl.data = dataItem;
  }

  detailContainer.appendChild(detailEl);
  detailContainer.classList.remove("hidden");
}
