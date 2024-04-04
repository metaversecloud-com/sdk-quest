import { World } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { initializeWorldDataObject } from "./initializeWorldDataObject.js";
import { Credentials, DataObjectType } from '../../types/index.js';

type WorldDataObject = {
  scenes: {
    [key: string]: DataObjectType
  },
}

export const getWorldDetails = async (credentials: Credentials) => {
  try {
    const { assetId, urlSlug } = credentials
    const sceneDropId = credentials.sceneDropId || assetId

    const world = World.create(urlSlug, { credentials });
    await world.fetchDetails();
    await world.fetchDataObject();

    await initializeWorldDataObject({ credentials, world });

    let dataObject = world.dataObject as WorldDataObject;

    if (!dataObject?.scenes?.[sceneDropId]) {
      await world.fetchDataObject();
      dataObject = world.dataObject as WorldDataObject;
    }

    return { dataObject: dataObject.scenes?.[sceneDropId], world };
  } catch (error) {
    return errorHandler({ error, functionName: "getWorldDetails", message: "Error getting world details" });
  }
};
