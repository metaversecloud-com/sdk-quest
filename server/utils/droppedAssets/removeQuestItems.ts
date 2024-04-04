import { World } from '../topiaInit.js';
import { getQuestItems } from './getQuestItems.js';
import { errorHandler } from '../errorHandler.js';
import { Credentials } from '../../types/Credentials';

export const removeQuestItems = async (credentials: Credentials) => {
  try {
    const { interactivePublicKey, urlSlug } = credentials

    const droppedAssets = await getQuestItems(credentials);

    if (Object.keys(droppedAssets).length > 0) {
      const droppedAssetIds = [];
      for (const index in droppedAssets) {
        droppedAssetIds.push(droppedAssets[index].id);
      }
      await World.deleteDroppedAssets(urlSlug, droppedAssetIds, {
        interactivePublicKey,
        interactiveSecret: process.env.INTERACTIVE_SECRET,
      });
    }

    return { success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "removeQuestItems",
      message: "Error removing Quest items",
    });
  }
};
