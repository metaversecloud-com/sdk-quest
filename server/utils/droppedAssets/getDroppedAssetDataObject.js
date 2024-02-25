import { DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../index.js";
import { initializeDroppedAssetDataObject } from "./initializeDroppedAssetDataObject.js";

export const getDroppedAssetDataObject = async ({ credentials, urlSlug }) => {
  try {
    const droppedAsset = await DroppedAsset.get(credentials.assetId, urlSlug, { credentials });
    await initializeDroppedAssetDataObject({ droppedAsset, urlSlug });
    return droppedAsset;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAssetDataObject",
      message: "Error getting dropped asset data object",
    });
  }
};
