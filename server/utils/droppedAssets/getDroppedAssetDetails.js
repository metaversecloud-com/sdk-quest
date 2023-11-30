import { DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../index.js";
import { initializeDroppedAssetDataObject } from "./initializeDroppedAssetDataObject.js";

export const getDroppedAssetDetails = async ({ credentials, droppedAssetId, isKeyAsset, uniqueName, urlSlug }) => {
  try {
    let assetId = droppedAssetId,
      droppedAsset;

    if (!assetId && uniqueName) {
      droppedAsset = DroppedAsset.getWithUniqueName(
        uniqueName,
        urlSlug,
        credentials.interactivePublicKey,
        process.env.INTERACTIVE_SECRET,
      );
    } else {
      droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    }
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
