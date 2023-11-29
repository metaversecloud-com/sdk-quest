import {
  errorHandler,
  getBaseURL,
  getDroppedAssetDetails,
  getRandomCoordinates,
  getVisitor,
  getWorldDetails,
} from "../utils/index.js";

export const handleQuestItemClicked = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, profileId, urlSlug, username, visitorId } = req.query;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so we add 1
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateKey = `${year}_${month}_${day}`;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const droppedAsset = await getDroppedAssetDetails({
      credentials,
      droppedAssetId: assetId,
      urlSlug,
    });

    if (!droppedAsset.uniqueName) throw "Key asset not found";
    const keyAssetUniqueName = droppedAsset.uniqueName.slice(-20);

    const [keyAsset, world] = await Promise.all([
      getDroppedAssetDetails({
        credentials,
        droppedAssetId: keyAssetUniqueName,
        isKeyAsset: true,
        urlSlug,
      }),
      getWorldDetails({
        credentials,
        urlSlug,
      }),
    ]);
    const keyAssetId = keyAsset.id;

    if (
      !keyAsset.dataObject?.numberAllowedToCollect ||
      !world.dataObject?.keyAssets?.[keyAssetId]?.itemsCollectedByUser
    ) {
      throw "Key asset not found";
    }

    const itemsCollectedByUser = world.dataObject?.keyAssets?.[keyAssetId]?.itemsCollectedByUser;
    const numberAllowedToCollect = keyAsset.dataObject?.numberAllowedToCollect;
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

      if (!itemsCollectedByUser?.[profileId]) {
        await world.updateDataObject({
          [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}`]: { [dateKey]: { count: 1 } },
        });
        numberCollected = 1;
      } else if (!itemsCollectedByUser?.[profileId]?.[dateKey]) {
        await world.updateDataObject({
          [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.${dateKey}`]: { count: 1 },
        });
        numberCollected = 1;
      } else {
        await world.incrementDataObjectValue(
          [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.${dateKey}.count`],
          1,
        );
        numberCollected = itemsCollectedByUser[profileId][dateKey].count + 1;
      }

      const visitor = await getVisitor({
        credentials,
        urlSlug,
        visitorId,
      });

      await Promise.all([
        visitor.incrementDataObjectValue([`itemsCollectedByWorld.${world.urlSlug}.count`], 1),
        world.incrementDataObjectValue([`keyAssets.${keyAssetId}.totalItemsCollected.count`], 1),
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
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleQuestItemClicked",
      message: "Error updating dropped asset update position, click type, and world/visitor data object",
      req,
      res,
    });
  }
};
