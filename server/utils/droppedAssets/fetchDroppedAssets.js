import { World } from "../topiaInit.js";
import error from "../errors.js";

export const fetchDroppedAssetsUniqueName = async (req, res) => {
  const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  const { isPartial, uniqueName } = req.body;

  try {
    const world = World.create(urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      isPartial,
      uniqueName,
    });
    const normalized = droppedAssets.map((asset) => {
      let normalizedAsset = { ...asset };
      delete normalizedAsset["topia"];
      delete normalizedAsset["credentials"];
      delete normalizedAsset["jwt"];
      delete normalizedAsset["requestOptions"];
      return normalizedAsset;
    });
    if (res) res.json({ droppedAssets: normalized, success: true });
    return droppedAssets;
  } catch (e) {
    error("Fetching dropped assets with unique name", e, res);
  }
};
