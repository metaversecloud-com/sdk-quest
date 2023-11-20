import { DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";

export const getDroppedAssetDetails = async ({ credentials, droppedAssetId, urlSlug }) => {
  try {
    const droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, {
      credentials,
    });
    return droppedAsset;
  } catch (error) {
    errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset and data object",
    });
  }
};
