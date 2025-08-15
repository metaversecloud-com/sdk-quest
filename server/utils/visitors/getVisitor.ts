import { VisitorInterface } from "@rtsdk/topia";
import { Visitor } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { Credentials } from "../../types/Credentials.js";
import { UserDataObjectType } from "../../types/DataObjectTypes.js";

export const getVisitor = async (credentials: Credentials) => {
  try {
    const { sceneDropId, urlSlug, visitorId } = credentials;

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

    return { visitor, visitorProgress };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getVisitor",
      message: "Error getting visitor",
    });
  }
};
