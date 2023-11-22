import { DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../index.js";
import { initializeDroppedAssetDataObject } from "./initializeDroppedAssetDataObject.js";

export const getDroppedAssetDetails = async ({ credentials, droppedAssetId, isKeyAsset, urlSlug }) => {
  try {
    const droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, { credentials });
    if (isKeyAsset) await initializeDroppedAssetDataObject({ droppedAsset, urlSlug });
    return droppedAsset;
  } catch (error) {
    errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset and data object",
    });
  }
};
