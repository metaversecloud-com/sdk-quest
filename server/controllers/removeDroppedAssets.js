import { DroppedAsset } from "../utils/topiaInit.js";
import { error, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const removeDroppedAssetsWithUniqueName = async (req, res) => {
  const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  const { uniqueName } = req.body;
  const droppedAssets = await getDroppedAssetsWithUniqueName({
    credentials: {
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    },
    isPartial: false,
    uniqueName,
    urlSlug,
  });
  if (!droppedAssets) throw "No dropped assets found";
  if (droppedAssets.error) throw droppedAssets.error;
  if (droppedAssets && droppedAssets.length) {
    droppedAssets.forEach((droppedAsset) => {
      try {
        droppedAsset.deleteDroppedAsset();
      } catch (e) {
        console.log("Error on delete dropped asset", e);
        return res.status(500).send({ error: e, success: false });
      }
    });
    res.json({ success: true });
  } else {
    error("Removing Dropped Assets by Unique Name", { message: "No dropped assets found" }, res);
  }
};

export const removeDroppedAsset = async (req, res) => {
  const { droppedAssetId } = req.params;
  const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  try {
    const droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    if (!droppedAsset) throw { message: "No dropped asset found" };
    droppedAsset.deleteDroppedAsset();
    res.json({ success: true });
  } catch (e) {
    error("Removing Dropped Asset", e, res);
  }
};
