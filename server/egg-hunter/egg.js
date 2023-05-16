import { dropWebImageAsset, updatePosition } from "../utils/droppedAssets/index.js";
import { getWorldDetails } from "../utils/world/index.js";
import { getEmbeddedAssetDetails } from "../utils/droppedAssets/index.js";
import { getVisitor } from "../utils/index.js";
import error from "../utils/errors.js";

const randomCoord = (width, height) => {
  const x = Math.floor(Math.random() * (width / 2 - -width / 2 + 1) + -width / 2);
  const y = Math.floor(Math.random() * (height / 2 - -height / 2 + 1) + -height / 2);
  return { x, y };
};

export const createEgg = async (req, res) => {
  try {
    const world = await getWorldDetails({ ...req, body: { ...req.body, includeDataObject: true } });
    // Randomly place the egg
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
      clickableLinkTitle: "Egg Hunter",
      isOpenLinkInDrawer: true,
      clickableLink: "http://localhost:3000/egg-clicked/",
      // clickableLink: "https://nytimes.com/",
    });

    if (res) res.json({ egg, success: true });
  } catch (e) {
    error("Error dropping asset", e, res);
  }
};

export const eggClicked = async (req, res) => {
  try {
    const visitor = await getVisitor(req);
    const world = await getWorldDetails({ ...req, body: { ...req.body, includeDataObject: true } });
    const worldDataObject = world.dataObject;
    if (worldDataObject) {
      const { eggsCollectedByUser } = worldDataObject;
      //YYYY_MM_DD
      const date = new Date();
      const dateKey = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
      if (
        eggsCollectedByUser &&
        eggsCollectedByUser[visitor.profileId] &&
        eggsCollectedByUser[visitor.profileId][dateKey]
      ) {
        // FAIL: Visitor has already collected an egg today.
        if (res) res.json({ addedClick: false, success: true });
        return;
      } else {
        // SUCCESS: This is the first egg visitor collected today.
        await world.updateDataObject({ eggsCollectedByUser: { [visitor.profileId]: { [dateKey]: true } } });
        // Move the egg to a new random location
        const position = randomCoord(world.width, world.height);
        await updatePosition({ ...req, body: { position } });
        if (res) res.json({ addedClick: true, success: true });
      }
    }
    if (res) res.json({ addedClick: true, success: true });
  } catch (e) {
    error("Handling egg click", e, res);
  }
};
