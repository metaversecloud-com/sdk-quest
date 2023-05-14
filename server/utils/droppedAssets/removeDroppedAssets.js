import { fetchDroppedAssetsUniqueName } from "./fetchDroppedAssets.js";
import error from "../errors.js";

export const removeDroppedAssetsUniqueName = async (req, res) => {
  const droppedAssets = await fetchDroppedAssetsUniqueName(req);
  if (droppedAssets && droppedAssets.length) {
    droppedAssets.forEach((droppedAsset) => {
      try {
        droppedAsset.deleteDroppedAsset();
      } catch (e) {
        console.log("Error on delete dropped asset", e);
        if (res) return res.status(500).send({ error: e, success: false });
      }
    });
    if (res) res.json({ success: true });
  } else {
    error("Removing Dropped Assets by Unique Name", { message: "No dropped assets found" }, res);
  }
};

export const removeDroppedAsset = async (req, res) => {
  const { instanceId } = req.params;
  const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  try {
    const droppedAsset = await DroppedAsset.get(instanceId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    if (!droppedAsset) throw { message: "No dropped asset found" };
    droppedAsset.deleteDroppedAsset();
    if (res) res.json({ success: true });
  } catch (e) {
    error("Removing Dropped Asset", e, res);
  }
};
