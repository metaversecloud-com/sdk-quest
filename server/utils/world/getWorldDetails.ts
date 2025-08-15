import { World } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { initializeWorldDataObject } from "./initializeWorldDataObject.js";
import { Credentials, WorldDataObjectType } from "../../types/index.js";

type WorldDataObject = {
  scenes: {
    [key: string]: WorldDataObjectType;
  };
};

export const getWorldDetails = async (credentials: Credentials, getDetails: boolean = true) => {
  try {
    const { assetId, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    const world = World.create(urlSlug, { credentials });

    if (getDetails) await world.fetchDetails();

    await initializeWorldDataObject({ credentials, world });

    const dataObject = world.dataObject as WorldDataObject;

    return { dataObject: dataObject.scenes?.[sceneDropId], world };
  } catch (error) {
    return errorHandler({ error, functionName: "getWorldDetails", message: "Error getting world details" });
  }
};
