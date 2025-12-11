import { World } from "../topiaInit.js";
import { Credentials } from "../../types/Credentials.js";
import { standardizedError } from "../standardizedError.js";

export const getQuestItems = async (credentials: Credentials) => {
  try {
    const { assetId, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    const world = await World.create(urlSlug, { credentials });
    const droppedAssets = await world.fetchDroppedAssetsBySceneDropId({ sceneDropId });

    const questItems = await Object.entries(droppedAssets).reduce((questItems, [key, questItem]) => {
      // @ts-ignore
      if (questItem.uniqueName?.includes("questItem")) questItems[key] = questItem;
      return questItems;
    }, {});

    return questItems;
  } catch (error) {
    return standardizedError(error);
  }
};
