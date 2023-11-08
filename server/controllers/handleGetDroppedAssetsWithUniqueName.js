import { error, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const handleGetDroppedAssetsWithUniqueName = async (req, res) => {
  const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;
  const { isPartial, uniqueName } = req.body;

  try {
    const droppedAssets = await getDroppedAssetsWithUniqueName({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      isPartial,
      uniqueName,
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
