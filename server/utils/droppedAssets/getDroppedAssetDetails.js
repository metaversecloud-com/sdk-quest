import { DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../index.js";
import { initializeDroppedAssetDataObject } from "./initializeDroppedAssetDataObject.js";

export const getDroppedAssetDetails = async ({ credentials, droppedAssetId, shouldInitDataObject, uniqueName }) => {
  try {
    const { interactivePublicKey, urlSlug } = credentials;
    let assetId = droppedAssetId,
      droppedAsset;

    if (!assetId && !uniqueName) throw "An assetId or uniqueName must be provided";
    if (!assetId && uniqueName) {
      // supports deprecated versions where only unique name of key asset is known
      droppedAsset = await DroppedAsset.getWithUniqueName(uniqueName, urlSlug, {
        interactivePublicKey: interactivePublicKey,
        interactiveSecret: process.env.INTERACTIVE_SECRET,
      });
    } else {
      droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    }
    if (!droppedAsset) throw "Dropped asset not found";

    if (shouldInitDataObject) await initializeDroppedAssetDataObject({ droppedAsset, urlSlug });

    return droppedAsset;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset and data object",
    });
  }
};
