import { dropWebImageAsset } from "../utils/droppedAssets/index.js";
import { getWorldDetails } from "../utils/world/index.js";

export const createEgg = async (req, res) => {
  const { urlSlug } = req.query;
  const { id, isInteractive, position, uniqueName } = req.body;

  // position
  // layers
  try {
    const worldDetails = await getWorldDetails({ ...req, body: { ...body, includeDataObject: true } });
    const egg = await dropWebImageAsset({ ...req, body: { ...body, isInteractive: true } });

    if (res) res.json({ egg, success: true });
  } catch (e) {
    error("Error dropping asset", e, res);
  }
};
