import { dropWebImageAsset } from "../utils/droppedAssets/index.js";
import { getWorldDetails } from "../utils/world/index.js";
import { getEmbeddedAssetDetails } from "../utils/droppedAssets/index.js";
import error from "../utils/errors.js";

export const createEgg = async (req, res) => {
  try {
    const world = await getWorldDetails({ ...req, body: { ...req.body, includeDataObject: true } });
    // Randomly place the egg
    const randomCoord = (width, height) => {
      const x = Math.floor(Math.random() * (width / 2 - -width / 2 + 1) + -width / 2);
      const y = Math.floor(Math.random() * (height / 2 - -height / 2 + 1) + -height / 2);
      return { x, y };
    };
    const position = randomCoord(world.width, world.height);
    const eggBody = { ...req.body, isInteractive: true, position };

    // Check if world already has an egg image set.
    const worldDataObject = world.dataObject;
    if (worldDataObject && worldDataObject.eggDetails && worldDataObject.eggDetails.topLayer)
      eggBody.top = worldDataObject.eggDetails.topLayer;
    else {
      // If egg image not set in world data object, check the embedded asset
      const embeddedAsset = await getEmbeddedAssetDetails({ ...req, body: { ...req.body, includeDataObject: true } });
      const assetDataObject = embeddedAsset.dataObject;
      if (assetDataObject && assetDataObject.eggDetails && assetDataObject.eggDetails.topLayer) {
        eggBody.top = assetDataObject.eggDetails.topLayer;
        // If the embedded asset has egg details, add those egg details to the world data object.
        world.updateDataObject({ eggDetails: assetDataObject.eggDetails });
      } else {
        eggBody.top = process.env.DEFAULT_EGG_IMAGE_URL;
      }
    }

    const egg = await dropWebImageAsset({ ...req, body: eggBody });
    egg.updateClickType({
      clickType: "link",
      clickableLink: "localhost:3000/egg-clicked",
    });

    if (res) res.json({ egg, success: true });
  } catch (e) {
    error("Error dropping asset", e, res);
  }
};
