import { getDroppedAssetDetails } from "./droppedAssets/getDroppedAssetDetails.js";

export const getDefaultKeyAssetImage = async ({ credentials, urlSlug }) => {
  let keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/default_egg.png";
  if (urlSlug.includes("ingda")) {
    keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/ingda_egg.png";
  } else if (urlSlug.includes("arva")) {
    keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png";
  }

  if (credentials) {
    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: credentials.assetId,
      urlSlug,
    });
    if (droppedAsset.topLayerURL) keyAssetImage = droppedAsset.topLayerURL;
    if (droppedAsset.layer1) keyAssetImage = droppedAsset.layer1;
  }

  return keyAssetImage;
};
