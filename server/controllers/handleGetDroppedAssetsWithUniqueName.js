import { errorHandler, getDroppedAssetsWithUniqueName } from "../utils/index.js";

export const handleGetDroppedAssetsWithUniqueName = async (req, res) => {
  try {
    const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;

    const droppedAssets = await getDroppedAssetsWithUniqueName({
      assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      isPartial: true,
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

    return res.json({ droppedAssets: normalized, success: true });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleGetDroppedAssetsWithUniqueName",
      message: "Error fetching dropped assets with unique name",
      req,
      res,
    });
  }
};
