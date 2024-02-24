import { errorHandler, getDroppedAssetDetails, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const handleUpdateAdminSettings = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const { numberAllowedToCollect, questItemImage } = req.body;
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      visitorId,
    };

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
    });

    const lockId = `${assetId}-adminUpdates-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    droppedAsset.updateDataObject({ numberAllowedToCollect, questItemImage }, { lock: { lockId, releaseLock: true } });

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      assetId,
      credentials,
      isPartial: true,
      uniqueName: droppedAsset.uniqueName,
    });

    if (droppedAssets.length > 0) {
      const promises = droppedAssets.map((droppedAsset) => droppedAsset.updateWebImageLayers("", questItemImage));
      await Promise.all(promises);
    }

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateAdminSettings",
      message: "Error updating quest items",
      req,
      res,
    });
  }
};
