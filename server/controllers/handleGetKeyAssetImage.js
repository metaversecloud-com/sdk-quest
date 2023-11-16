import { error, getDefaultKeyAssetImage, getWorldDataObject } from "../utils/index.js";

export const handleGetKeyAssetImage = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const world = await getWorldDataObject({
      assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    });
    const keyAssetImage = world.dataObject?.keyAssets[assetId]?.questItemImage || getDefaultKeyAssetImage(urlSlug);
    return res.json({ keyAssetImage, success: true });
  } catch (e) {
    error("Error getting key asset image", e, res);
  }
};
