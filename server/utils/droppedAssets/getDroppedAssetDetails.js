import { DroppedAsset } from "../topiaInit.js";
import { error } from "../error.js";

export const getDroppedAssetDetails = async ({ credentials, droppedAssetId, urlSlug }) => {
  try {
    const droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, {
      credentials,
    });
    return droppedAsset;
  } catch (e) {
    error("Getting dropped asset and data object", e);
  }
};
