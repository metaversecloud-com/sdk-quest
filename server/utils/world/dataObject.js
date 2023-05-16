import { World } from "../topiaInit.js";
import error from "../errors.js";

export const getWorldDataObject = async (req, res) => {
  try {
    const { urlSlug } = req.query;
    const world = World.create(urlSlug, { credentials: req.query });
    await world.fetchDataObject();
    if (res) res.json({ dataObject: world.dataObject, success: true });
    return world.dataObject;
  } catch (e) {
    error("Error getting world details", e, res);
  }
};

export const updateWorldDataObject = async (req, res) => {
  const { dataObject } = req.body;
  try {
    const { urlSlug } = req.query;
    const world = World.create(urlSlug, { credentials: req.query });
    await world.updateDataObject(dataObject);
    if (res) res.json({ dataObject, success: true });
    return dataObject;
  } catch (e) {
    error("Updating world data object", e, res);
  }
};

export const incrementWorldDataObjectValue = async (req, res) => {
  const { path, amount } = req.body;
  try {
    const { urlSlug } = req.query;
    const world = World.create(urlSlug, { credentials: req.query });
    // Can also pass in a lock object as third argument of type
    // { lockId: string, releaseLock?: boolean }
    await world.incrementDataObjectValue(path, amount);
    if (res) res.json({ success: true });
    return;
  } catch (e) {
    error("Incrementing world data object", e, res);
  }
};
