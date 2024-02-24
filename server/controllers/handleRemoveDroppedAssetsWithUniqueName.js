import { errorHandler, getDroppedAssetsWithUniqueName, World } from "../utils/index.js";

export const handleRemoveDroppedAssetsWithUniqueName = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      visitorId,
    };

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      assetId,
      credentials,
      isPartial: false,
    });

    if (droppedAssets.error) throw droppedAssets.error;

    if (droppedAssets.length > 0) {
      const droppedAssetIds = [];
      for (const droppedAsset in droppedAssets) droppedAssetIds.push(droppedAssets[droppedAsset].id);
      await World.deleteDroppedAssets(urlSlug, droppedAssetIds, interactivePublicKey, process.env.INTERACTIVE_SECRET);
    }

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveDroppedAssetsWithUniqueName",
      message: "Error removing dropped asset by uniqueName",
      req,
      res,
    });
  }
};
