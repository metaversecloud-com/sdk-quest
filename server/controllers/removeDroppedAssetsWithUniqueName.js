import { error, getDroppedAssetsWithUniqueName, getWorldDataObject } from "../utils/index.js";

export const removeDroppedAssetsWithUniqueName = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const { uniqueName } = req.body;

    const world = await getWorldDataObject({
      assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    });

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      isPartial: true,
      uniqueName: world.dataObject?.keyAssetId || uniqueName,
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
    return res.json({ success: true });
  } catch (e) {
    error("Removing Dropped Asset by Unique Name", e, res);
  }
};
