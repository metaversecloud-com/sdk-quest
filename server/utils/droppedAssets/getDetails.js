import { DroppedAsset } from "../topiaInit.js";
import error from "../errors.js";

export const getEmbeddedAssetDetails = async (req, res) => {
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
    if (res) res.json({ droppedAsset, success: true });
    return droppedAsset;
  } catch (e) {
    return error("Getting asset and data object", e, res);
  }
};

export const getDroppedAssetDetails = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const { instanceId } = req.query;
    const { includeDataObject } = req.body;
    const droppedAsset = await DroppedAsset.get(instanceId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    if (includeDataObject) await droppedAsset.fetchDataObject();
    if (res) res.json({ droppedAsset, success: true });
    return droppedAsset;
  } catch (e) {
    return error("Getting asset and data object", e, res);
  }
};