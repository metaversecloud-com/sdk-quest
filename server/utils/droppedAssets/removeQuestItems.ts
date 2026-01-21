import { World } from "../topiaInit.js";
import { getQuestItems } from "./getQuestItems.js";
import { Credentials } from "../../types/Credentials";
import { standardizeError } from "../standardizeError.js";

export const removeQuestItems = async (credentials: Credentials) => {
  try {
    const getQuestItemsResponse = await getQuestItems(credentials);
    if (getQuestItemsResponse instanceof Error) throw getQuestItemsResponse;

    const droppedAssets: Record<string, { id: string }> = getQuestItemsResponse;

    if (Object.keys(droppedAssets).length > 0) {
      const droppedAssetIds = [];
      for (const index in droppedAssets) {
        droppedAssetIds.push(droppedAssets[index].id);
      }
      await World.deleteDroppedAssets(
        credentials.urlSlug,
        droppedAssetIds,
        process.env.INTERACTIVE_SECRET!,
        credentials,
      );
    }

    return { success: true };
  } catch (error) {
    return standardizeError(error);
  }
};
