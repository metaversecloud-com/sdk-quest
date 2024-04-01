import { errorHandler } from '../errorHandler.js';
import { World } from '../topiaInit.js';
import { getDroppedAssetsWithUniqueName } from './getDroppedAssetsWithUniqueName.js';

export const removeDroppedAssetsWithUniqueName = async (credentials) => {
  try {
    const { assetId, interactivePublicKey, urlSlug } = credentials

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      assetId,
      credentials,
      isPartial: false,
    });

    if (droppedAssets.error) throw droppedAssets.error;

    if (droppedAssets.length > 0) {
      const droppedAssetIds = [];
      for (const droppedAsset in droppedAssets) droppedAssetIds.push(droppedAssets[droppedAsset].id);
      await World.deleteDroppedAssets(urlSlug, droppedAssetIds, {
        interactivePublicKey,
        interactiveSecret: process.env.INTERACTIVE_SECRET,
      });
    }

    return { success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "removeDroppedAssetsWithUniqueName",
      message: "Error removing dropped asset by uniqueName",
    });
  }
};
