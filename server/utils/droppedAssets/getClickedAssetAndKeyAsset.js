import { errorHandler } from "../index.js";
import { getDroppedAssetDetails } from "./getDroppedAssetDetails.js";

export const getClickedAssetAndKeyAsset = async (credentials) => {
  try {
    const { assetId } = credentials;
    let keyAsset;

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
    });

    if (!droppedAsset.dataObject?.keyAssetId && !droppedAsset.dataObject?.keyAssetUniqueName) {
      throw "Key asset not found in data object";
    } else if (droppedAsset.dataObject?.keyAssetId) {
      keyAsset = await getDroppedAssetDetails({
        credentials,
        droppedAssetId: droppedAsset.dataObject.keyAssetId,
      });
    } else {
      keyAsset = await getDroppedAssetDetails({
        credentials,
        uniqueName: droppedAsset.dataObject.keyAssetUniqueName,
        shouldInitDataObject: true,
      });
    }

    if (!keyAsset.id) throw "Key asset not found";

    return { droppedAsset, keyAsset };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getClickedAssetAndKeyAsset",
      message: "Error getting clicked asset and key asset",
    });
  }
};
