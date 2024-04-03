import { DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../index.js";
import { initializeDroppedAssetDataObject } from "./initializeDroppedAssetDataObject.js";
import { Credentials } from "../../types/Credentials.js";

export const getDroppedAssetDataObject = async (credentials: Credentials) => {
  try {
    const { assetId, urlSlug } = credentials
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    await initializeDroppedAssetDataObject({ credentials, droppedAsset });
    return droppedAsset;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAssetDataObject",
      message: "Error getting dropped asset data object",
    });
  }
};
