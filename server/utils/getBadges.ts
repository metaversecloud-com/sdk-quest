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

    for (const item of inventoryItems) {
      const { id, name, image_path, description, type, status } = item;
      if (name && type === "BADGE" && status === "ACTIVE") {
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
