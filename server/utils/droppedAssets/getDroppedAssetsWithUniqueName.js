import { World } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { getDroppedAssetDetails } from "./getDroppedAssetDetails.js";

export const getDroppedAssetsWithUniqueName = async ({ assetId, credentials, isPartial, uniqueName }) => {
  try {
    const { urlSlug } = credentials;
    let keyAssetUniqueName = uniqueName;

    if (!keyAssetUniqueName) {
      const droppedAsset = await getDroppedAssetDetails({
        credentials,
        droppedAssetId: assetId,
      });
      keyAssetUniqueName = droppedAsset.uniqueName;
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
    return errorHandler({
      error,
      functionName: "getDroppedAssetsWithUniqueName",
      message: "Error fetching dropped assets with unique name",
    });
  }
};
