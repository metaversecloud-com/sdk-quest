import { World } from '../topiaInit.js';
import { errorHandler } from '../errorHandler.js';
import { Credentials } from '../../types/Credentials.js';

export const getQuestItems = async (credentials: Credentials) => {
  try {
    const { assetId, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId

    const world = await World.create(urlSlug, { credentials });
    const droppedAssets = await world.fetchDroppedAssetsBySceneDropId({ sceneDropId })

    const questItems = await Object.entries(droppedAssets).reduce((questItems, [key, questItem]) => {
      // @ts-ignore
      if (questItem.uniqueName?.includes("questItem")) questItems[key] = questItem;
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
