import { World } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { getDroppedAssetDetails } from "./getDroppedAssetDetails.js";

export const getDroppedAssetsWithUniqueName = async ({ assetId, credentials, isPartial, uniqueName, urlSlug }) => {
  try {
    let keyAssetUniqueName = uniqueName;
    if (!keyAssetUniqueName) {
      const droppedAsset = await getDroppedAssetDetails({
        credentials,
        droppedAssetId: assetId,
        urlSlug,
      });
      keyAssetUniqueName = droppedAsset.uniqueName || assetId;
    }

    const world = World.create(urlSlug, {
      credentials,
    });
    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      isPartial,
      uniqueName: `questItem_${keyAssetUniqueName}`,
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
