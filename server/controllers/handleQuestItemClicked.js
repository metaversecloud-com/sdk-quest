import { DroppedAsset, Visitor } from "../utils/topiaInit.js";
import { error, getBaseURL, getRandomCoordinates, getWorldDetails, logger } from "../utils/index.js";

export const handleQuestItemClicked = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, profileId, urlSlug, username, visitorId } = req.query;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so we add 1
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateKey = `${year}_${month}_${day}`;

    const world = await getWorldDetails({
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      includeDataObject: true,
      urlSlug,
    });

    let { eggsCollectedByUser, itemsCollectedByUser, numberAllowedToCollect = 5 } = world.dataObject;
    if (eggsCollectedByUser) itemsCollectedByUser = eggsCollectedByUser;

    if (
      itemsCollectedByUser &&
      itemsCollectedByUser[profileId] &&
      itemsCollectedByUser[profileId][dateKey] &&
      itemsCollectedByUser[profileId][dateKey].length >= numberAllowedToCollect
    ) {
      console.log(`FAIL: Visitor has already collected ${numberAllowedToCollect} quest items today.`);
      return res.json({ addedClick: false, numberAllowedToCollect, success: true });
    } else {
      const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
        credentials: {
          assetId,
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
      });

      // Move the quest item to a new random location
      const position = getRandomCoordinates(world.width, world.height);

      await Promise.all([
        droppedAsset.updatePosition(position.x, position.y),
        droppedAsset.updateClickType({
          clickType: "link",
          clickableLinkTitle: "Quest",
          isOpenLinkInDrawer: true,
          clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
        }),
      ]);

      // Add quest item collected to leaderboard
      let collectedArray = [];
      if (itemsCollectedByUser && itemsCollectedByUser[profileId] && itemsCollectedByUser[profileId][dateKey]) {
        collectedArray = itemsCollectedByUser[profileId][dateKey];
      }
      collectedArray.push({ type: "questItem", value: 1 });

      const visitor = Visitor.create(visitorId, urlSlug, {
        credentials: {
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
      });

      const visitorLockId = `${visitorId}-${assetId}-itemsCollectedByWorld-${new Date(
        Math.round(new Date().getTime() / 60000) * 60000,
      )}`;
      const worldLockId = `${urlSlug}-${assetId}-itemsCollectedByUser-${new Date(
        Math.round(new Date().getTime() / 60000) * 60000,
      )}`;
      await Promise.all([
        visitor.updateDataObject(
          {
            itemsCollectedByWorld: { [world.urlSlug]: { [dateKey]: collectedArray } }, // Add quest item collection dateKey.
          },
          { lock: { lockId: visitorLockId } },
        ),
        world.updateDataObject(
          {
            itemsCollectedByUser: { [profileId]: { [dateKey]: collectedArray } }, // Add quest item collection dateKey.
            profileMapper: { [profileId]: username }, // Update the username of the visitor to be shown in the leaderboard.
          },
          { lock: { lockId: worldLockId } },
        ),
      ]);

      return res.json({
        addedClick: true,
        numberAllowedToCollect,
        numberCollected: collectedArray.length,
        success: true,
      });
    }
  } catch (e) {
    error("Handling quest item click", e, res);
    logger.error({
      error,
      message: "Updating dropped asset update position, click type, and world/visitor data object",
      functionName: "handleQuestItemClicked",
      req,
    });
  }
};
