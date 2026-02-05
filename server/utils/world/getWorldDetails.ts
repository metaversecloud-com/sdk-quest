import { World } from "../topiaInit.js";
import { initializeWorldDataObject } from "./initializeWorldDataObject.js";
import { Credentials, WorldDataObjectType } from "../../types/index.js";
import { standardizeError } from "../standardizeError.js";
import { WorldInterface } from "@rtsdk/topia";

type WorldDataObject = {
  scenes: {
    [key: string]: WorldDataObjectType;
  };
};

interface WorldType extends WorldInterface {
  dataObject: WorldDataObject;
}

export const getWorldDetails = async (
  credentials: Credentials,
  getDetails: boolean = true,
): Promise<{ dataObject: WorldDataObjectType; world: WorldType } | Error> => {
  try {
    const { assetId, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    const world = World.create(urlSlug, { credentials });

    if (getDetails) await world.fetchDetails();

    await initializeWorldDataObject({ credentials, world });

    // Ensure world.dataObject is defined and of correct type
    if (!world.dataObject) world.dataObject = { scenes: {} };
    const dataObject = world.dataObject as WorldDataObject;

    return { dataObject: dataObject.scenes?.[sceneDropId], world: world as WorldType };
  } catch (error) {
    return standardizeError(error);
  }
};
