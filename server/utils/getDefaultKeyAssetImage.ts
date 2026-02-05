import { standardizeError } from "./standardizeError.js";

export const getDefaultKeyAssetImage = async (urlSlug: string) => {
  try {
    let questItemImage = "https://topiaimages.s3.us-west-1.amazonaws.com/default_egg.png";
    if (urlSlug.includes("ingda")) {
      questItemImage = "https://topiaimages.s3.us-west-1.amazonaws.com/ingda_egg.png";
    } else if (urlSlug.includes("arva")) {
      questItemImage = "https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png";
    }

    return questItemImage;
  } catch (error) {
    return standardizeError(error);
  }
};
