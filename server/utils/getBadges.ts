import { Credentials } from "../types/Credentials.js";
import { getCachedInventoryItems } from "./inventoryCache.js";
import { standardizeError } from "./standardizeError.js";

export const getBadges = async (credentials: Credentials, forceRefresh = false) => {
  try {
    const inventoryItems = await getCachedInventoryItems({ credentials, forceRefresh });

    const badges: {
      [name: string]: {
        id: string;
        name: string;
        icon: string;
        description: string;
      };
    } = {};

    // INACTIVE items are filtered at the cache layer.
    for (const item of inventoryItems) {
      const { id, name, image_path, description, type } = item;
      if (name && type === "BADGE") {
        badges[name] = {
          id: id,
          name,
          icon: image_path || "",
          description: description || "",
        };
      }
    }

    return badges;
  } catch (error) {
    return standardizeError(error);
  }
};
