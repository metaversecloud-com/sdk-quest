import { World } from '../topiaInit.js';
import { getDroppedAssetDetails } from './getDroppedAssetDetails.js';
import { errorHandler } from '../errorHandler.js';

export const getQuestItems = async (credentials) => {
  try {
    const { assetId, urlSlug } = credentials;

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
    });
    const uniqueName = droppedAsset.uniqueName || "Quest"

    const world = await World.create(urlSlug, { credentials });
    const droppedAssets = await world.fetchDroppedAssetsBySceneDropId({
      sceneDropId: `${assetId}_${uniqueName}`,
    })

    const questItems = await Object.entries(droppedAssets).reduce((questItems, [key, questItem]) => {
      if (questItem.uniqueName.includes("questItem")) questItems[key] = questItem;
      return questItems;
    }, {})

    return questItems;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetQuestItems",
      message: "Error fetching Quest items",
    });
  }
};
