import { errorHandler, getDroppedAssetsWithUniqueName, getWorldDataObject } from "../utils/index.js";

export const updateAdminSettings = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const { numberAllowedToCollect, questItemImage } = req.body;

    const world = await getWorldDataObject({
      assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    });

    const lockId = `${urlSlug}-adminUpdates-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`;
    world.updateDataObject(
      {
        [`keyAssets.${assetId}.numberAllowedToCollect`]: numberAllowedToCollect,
        [`keyAssets.${assetId}.questItemImage`]: questItemImage,
      },
      { lock: { lockId }, releaseLock: true },
    );

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
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
