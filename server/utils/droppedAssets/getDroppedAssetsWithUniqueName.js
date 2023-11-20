import { World } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";

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
  } catch (error) {
    errorHandler({
      error,
      functionName: "getDroppedAssetsWithUniqueName",
      message: "Error fetching dropped assets with unique name",
    });
  }
};
