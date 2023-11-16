import { error, getWorldDataObject } from "../utils/index.js";

export const handleGetWorldDataObject = async (req, res) => {
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
    return res.json({ world });
  } catch (e) {
    error("Error updating world data object", e, res);
  }
};
