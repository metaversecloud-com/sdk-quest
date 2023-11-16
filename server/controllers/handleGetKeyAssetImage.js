import { getDefaultKeyAssetImage, getWorldDataObject } from "../utils/index.js";

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

    const keyAssetImage = world.dataObject?.questItemImage || getDefaultKeyAssetImage(urlSlug);
    return res.json({ keyAssetImage, success: true });
  } catch (e) {
    error("Fetching dropped assets with unique name", e, res);
  }
};
