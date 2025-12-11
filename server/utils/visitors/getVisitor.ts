import { VisitorInterface } from "@rtsdk/topia";
import { Visitor } from "../topiaInit.js";
import { Credentials } from "../../types/Credentials.js";
import { UserDataObjectType } from "../../types/DataObjectTypes.js";
import { standardizedError } from "../standardizedError.js";

export const getVisitor = async (credentials: Credentials, keyAssetId: string) => {
  try {
    const { urlSlug, visitorId } = credentials;
    const sceneDropId = credentials.sceneDropId || keyAssetId;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    if (!visitor) throw "Not in world";

    await visitor.fetchDataObject();

    const dataObject = visitor.dataObject as UserDataObjectType;

    const visitorProgress = dataObject?.[`${urlSlug}-${sceneDropId}`] || {
      currentStreak: 0,
      lastCollectedDate: null,
      longestStreak: 0,
      totalCollected: 0,
      totalCollectedToday: 0,
    };

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
    if (!dataObject) {
      await visitor.setDataObject(
        {
          [`${urlSlug}-${sceneDropId}`]: visitorProgress,
        },
        { lock: { lockId, releaseLock: true } },
      );
    } else if (!dataObject[`${urlSlug}-${sceneDropId}`]) {
      await visitor.updateDataObject(
        { [`${urlSlug}-${sceneDropId}`]: visitorProgress },
        { lock: { lockId, releaseLock: true } },
      );
    }

    await visitor.fetchInventoryItems();
    let visitorInventory: { [key: string]: { id: string; icon: string; name: string } } = {};

    for (const item of visitor.inventoryItems) {
      // @ts-ignore
      const { id, name = "", image_url } = item;

      visitorInventory[name] = {
        id,
        icon: image_url,
        name,
      };
    }

    return { visitor, visitorProgress, visitorInventory };
  } catch (error) {
    return standardizedError(error);
  }
};
