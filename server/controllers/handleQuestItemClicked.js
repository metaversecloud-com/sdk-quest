import { DroppedAsset, Visitor } from "../utils/topiaInit.js";
import { error, getBaseURL, getRandomCoordinates, getWorldDetails, logger } from "../utils/index.js";

export const handleQuestItemClicked = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, profileId, urlSlug, username, visitorId } = req.query;

    const world = await getWorldDetails({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      includeDataObject: true,
      urlSlug,
    });

    const worldDataObject = world.dataObject;
    const numberAllowedToCollect = 5; // TODO: Make it so admins can change this
    if (worldDataObject) {
      let { eggsCollectedByUser, itemsCollectedByUser } = worldDataObject;
      if (eggsCollectedByUser) itemsCollectedByUser = eggsCollectedByUser;
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so we add 1
      const day = String(currentDate.getDate()).padStart(2, "0");
      const dateKey = `${year}_${month}_${day}`;

      if (
        itemsCollectedByUser &&
        itemsCollectedByUser[profileId] &&
        itemsCollectedByUser[profileId][dateKey] &&
        itemsCollectedByUser[profileId][dateKey].length >= numberAllowedToCollect
      ) {
        console.log(`FAIL: Visitor has already collected ${numberAllowedToCollect} quest items today.`);
        res.json({ addedClick: false, numberAllowedToCollect, success: true });
        return;
      } else {
        // Move the quest item to a new random location
        const position = getRandomCoordinates(world.width, world.height);

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
          await droppedAsset.updateClickType({
            clickType: "link",
            clickableLinkTitle: "Quest",
            isOpenLinkInDrawer: true,
            clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
          });

          // Add quest item collected to leaderboard
          let collectedArray = [];
          if (itemsCollectedByUser && itemsCollectedByUser[profileId] && itemsCollectedByUser[profileId][dateKey]) {
            collectedArray = itemsCollectedByUser[profileId][dateKey];
          }
          collectedArray.push({ type: "questItem", value: 1 });

          // SUCCESS: This is the first quest item visitor collected today.
          await world.updateDataObject({
            itemsCollectedByUser: { [profileId]: { [dateKey]: collectedArray } }, // Add quest item collection dateKey.
            profileMapper: { [profileId]: username }, // Update the username of the visitor to be shown in the leaderboard.
          });

          const visitor = await Visitor.create(visitorId, urlSlug, {
            credentials: {
              interactiveNonce,
              interactivePublicKey,
              visitorId,
            },
          });
          visitor.updateDataObject({
            itemsCollectedByWorld: { [world.urlSlug]: { [dateKey]: collectedArray } }, // Add quest item collection dateKey.
          });

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
            functionName: "handleQuestItemClicked",
            req,
          });
        }
      }
    }
  } catch (e) {
    error("Handling quest item click", e, res);
  }
};
