import { dropWebImageAsset } from "../utils/droppedAssets/index.js";
import { getWorldDataObject, getWorldDetails } from "../utils/world/index.js";
import { getEmbeddedAssetDetails } from "../utils/droppedAssets/index.js";
import { getVisitor, logger } from "../utils/index.js";
import error from "../utils/errors.js";
import { getStreak, getLongestStreak } from "./streaks.js";
import { DroppedAsset } from "../utils/topiaInit.js";

const randomCoord = (width, height) => {
  const x = Math.floor(Math.random() * (width / 2 - -width / 2 + 1) + -width / 2);
  const y = Math.floor(Math.random() * (height / 2 - -height / 2 + 1) + -height / 2);
  return { x, y };
};

const getBaseURL = (req) => {
  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://" + req.get("host");
};

export const getEggImage = (req, res) => {
  const { urlSlug } = req.query;
  let eggImage = "https://topiaimages.s3.us-west-1.amazonaws.com/default_egg.png";

  if (urlSlug.includes("ingda")) {
    eggImage = "https://topiaimages.s3.us-west-1.amazonaws.com/ingda_egg.png";
  } else if (urlSlug.includes("arva")) {
    eggImage = "https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png";
  }

  // TODO: Make this pull from data objects so matches what will be dropped
  if (res) res.json({ eggImage, success: true });
  return eggImage;
};

export const createEgg = async (req, res) => {
  try {
    const world = await getWorldDetails({ ...req, body: { ...req.body, includeDataObject: true } });
    // Randomly place the egg
    const position = randomCoord(world.width, world.height);
    const eggBody = { ...req.body, isInteractive: true, position, layers: { top: getEggImage(req) } };

    // Check if world already has an egg image set.
    const worldDataObject = world.dataObject;
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

    egg.updateClickType({
      clickType: "link",
      clickableLinkTitle: "Quest",
      isOpenLinkInDrawer: true,
      clickableLink: getBaseURL(req) + "/egg-clicked/" + `?lastMoved=${new Date().valueOf()}`,
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
    const numberAllowedToCollect = 5; // TODO: Make it so admins can change this
    if (worldDataObject) {
      const { eggsCollectedByUser } = worldDataObject;
      //YYYY_MM_DD
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so we add 1
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateKey = `${year}_${month}_${day}`;
      // world.setDataObject({});
      //TODO: Add lock to updateDataObject to prevent duplicates?
      // dateKey_req.params.assetId_req.params.visitorId_req.params.interactiveNonce?
      if (
        eggsCollectedByUser &&
        eggsCollectedByUser[visitor.profileId] &&
        eggsCollectedByUser[visitor.profileId][dateKey] &&
        eggsCollectedByUser[visitor.profileId][dateKey].length >= numberAllowedToCollect
      ) {
        console.log("Fail");
        // FAIL: Visitor has already collected 3 eggs today.
        if (res) res.json({ addedClick: false, numberAllowedToCollect, success: true });
        return;
      } else {
        // Move the egg to a new random location
        const position = randomCoord(world.width, world.height);

        const { assetId, interactivePublicKey, interactiveNonce, urlSlug, visitorId } = req.query;

        // Doesn't need an await as it's just instantiating an instance from class.
        const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
          credentials: {
            assetId,
            interactiveNonce,
            interactivePublicKey,
            visitorId,
          },
        });

        try {
          await droppedAsset.updatePosition(position.x, position.y);
          droppedAsset.updateClickType({
            clickType: "link",
            clickableLinkTitle: "Quest",
            isOpenLinkInDrawer: true,
            clickableLink: getBaseURL(req) + "/egg-clicked/" + `?lastMoved=${new Date().valueOf()}`,
          });

          // Add egg collected to leaderboard
          let collectedArray = [];
          if (
            eggsCollectedByUser &&
            eggsCollectedByUser[visitor.profileId] &&
            eggsCollectedByUser[visitor.profileId][dateKey]
          ) {
            collectedArray = eggsCollectedByUser[visitor.profileId][dateKey];
          }

          collectedArray.push({ type: "egg", value: 1 });
          // SUCCESS: This is the first egg visitor collected today.
          // console.log(`${visitor.username} ${visitor.profileId} successfully got`, collectedArray);
          await world.updateDataObject({
            eggsCollectedByUser: { [visitor.profileId]: { [dateKey]: collectedArray } }, // Add egg collection dateKey.
            profileMapper: { [visitor.profileId]: visitor.username }, // Update the username of the visitor to be shown in the leaderboard.
          });

          visitor.updateDataObject({
            eggsCollectedByWorld: { [world.urlSlug]: { [dateKey]: collectedArray } }, // Add egg collection dateKey.
          });
          if (res)
            res.json({
              addedClick: true,
              numberAllowedToCollect,
              numberCollected: collectedArray.length,
              success: true,
            });
          return;
        } catch (error) {
          logger.error({
            error,
            message: "Updating dropped asset update position, click type, and world/visitor data object",
            functionname: "eggClicked",
            req,
          });
          // error("Updating dropped asset update position, click type, and world/visitor data object", e);
        }
      }
    }
  } catch (e) {
    error("Handling click", e, res);
  }
};

export const getEggLeaderboard = async (req, res) => {
  try {
    const worldDataObject = await getWorldDataObject(req);
    let leaderboard = [];
    if (worldDataObject) {
      const { eggsCollectedByUser, profileMapper } = worldDataObject;
      if (eggsCollectedByUser) {
        for (const profileId in eggsCollectedByUser) {
          // const streak = getStreak(eggsCollectedByUser[profileId]);
          const longestStreak = getLongestStreak(eggsCollectedByUser[profileId]);
          let collected = 0;
          // const objValues = Object.values(eggsCollectedByUser[profileId]);
          Object.values(eggsCollectedByUser[profileId]).forEach((day) => {
            if (day === true) collected++;
            if (day.length) collected += day.length;
          });

          leaderboard.push({
            name: profileMapper[profileId],
            collected,
            profileId,
            streak: longestStreak,
          });
        }
        // leaderboard.push({ profileId: "blah", name: "Flood", collected: 20 });
        // leaderboard.push({ profileId: "blah", name: "Michael", collected: 50 });
        // leaderboard.push({ profileId: "blah", streak: 2, name: "Ewing", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Eoin", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Eoin", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Eoin", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Eoin", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Eoin", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Eoin", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Barry", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Billy", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Bonnie", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Bowen", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Sammy", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Rose", collected: 80 });
        // leaderboard.push({ profileId: "blah", name: "Billy Bue", collected: 5 });
        // leaderboard.push({ profileId: "blah", name: "Lowell", collected: 2 });
        // leaderboard.push({ profileId: "blah", name: "Lina", collected: 3 });
        // leaderboard.push({ profileId: "blah", name: "Chris", collected: 6 });
        // leaderboard.push({ profileId: "blah", streak: 2, name: "Danielle", collected: 9 });
        // leaderboard.push({ profileId: "blah", streak: 4, name: "Sam", collected: 10 });
        // leaderboard.push({ profileId: "blah", name: "Bryan", collected: 7 });
        // leaderboard.push({ profileId: "blah", name: "Ewing", collected: 8 });
        // leaderboard.push({ profileId: "blah", name: "Fabio", collected: 12 });
        // leaderboard.push({ profileId: "blah", name: "Jesus", collected: 13 });
        // leaderboard.push({ profileId: "blah", name: "Saqib", collected: 14 });
        // leaderboard.push({ profileId: "blah", name: "Taveras", collected: 15 });
        // leaderboard.push({ profileId: "blah", name: "Rex", collected: 16 });
        // leaderboard.push({ profileId: "blah", name: "Juan Pablo", collected: 17 });
        // leaderboard.push({ profileId: "blah", name: "Anna", collected: 18 });
        // leaderboard.push({ profileId: "blah", name: "James", collected: 19 });
        // leaderboard.push({ profileId: "blah", name: "Alex", collected: 20 });
        // leaderboard.push({ profileId: "blah", name: "Dalton", collected: 21 });
      }
      leaderboard.sort((a, b) => b.collected - a.collected);
    }
    if (res) res.json({ leaderboard, success: true });
  } catch (e) {
    error("Getting leaderboard", e, res);
  }
};
