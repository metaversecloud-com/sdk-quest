import { getDroppedAssetDetails } from "./droppedAssets/getDroppedAssetDetails";

export const getDefaultKeyAssetImage = ({ assetId, urlSlug }) => {
  let keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/default_egg.png";
  if (urlSlug.includes("ingda")) {
    keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/ingda_egg.png";
  } else if (urlSlug.includes("arva")) {
    keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png";
  }

  if (assetId) {
    const droppedAsset = await getDroppedAssetDetails({
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      droppedAssetId: assetId,
      urlSlug,
    });
    if (droppedAsset.layer1) keyAssetImage = droppedAsset.layer1;
  }

  return keyAssetImage;
};
