import { DroppedAsset } from "../utils/topiaInit.js";
import { error } from "../utils/index.js";

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
    res.json({ success: true });
  } catch (e) {
    error("Removing Dropped Asset", e, res);
  }
};
