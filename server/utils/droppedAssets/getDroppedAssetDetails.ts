import { DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../index.js";
import { initializeDroppedAssetDataObject } from "./initializeDroppedAssetDataObject.js";
import { Credentials } from '../../types/Credentials';

export const getDroppedAssetDetails = async ({ credentials, droppedAssetId, shouldInitDataObject = false, uniqueName }: { credentials: Credentials, droppedAssetId?: string, shouldInitDataObject?: boolean, uniqueName?: string }) => {
  try {
    const { interactivePublicKey, urlSlug } = credentials;
    let assetId = droppedAssetId,
      droppedAsset;

    if (assetId) await DroppedAsset.get(assetId, urlSlug, { credentials });
    else if (!assetId && !uniqueName) throw "An assetId or uniqueName must be provided";
    else if (!assetId && uniqueName) {
      // supports deprecated versions where only unique name of key asset is known
      droppedAsset = await DroppedAsset.getWithUniqueName(uniqueName, urlSlug, {
        interactivePublicKey: interactivePublicKey,
        interactiveSecret: process.env.INTERACTIVE_SECRET,
      });
    }

    if (!droppedAsset) throw "Dropped asset not found";

    if (shouldInitDataObject) await initializeDroppedAssetDataObject({ credentials, droppedAsset });

    return droppedAsset;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset and data object",
    });
  }
};
