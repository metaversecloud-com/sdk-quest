import { World } from "../topiaInit.js";
import { error } from "../error.js";

export const getDroppedAssetsWithUniqueName = async ({ credentials, isPartial, uniqueName, urlSlug }) => {
  try {
    const world = World.create(urlSlug, {
      credentials,
    });
    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      isPartial,
      uniqueName,
    });
    return droppedAssets;
  } catch (e) {
    error("Fetching dropped assets with unique name", e);
  }
};
