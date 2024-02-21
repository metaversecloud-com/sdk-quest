import {
  errorHandler,
  getBaseURL,
  getClickedAssetAndKeyAsset,
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
      urlSlug,
      visitorId,
    };

    const { droppedAsset, keyAsset } = await getClickedAssetAndKeyAsset(credentials);
    const keyAssetId = keyAsset.id;

    const world = await getWorldDetails({
      credentials: { ...credentials, assetId: keyAssetId },
      urlSlug,
    });

    if (
      !keyAsset.dataObject?.numberAllowedToCollect ||
      !world.dataObject?.keyAssets?.[keyAssetId]?.itemsCollectedByUser
    ) {
      throw "Data objects not found";
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
      console.log(`Visitor has already collected ${numberAllowedToCollect} quest items today.`);
      return res.json({ addedClick: false, numberAllowedToCollect, success: true });
    } else {
      // Move the quest item to a new random location
      const promises = [];
      const position = getRandomCoordinates(world.width, world.height);

      promises.push(droppedAsset.updatePosition(position.x, position.y));
      promises.push(
        droppedAsset.updateClickType({
          clickType: "link",
          clickableLinkTitle: "Quest",
          isOpenLinkInDrawer: true,
          clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
        }),
      );

      if (!itemsCollectedByUser?.[profileId]) {
        // first time user has interacted with Quest ever
        promises.push(
          world.updateDataObject({
            [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}`]: { [dateKey]: { count: 1 }, total: 1 },
            [`profileMapper.${profileId}`]: username,
          }),
        );
        numberCollected = 1;
      } else if (!itemsCollectedByUser?.[profileId]?.[dateKey]) {
        // first time user has interacted with Quest on this day
        promises.push(
          world.updateDataObject({
            [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.${dateKey}`]: { count: 1 },
            [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.total`]:
              itemsCollectedByUser[profileId].total + 1,
          }),
        );
        numberCollected = 1;
      } else {
        promises.push(
          world.incrementDataObjectValue(
            [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.${dateKey}.count`],
            1,
          ),
        );
        promises.push(
          world.incrementDataObjectValue([`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.total`], 1),
        );
        numberCollected = itemsCollectedByUser[profileId][dateKey].count + 1;
      }

      const visitor = await getVisitor({
        credentials,
        urlSlug,
        visitorId,
      });
      promises.push(visitor.incrementDataObjectValue([`itemsCollectedByWorld.${world.urlSlug}.count`], 1));

      promises.push(world.incrementDataObjectValue([`keyAssets.${keyAssetId}.totalItemsCollected.count`], 1));
      promises.push(world.incrementDataObjectValue([`keyAssets.${keyAssetId}.questItems.${assetId}.count`], 1));

      await Promise.all(promises);

      return res.json({
        addedClick: true,
        numberAllowedToCollect,
        numberCollected,
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return errorHandler({
      error,
      functionName: "handleQuestItemClicked",
      message: "Error updating dropped asset update position, click type, and world/visitor data object",
      req,
      res,
    });
  }
};
