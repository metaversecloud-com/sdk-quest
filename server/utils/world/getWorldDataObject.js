import { World } from "../topiaInit.js";
import { error } from "../error.js";

export const getWorldDataObject = async ({ assetId, credentials, urlSlug }) => {
  try {
    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    if (!world.dataObject || !world.dataObject.hasOwnProperty("keyAssetId")) {
      const lockId = `${urlSlug}-keyAssetId-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      world.updateDataObject({ keyAssetId: assetId }, { lock: { lockId } });
    }
    return world;
  } catch (e) {
    error("Error getting world details", e);
  }
};
