import { DroppedAsset } from "../utils/topiaInit.js";
import { error, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const removeDroppedAssetsWithUniqueName = async (req, res) => {
  try {
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

    if (!droppedAssets || droppedAssets.length === 0) throw "No dropped assets found";
    if (droppedAssets.error) throw droppedAssets.error;

    droppedAssets.forEach((droppedAsset) => {
      try {
        droppedAsset.deleteDroppedAsset();
      } catch (e) {
        console.log("Error on delete dropped asset", e);
        return res.status(500).send({ error: e, success: false });
      }
    });
    res.json({ success: true });
  } catch (e) {
    error("Removing Dropped Asset by Unique Name", e, res);
  }
};

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
