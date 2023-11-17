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

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    const keyAssetId = droppedAsset.uniqueName;
    const world = await getWorldDetails({
      assetId: keyAssetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    });

    if (!world.dataObject?.keyAssets[keyAssetId]) {
      throw "Key asset not found";
    }

    const questDetails = world.dataObject.keyAssets[keyAssetId];
    const { itemsCollectedByUser, numberAllowedToCollect } = questDetails;
    let numberCollected = 0;

    if (
      itemsCollectedByUser &&
      itemsCollectedByUser[profileId] &&
      itemsCollectedByUser[profileId][dateKey] &&
      itemsCollectedByUser[profileId][dateKey].count >= numberAllowedToCollect
    ) {
      console.log(`FAIL: Visitor has already collected ${numberAllowedToCollect} quest items today.`);
      return res.json({ addedClick: false, numberAllowedToCollect, success: true });
    } else {
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

      const visitor = Visitor.create(visitorId, urlSlug, {
        credentials: {
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
      });

      if (!itemsCollectedByUser[profileId]) {
        await world.updateDataObject({
          [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}`]: { [dateKey]: { count: 0 } },
        });
        numberCollected = 1;
      } else if (!itemsCollectedByUser[profileId][dateKey]) {
        await world.updateDataObject({
          [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.${dateKey}`]: { count: 0 },
        });
        numberCollected = 1;
      } else {
        numberCollected = itemsCollectedByUser[profileId][dateKey].count + 1;
      }

      await Promise.all([
        visitor.incrementDataObjectValue([`itemsCollectedByWorld.${world.urlSlug}.${keyAssetId}.${dateKey}.count`], 1),
        world.incrementDataObjectValue([`keyAssets.${keyAssetId}.totalItemsCollected.count`], 1),
        world.incrementDataObjectValue(
          [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.${dateKey}.count`],
          1,
        ),
        world.incrementDataObjectValue([`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.total`], 1),
        world.incrementDataObjectValue([`keyAssets.${keyAssetId}.questItems.${assetId}.count`], 1),
        world.updateDataObject({ [`profileMapper.${profileId}`]: username }),
      ]);

      return res.json({
        addedClick: true,
        numberAllowedToCollect,
        numberCollected,
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
