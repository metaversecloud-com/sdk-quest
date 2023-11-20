import { errorHandler, getDefaultKeyAssetImage, getWorldDataObject } from "../utils/index.js";

export const handleGetKeyAssetImage = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const world = await getWorldDataObject({
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    });

    let keyAssetImage;
    if (world.dataObject && world.dataObject?.keyAssets && world.dataObject?.keyAssets?.[assetId]) {
      keyAssetImage = world.dataObject?.keyAssets?.[assetId]?.questItemImage;
    } else {
      await getDefaultKeyAssetImage({
        credentials: {
          assetId,
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
        urlSlug,
      });
    }

    return res.json({ keyAssetImage, success: true });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleGetKeyAssetImage",
      message: "Error getting key asset image",
      req,
      res,
    });
  }
};
