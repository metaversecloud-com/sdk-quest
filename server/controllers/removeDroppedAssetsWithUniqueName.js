import { errorHandler, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const removeDroppedAssetsWithUniqueName = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      assetId,
      credentials,
      isPartial: false,
      urlSlug,
    });

    if (!droppedAssets || droppedAssets.length === 0) throw "No dropped assets found";
    if (droppedAssets.error) throw droppedAssets.error;

    droppedAssets.forEach((droppedAsset) => {
      try {
        droppedAsset.deleteDroppedAsset();
      } catch (error) {
        console.log("Error on delete dropped asset", e);
        return res.status(500).send({ error: error, success: false });
      }
    });
    return res.json({ success: true });
  } catch (error) {
    errorHandler({
      error,
      functionName: "removeDroppedAssetsWithUniqueName",
      message: "Error removing dropped asset by uniqueName",
      req,
      res,
    });
  }
};
