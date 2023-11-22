import { errorHandler, getDroppedAssetDetails, getDefaultKeyAssetImage } from "../utils/index.js";

export const handleGetKeyAssetImage = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
      isKeyAsset: true,
      urlSlug,
    });

    let keyAssetImage;
    if (droppedAsset.dataObject && droppedAsset.dataObject?.questItemImage) {
      keyAssetImage = droppedAsset.dataObject?.questItemImage;
    } else {
      await getDefaultKeyAssetImage({
        credentials,
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
