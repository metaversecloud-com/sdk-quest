import { error, getWorldDataObject } from "../utils/index.js";

export const updateKeyAssetId = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;

    const world = await getWorldDataObject({ interactiveNonce, interactivePublicKey, urlSlug, visitorId }, urlSlug);

    if (!world.dataObject?.keyAssetId) {
      const lockId = `${urlSlug}-keyAssetId-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      world.updateDataObject({ keyAssetId: assetId }, { lock: { lockId } });
    }

    return res.json({ success: true });
  } catch (e) {
    error("Error updating world data object", e, res);
  }
};
