import { getDefaultKeyAssetImage, getWorldDataObject } from "../utils/index.js";

export const handleGetKeyAssetImage = async (req, res) => {
  try {
    const { interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const world = await getWorldDataObject({ interactiveNonce, interactivePublicKey, urlSlug, visitorId }, urlSlug);
    const keyAssetImage = world.dataObject?.questItemImage || getDefaultKeyAssetImage(urlSlug);
    return res.json({ keyAssetImage, success: true });
  } catch (e) {
    error("Fetching dropped assets with unique name", e, res);
  }
};
