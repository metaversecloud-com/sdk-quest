import { errorHandler, getDroppedAssetDetails, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const updateAdminSettings = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const { numberAllowedToCollect, questItemImage } = req.body;
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
      isKeyAsset: true,
      urlSlug,
    });

    const lockId = `${assetId}-adminUpdates-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    droppedAsset.updateDataObject({ numberAllowedToCollect, questItemImage }, { lock: { lockId }, releaseLock: true });

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      credentials,
      isPartial: true,
      uniqueName: assetId,
      urlSlug,
    });

    if (droppedAssets.length > 0) {
      const promises = droppedAssets.map((droppedAsset) => droppedAsset.updateWebImageLayers("", questItemImage));
      await Promise.all(promises);
    }

    return res.json({ success: true });
  } catch (error) {
    errorHandler({
      error,
      functionName: "updateAdminSettings",
      message: "Error updating quest items",
      req,
      res,
    });
  }
};
