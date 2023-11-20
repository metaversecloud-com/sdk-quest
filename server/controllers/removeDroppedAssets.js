import { DroppedAsset } from "../utils/topiaInit.js";
import { errorHandler } from "../utils/index.js";

export const removeDroppedAsset = async (req, res) => {
  try {
    const { droppedAssetId } = req.params;
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const droppedAsset = DroppedAsset.create(droppedAssetId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    await droppedAsset.deleteDroppedAsset();
    return res.json({ success: true });
  } catch (error) {
    errorHandler({
      error,
      functionName: "removeDroppedAsset",
      message: "Error removing dropped asset",
      req,
      res,
    });
  }
};
