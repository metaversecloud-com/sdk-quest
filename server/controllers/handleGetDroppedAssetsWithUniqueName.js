import { error, getDroppedAssetsWithUniqueName, getWorldDataObject } from "../utils/index.js";

export const handleGetDroppedAssetsWithUniqueName = async (req, res) => {
  try {
    const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;

    const world = await getWorldDataObject({ interactiveNonce, interactivePublicKey, urlSlug, visitorId }, urlSlug);
    if (!world.dataObject?.keyAssetId) throw "No dropped assets related to key asset found";

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      isPartial: true,
      uniqueName: world.dataObject?.keyAssetId,
      urlSlug,
    });

    const normalized = droppedAssets.map((asset) => {
      let normalizedAsset = { ...asset };
      delete normalizedAsset["topia"];
      delete normalizedAsset["credentials"];
      delete normalizedAsset["jwt"];
      delete normalizedAsset["requestOptions"];
      return normalizedAsset;
    });

    res.json({ droppedAssets: normalized, success: true });
  } catch (e) {
    error("Fetching dropped assets with unique name", e, res);
  }
};
