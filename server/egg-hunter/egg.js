import { dropWebImageAsset, updatePosition } from "../utils/droppedAssets/index.js";
import { getWorldDataObject, getWorldDetails } from "../utils/world/index.js";
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
    const eggBody = { ...req.body, isInteractive: true, position, layers: { top: process.env.DEFAULT_EGG_IMAGE_URL } };

    // Check if world already has an egg image set.
    const worldDataObject = world.dataObject;
    console.log(worldDataObject);
    if (worldDataObject && worldDataObject.eggDetails && worldDataObject.eggDetails.topLayer)
      eggBody.layers.top = worldDataObject.eggDetails.topLayer;
    else {
      // If egg image not set in world data object, check the embedded asset
      const embeddedAsset = await getEmbeddedAssetDetails({ ...req, body: { ...req.body, includeDataObject: true } });
      const assetDataObject = embeddedAsset.dataObject;
      if (assetDataObject && assetDataObject.eggDetails && assetDataObject.eggDetails.topLayer) {
        eggBody.layers.top = assetDataObject.eggDetails.topLayer;
        // If the embedded asset has egg details, add those egg details to the world data object.
        world.updateDataObject({ eggDetails: assetDataObject.eggDetails });
      }
    }

    const egg = await dropWebImageAsset({ ...req, body: eggBody });
    if (res) res.json({ egg, success: true });
    egg.updateClickType({
      clickType: "link",
      clickableLinkTitle: "Egg Hunter",
      isOpenLinkInDrawer: true,
      clickableLink: "http://localhost:3000/egg-clicked/",
      // clickableLink: "https://nytimes.com/",
    });
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
      // world.setDataObject({});
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
        await world.updateDataObject({
          eggsCollectedByUser: { [visitor.profileId]: { [dateKey]: true } }, // Add egg collection dateKey.
          profileMapper: { [visitor.profileId]: visitor.username }, // Update the username of the visitor to be shown in the leaderboard.
        });
        // Move the egg to a new random location
        const position = randomCoord(world.width, world.height);
        await updatePosition({ ...req, body: { position } });
        visitor.updateDataObject({
          eggsCollectedByWorld: { [world.urlSlug]: { [dateKey]: true } }, // Add egg collection dateKey.
        });
        if (res) res.json({ addedClick: true, success: true });
        return;
      }
    }
    if (res) res.json({ addedClick: true, success: true });
  } catch (e) {
    error("Handling egg click", e, res);
  }
};

export const getEggLeaderboard = async (req, res) => {
  try {
    const worldDataObject = await getWorldDataObject(req);
    let leaderboard = [];
    if (worldDataObject) {
      console.log("Object", worldDataObject);
      const { eggsCollectedByUser, profileMapper } = worldDataObject;
      for (const profileId in eggsCollectedByUser) {
        leaderboard.push({
          name: profileMapper[profileId],
          collected: Object.keys(eggsCollectedByUser[profileId]).length,
          profileId,
          streak: getStreak(eggsCollectedByUser[profileId]),
        });
      }
      leaderboard.push({ profileId: "blah", name: "Flood", collected: 20 });
      leaderboard.push({ profileId: "blah", name: "Michael", collected: 50 });
      leaderboard.push({ profileId: "blah", name: "Eoin", collected: 10 });
      leaderboard.push({ profileId: "blah", name: "Rose", collected: 80 });
      leaderboard.push({ profileId: "blah", name: "Billy Bue", collected: 5 });
      leaderboard.push({ profileId: "blah", name: "Lowell", collected: 2 });
      leaderboard.push({ profileId: "blah", name: "Lina", collected: 3 });
      leaderboard.push({ profileId: "blah", name: "Chris", collected: 6 });
      leaderboard.push({ profileId: "blah", name: "Danielle", collected: 9 });
      leaderboard.push({ profileId: "blah", name: "Sam", collected: 10 });
      leaderboard.push({ profileId: "blah", name: "Bryan", collected: 7 });
      leaderboard.push({ profileId: "blah", name: "Ewing", collected: 8 });
      leaderboard.push({ profileId: "blah", name: "Fabio", collected: 12 });
      leaderboard.push({ profileId: "blah", name: "Jesus", collected: 13 });
      leaderboard.push({ profileId: "blah", name: "Saqib", collected: 14 });
      leaderboard.push({ profileId: "blah", name: "Taveras", collected: 15 });
      leaderboard.push({ profileId: "blah", name: "Rex", collected: 16 });
      leaderboard.push({ profileId: "blah", name: "Juan Pablo", collected: 17 });
      leaderboard.push({ profileId: "blah", name: "Anna", collected: 18 });
      leaderboard.push({ profileId: "blah", name: "James", collected: 19 });
      leaderboard.push({ profileId: "blah", name: "Alex", collected: 20 });
      leaderboard.push({ profileId: "blah", name: "Dalton", collected: 21 });
    }
    leaderboard.sort((a, b) => b.collected - a.collected);

    if (res) res.json({ leaderboard, success: true });
  } catch (e) {
    error("Getting egg leaderboard", e, res);
  }
};

function getStreak(data) {
  let currentDate = new Date();
  let streak = 0;

  while (true) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so we add 1
    const day = String(currentDate.getDate()).padStart(2, "0");

    const key = `${year}_${month}_${day}`;

    if (data[key]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Go to the previous day
    } else {
      break; // End the loop when we find a day that doesn't exist in the data
    }
  }

  return streak;
}

export const getEggImage = async (req, res) => {
  // TODO: Make this pull from data objects so matches what will be dropped
  if (res) res.json({ eggImage: process.env.DEFAULT_EGG_IMAGE_URL, success: true });
};
