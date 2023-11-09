export const getKeyAssetImage = (urlSlug) => {
  let keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/default_egg.png";
  if (urlSlug.includes("ingda")) {
    keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/ingda_egg.png";
  } else if (urlSlug.includes("arva")) {
    keyAssetImage = "https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png";
  }
  return keyAssetImage;
};
