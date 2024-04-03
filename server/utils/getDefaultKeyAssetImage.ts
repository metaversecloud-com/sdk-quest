import { getDroppedAssetDetails } from "./droppedAssets/getDroppedAssetDetails.js";
import { Credentials } from '../types/Credentials';
import { errorHandler } from "./errorHandler.js";

export const getDefaultKeyAssetImage = async (credentials: Credentials) => {
  try {
    const { assetId, urlSlug } = credentials
    let keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/default_egg.png";
    if (urlSlug.includes("ingda")) {
      keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/ingda_egg.png";
    } else if (urlSlug.includes("arva")) {
      keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png";
    }

    if (credentials) {
      const droppedAsset = await getDroppedAssetDetails({
        credentials,
        droppedAssetId: assetId,
      });
      if (droppedAsset.dataObject?.questItemImage) keyAssetImage = droppedAsset.dataObject.questItemImage;
    }

    return keyAssetImage;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDefaultKeyAssetImage",
      message: "Error getting default key asset image",
    });
  }
};
