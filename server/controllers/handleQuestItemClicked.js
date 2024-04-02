import {
  errorHandler,
  getBaseURL,
  getClickedAssetAndKeyAsset,
  getCredentials,
  getDifferenceInDays,
  getLongestStreak,
  getRandomCoordinates,
  getVisitor,
  getWorldDetails,
} from "../utils/index.js";

export const handleQuestItemClicked = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, urlSlug, username, visitorId } = credentials;

    const now = new Date();
    const localDateString = now.toLocaleDateString();
    const currentDate = new Date(localDateString);
    currentDate.setHours(0, 0, 0, 0);

    const analytics = [];

    const { droppedAsset, keyAsset } = await getClickedAssetAndKeyAsset(credentials);
    const keyAssetId = keyAsset.id;

    const world = await getWorldDetails({ ...credentials, assetId: keyAssetId });

    if (
      !keyAsset.dataObject?.numberAllowedToCollect ||
      !world.dataObject?.keyAssets?.[keyAssetId]?.itemsCollectedByUser
    ) {
      throw "Data objects not found";
    }

    const itemsCollectedByUser = world.dataObject?.keyAssets?.[keyAssetId]?.itemsCollectedByUser;
    const numberAllowedToCollect = keyAsset.dataObject?.numberAllowedToCollect;
    const lastCollectedDate = itemsCollectedByUser?.[profileId]?.lastCollectedDate;
    const differenceInDays = getDifferenceInDays(currentDate, lastCollectedDate);
    const hasCollectedToday = differenceInDays === 0
    let totalCollectedToday = 1,
      total = 1;

    if (
      hasCollectedToday &&
      itemsCollectedByUser?.[profileId]?.totalCollectedToday >= numberAllowedToCollect
    ) {
      return res.json({ addedClick: false, numberAllowedToCollect, success: true });
    } else {
      const promises = [];

      // Move the quest item to a new random location
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
            [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}`]: {
              currentStreak: 1,
              lastCollectedDate: currentDate,
              longestStreak: 1,
              total: 1,
              totalCollectedToday: 1,
              username
            }
          }),
        );
      } else {
        let currentStreak = itemsCollectedByUser[profileId].currentStreak || 1;
        total = itemsCollectedByUser[profileId].total ? itemsCollectedByUser[profileId].total + 1 : 1;

        let longestStreak = itemsCollectedByUser[profileId].longestStreak;
        if (!longestStreak) longestStreak = getLongestStreak(itemsCollectedByUser[profileId]);

        if (lastCollectedDate) {
          if (hasCollectedToday) {
            totalCollectedToday = itemsCollectedByUser[profileId].totalCollectedToday + 1;
          } else if (differenceInDays === 1) {
            currentStreak = currentStreak + 1;
          }
        }

        if (currentStreak > longestStreak) longestStreak = currentStreak;
        if (totalCollectedToday === numberAllowedToCollect) analytics.push("dayCompletedCount");

        promises.push(
          world.updateDataObject({
            [`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}`]: {
              currentStreak,
              lastCollectedDate: currentDate,
              longestStreak,
              total,
              totalCollectedToday,
              username
            },
          }),
        );
      }

      const visitor = await getVisitor({
        credentials,
        urlSlug,
        visitorId,
      });

      if ([50, 100].includes(total)) {
        const grantExpressionResult = await visitor.grantExpression({ name: "quest_1" });

        let title = "🔎 New Emote Unlocked",
          text = "Congrats! Your detective skills paid off.";
        if (grantExpressionResult.data?.statusCode === 409) {
          title = `Congrats! You collected ${total} quest items`;
          text = "Keep up the solid detective work 🔎";
        } else {
          analytics.push("emoteUnlockedCount");
        }

        promises.push(
          visitor.fireToast({
            groupId: "QuestExpression",
            title,
            text,
          }),
        );
      }

      promises.push(visitor.incrementDataObjectValue([`itemsCollectedByWorld.${world.urlSlug}.count`], 1));
      promises.push(
        world.incrementDataObjectValue([`keyAssets.${keyAssetId}.totalItemsCollected.count`], 1, { analytics }),
      );

      await Promise.all(promises);

      return res.json({
        addedClick: true,
        numberAllowedToCollect,
        totalCollectedToday,
        success: true,
      });
    }
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleQuestItemClicked",
      message: "Error updating dropped asset update position, click type, and world/visitor data object",
      req,
      res,
    });
  }
};
