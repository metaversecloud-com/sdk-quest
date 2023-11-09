import { DroppedAsset } from "../topiaInit.js";
import { error } from "../error.js";

export const getDroppedAssetDetails = async ({ credentials, droppedAssetId, includeDataObject, urlSlug }) => {
  try {
    const droppedAsset = await DroppedAsset.get(droppedAssetId, urlSlug, {
      credentials,
    });
    if (includeDataObject) await droppedAsset.fetchDataObject();
    return droppedAsset;
  } catch (e) {
    error("Getting dropped asset and data object", e);
  }
};
