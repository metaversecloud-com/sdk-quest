import { errorHandler, getDroppedAssetDetails, getDefaultKeyAssetImage } from "../utils/index.js";

export const handleGetKeyAssetImage = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      visitorId,
    };

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
      shouldInitDataObject: true,
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
    return errorHandler({
      error,
      functionName: "handleGetKeyAssetImage",
      message: "Error getting key asset image",
      req,
      res,
    });
  }
};
