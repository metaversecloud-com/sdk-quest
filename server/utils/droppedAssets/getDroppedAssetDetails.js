import { DroppedAsset } from "../topiaInit.js";
import error from "../errors.js";

export const getDroppedAssetDetails = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const { includeDataObject } = req.body;
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    if (includeDataObject) await droppedAsset.fetchDataObject();
    res.json({ droppedAsset, success: true });
  } catch (e) {
    error("Getting asset and data object", e, res);
  }
};
